-- Above Viewing catalog schema
-- Run this once in Supabase SQL Editor.

create table if not exists public.categories (
  id text primary key,
  label text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  code text not null,
  category text not null,
  price numeric(12, 2) not null default 0,
  original_price numeric(12, 2),
  currency text not null default '₱',
  description text not null default '',
  front_image text not null default '',
  back_image text not null default '',
  front_feature_highlight text,
  back_feature_highlight text,
  fabric_details text not null default '',
  gsm integer not null default 0,
  fit_type text not null default '',
  colors jsonb not null default '[]'::jsonb,
  sizes jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  tiktok_shop_url text not null default '',
  stock_count integer not null default 0,
  rating numeric(3, 2) not null default 5,
  review_count integer not null default 0,
  is_new boolean not null default false,
  is_bestseller boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category);
create index if not exists products_created_at_idx on public.products(created_at desc);

create table if not exists public.customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '', contact_number text not null default '', destination text not null default '',
  address text not null default '', delivery_notes text not null default '', updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('AV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  user_id uuid not null references auth.users(id) on delete restrict,
  product_id text not null references public.products(id) on delete restrict,
  product_name text not null, product_code text not null, size text not null,
  quantity integer not null check (quantity > 0), unit_price numeric(12, 2) not null check (unit_price >= 0),
  full_name text not null, contact_number text not null, destination text not null, address text not null,
  delivery_notes text not null default '', status text not null default 'pending' check (status in ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.customer_profiles enable row level security;
alter table public.orders enable row level security;
drop policy if exists "customers can view own profile" on public.customer_profiles;
drop policy if exists "customers can insert own profile" on public.customer_profiles;
drop policy if exists "customers can update own profile" on public.customer_profiles;
create policy "customers can view own profile" on public.customer_profiles for select to authenticated using (id = auth.uid());
create policy "customers can insert own profile" on public.customer_profiles for insert to authenticated with check (id = auth.uid());
create policy "customers can update own profile" on public.customer_profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "customers can view own orders" on public.orders;
drop policy if exists "customers can create own orders" on public.orders;
create policy "customers can view own orders" on public.orders for select to authenticated using (user_id = auth.uid());
create policy "customers can create own orders" on public.orders for insert to authenticated with check (user_id = auth.uid());

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

drop policy if exists "product image read access" on storage.objects;
drop policy if exists "product image upload access" on storage.objects;
drop policy if exists "product image update access" on storage.objects;
drop policy if exists "product image delete access" on storage.objects;
create policy "product image read access" on storage.objects for select to anon, authenticated using (bucket_id = 'products');
-- Writes are performed by the server using the Supabase service role key.

-- Public users can read the catalog. Admin writes go through protected server routes.
alter table public.categories enable row level security;
alter table public.products enable row level security;

drop policy if exists "catalog read access" on public.categories;
drop policy if exists "product read access" on public.products;
create policy "catalog read access" on public.categories for select to anon, authenticated using (true);
create policy "product read access" on public.products for select to anon, authenticated using (true);
