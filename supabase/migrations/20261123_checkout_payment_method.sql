-- Store the customer's selected checkout payment method.
alter table public.orders add column if not exists payment_method text not null default 'cod';

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method in ('cod', 'qr'));

notify pgrst, 'reload schema';
