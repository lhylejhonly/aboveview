-- COD orders require a 50% deposit before the seller prepares them.
alter table public.orders add column if not exists deposit_amount numeric(12, 2) not null default 0;
alter table public.orders add column if not exists deposit_status text not null default 'not_required';
alter table public.orders add column if not exists deposit_verified_at timestamptz;

alter table public.orders drop constraint if exists orders_deposit_status_check;
alter table public.orders add constraint orders_deposit_status_check
  check (deposit_status in ('not_required', 'pending', 'verified', 'rejected'));

alter table public.orders drop constraint if exists orders_deposit_amount_check;
alter table public.orders add constraint orders_deposit_amount_check
  check (deposit_amount >= 0);

notify pgrst, 'reload schema';
