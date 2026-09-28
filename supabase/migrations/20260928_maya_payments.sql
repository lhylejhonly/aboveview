-- Payment state for Maya Checkout. Safe to run more than once.
alter table public.orders add column if not exists payment_status text not null default 'unpaid';
alter table public.orders add column if not exists payment_provider text;
alter table public.orders add column if not exists payment_reference text;
alter table public.orders add column if not exists paid_at timestamptz;

alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check
  check (payment_status in ('unpaid', 'checkout_created', 'paid', 'failed', 'refunded'));

create index if not exists orders_payment_reference_idx on public.orders(payment_reference);
notify pgrst, 'reload schema';
