-- Scheduled voucher activation and expiry window.
alter table public.vouchers add column if not exists starts_at timestamptz;

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
  if new.voucher_code is null or btrim(new.voucher_code) = '' then return new; end if;
  new.voucher_code = upper(btrim(new.voucher_code));
  select p.price, v.discount_percent, v.usage_limit, v.used_count
    into base_price, discount_percent, voucher_limit, voucher_used
  from public.products p
  join public.vouchers v on v.id = 'current' and v.code = new.voucher_code
  where p.id = new.product_id
    and v.is_active = true
    and (v.starts_at is null or v.starts_at <= now())
    and (v.expires_at is null or v.expires_at >= now())
  for update of p, v;
  if not found then raise exception 'Voucher is not active yet, expired, or unavailable.' using errcode = 'check_violation'; end if;
  if voucher_limit is not null and voucher_used >= voucher_limit then raise exception 'Voucher usage limit has been reached.' using errcode = 'check_violation'; end if;
  new.discount_amount = round(base_price * new.quantity * discount_percent / 100, 2);
  new.unit_price = round((base_price * new.quantity - new.discount_amount) / new.quantity, 2);
  update public.vouchers set used_count = used_count + 1 where id = 'current';
  return new;
end;
$$;

notify pgrst, 'reload schema';
