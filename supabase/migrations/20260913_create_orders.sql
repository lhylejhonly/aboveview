-- Creates the existing checkout order table in the production Supabase project.
-- Safe to run more than once.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('AV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  user_id uuid not null references auth.users(id) on delete restrict,
  product_id text not null references public.products(id) on delete restrict,
  product_name text not null,
  product_code text not null,
  size text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  full_name text not null,
  contact_number text not null,
  destination text not null,
  address text not null,
  delivery_notes text not null default '',
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists "customers can view own orders" on public.orders;
drop policy if exists "customers can create own orders" on public.orders;

create policy "customers can view own orders"
  on public.orders for select to authenticated
  using (user_id = auth.uid());

create policy "customers can create own orders"
  on public.orders for insert to authenticated
  with check (user_id = auth.uid());

notify pgrst, 'reload schema';
