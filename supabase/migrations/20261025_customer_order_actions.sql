-- Allow customer-facing cancellation and return states.
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled', 'returned'));

notify pgrst, 'reload schema';
