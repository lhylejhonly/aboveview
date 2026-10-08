-- 10.10 voucher fields for customer orders. Safe to run more than once.
alter table public.orders add column if not exists voucher_code text;
alter table public.orders add column if not exists discount_amount numeric(12, 2) not null default 0;

alter table public.orders drop constraint if exists orders_discount_amount_check;
alter table public.orders add constraint orders_discount_amount_check check (discount_amount >= 0);

notify pgrst, 'reload schema';

-- Admin-managed active voucher. The server reads this row for validation.
create table if not exists public.vouchers (
  id text primary key,
  code text not null unique,
  discount_percent numeric(5, 2) not null check (discount_percent > 0 and discount_percent <= 100),
  is_active boolean not null default true,
  expires_at timestamptz,
  usage_limit integer,
  used_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vouchers add column if not exists usage_limit integer;
alter table public.vouchers add column if not exists used_count integer not null default 0;
alter table public.vouchers drop constraint if exists vouchers_usage_limit_check;
alter table public.vouchers add constraint vouchers_usage_limit_check check (usage_limit is null or usage_limit > 0);
alter table public.vouchers drop constraint if exists vouchers_used_count_check;
alter table public.vouchers add constraint vouchers_used_count_check check (used_count >= 0);

alter table public.vouchers enable row level security;
drop policy if exists "public can view active voucher" on public.vouchers;
create policy "public can view active voucher" on public.vouchers
  for select to anon, authenticated using (is_active = true);

insert into public.vouchers (id, code, discount_percent, is_active)
values ('current', '10.10', 10, true)
on conflict (id) do nothing;

drop trigger if exists vouchers_set_updated_at on public.vouchers;
create trigger vouchers_set_updated_at
before update on public.vouchers
for each row execute function public.set_updated_at();

-- Claim a voucher use atomically when an order is created.
create or replace function public.consume_voucher()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.voucher_code is null or btrim(new.voucher_code) = '' then
    return new;
  end if;

  new.voucher_code = upper(btrim(new.voucher_code));
  update public.vouchers
  set used_count = used_count + 1
  where id = 'current'
    and code = new.voucher_code
    and is_active = true
    and (expires_at is null or expires_at >= now())
    and (usage_limit is null or used_count < usage_limit);

  if not found then
    raise exception 'Voucher is invalid, expired, or fully redeemed.' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists orders_consume_voucher on public.orders;
create trigger orders_consume_voucher
before insert on public.orders
for each row execute function public.consume_voucher();

notify pgrst, 'reload schema';
