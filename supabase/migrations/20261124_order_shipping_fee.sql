-- Rule-based shipping fee saved on each order until courier rates are integrated.
alter table public.orders add column if not exists shipping_fee numeric(12, 2) not null default 0;

alter table public.orders drop constraint if exists orders_shipping_fee_check;
alter table public.orders add constraint orders_shipping_fee_check
  check (shipping_fee >= 0);

notify pgrst, 'reload schema';
