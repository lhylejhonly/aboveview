-- Repair voucher checkout behavior for production databases.
-- This makes the discount and usage counter authoritative in the database.

alter table public.orders add column if not exists voucher_code text;
alter table public.orders add column if not exists discount_amount numeric(12, 2) not null default 0;

create or replace function public.apply_order_voucher()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_price numeric(12, 2);
  discount_percent numeric(5, 2);
  voucher_limit integer;
  voucher_used integer;
begin
  if new.voucher_code is null or btrim(new.voucher_code) = '' then
    return new;
  end if;

  new.voucher_code = upper(btrim(new.voucher_code));
  select p.price, v.discount_percent, v.usage_limit, v.used_count
    into base_price, discount_percent, voucher_limit, voucher_used
  from public.products p
  join public.vouchers v on v.id = 'current' and v.code = new.voucher_code
  where p.id = new.product_id
    and v.is_active = true
    and (v.expires_at is null or v.expires_at >= now())
  for update of p, v;

  if not found then
    raise exception 'Voucher is invalid, expired, or unavailable.' using errcode = 'check_violation';
  end if;
  if voucher_limit is not null and voucher_used >= voucher_limit then
    raise exception 'Voucher usage limit has been reached.' using errcode = 'check_violation';
  end if;

  new.discount_amount = round(base_price * new.quantity * discount_percent / 100, 2);
  new.unit_price = round((base_price * new.quantity - new.discount_amount) / new.quantity, 2);
  update public.vouchers set used_count = used_count + 1 where id = 'current';
  return new;
end;
$$;

drop trigger if exists orders_consume_voucher on public.orders;
drop trigger if exists orders_apply_voucher on public.orders;
create trigger orders_apply_voucher
before insert on public.orders
for each row execute function public.apply_order_voucher();

-- Reconcile counts for orders created before this repair migration.
update public.vouchers v
set used_count = (
  select count(*)::integer
  from public.orders o
  where upper(btrim(coalesce(o.voucher_code, ''))) = v.code
    and o.status <> 'cancelled'
)
where v.id = 'current';

create or replace function public.restore_voucher_use_on_cancel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status <> 'cancelled' and new.status = 'cancelled' and new.voucher_code is not null then
    update public.vouchers
    set used_count = greatest(0, used_count - 1)
    where id = 'current' and code = upper(btrim(new.voucher_code));
  elsif old.status = 'cancelled' and new.status <> 'cancelled' and new.voucher_code is not null then
    update public.vouchers
    set used_count = used_count + 1
    where id = 'current'
      and code = upper(btrim(new.voucher_code))
      and (usage_limit is null or used_count < usage_limit);
    if not found then
      raise exception 'Voucher usage limit has been reached.' using errcode = 'check_violation';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_restore_voucher_use on public.orders;
create trigger orders_restore_voucher_use
after update of status on public.orders
for each row execute function public.restore_voucher_use_on_cancel();

notify pgrst, 'reload schema';
