-- Customer product ratings and comments.
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null default 'Customer',
  rating integer not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 1 and 1000),
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);

create index if not exists product_reviews_product_idx
  on public.product_reviews(product_id, created_at desc);

alter table public.product_reviews enable row level security;

drop policy if exists "product reviews are publicly readable" on public.product_reviews;
create policy "product reviews are publicly readable"
  on public.product_reviews for select to anon, authenticated using (true);

drop policy if exists "customers can create own product review" on public.product_reviews;
create policy "customers can create own product review"
  on public.product_reviews for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "customers can update own product review" on public.product_reviews;
create policy "customers can update own product review"
  on public.product_reviews for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "customers can delete own product review" on public.product_reviews;
create policy "customers can delete own product review"
  on public.product_reviews for delete to authenticated
  using (user_id = auth.uid());

alter publication supabase_realtime add table public.product_reviews;
