-- Keep product review totals accurate and prevent reviews before a product launches.
create or replace function public.validate_product_review()
returns trigger language plpgsql security definer set search_path = public as $$
declare coming_soon boolean;
begin
  select is_coming_soon into coming_soon from public.products where id = new.product_id;
  if coming_soon is null then raise exception 'Product does not exist.'; end if;
  if coming_soon then raise exception 'This product is not available for reviews yet.'; end if;
  return new;
end;
$$;

create or replace function public.refresh_product_review_summary()
returns trigger language plpgsql security definer set search_path = public as $$
declare target_product_id text;
begin
  target_product_id := coalesce(new.product_id, old.product_id);
  update public.products
  set review_count = (select count(*) from public.product_reviews where product_id = target_product_id),
      rating = coalesce((select round(avg(rating)::numeric, 2) from public.product_reviews where product_id = target_product_id), 0)
  where id = target_product_id;
  return coalesce(new, old);
end;
$$;

drop trigger if exists product_reviews_validate on public.product_reviews;
create trigger product_reviews_validate before insert or update on public.product_reviews
for each row execute function public.validate_product_review();

drop trigger if exists product_reviews_refresh_summary on public.product_reviews;
create trigger product_reviews_refresh_summary after insert or update or delete on public.product_reviews
for each row execute function public.refresh_product_review_summary();

create or replace function public.validate_customer_order_product()
returns trigger language plpgsql security definer set search_path = public as $$
declare product_available boolean; available_stock integer;
begin
  select (not is_coming_soon), stock_count into product_available, available_stock
  from public.products where id = new.product_id for update;
  if product_available is not true or available_stock is null then raise exception 'This product is not available for ordering.'; end if;
  if new.quantity > available_stock then raise exception 'The requested quantity is not available.'; end if;
  return new;
end;
$$;

drop trigger if exists orders_validate_product on public.orders;
create trigger orders_validate_product before insert on public.orders
for each row execute function public.validate_customer_order_product();

create or replace function public.reserve_order_stock()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status <> 'cancelled' then
    update public.products set stock_count = stock_count - new.quantity where id = new.product_id;
  end if;
  return new;
end;
$$;

create or replace function public.restore_cancelled_order_stock()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.status <> 'cancelled' and new.status = 'cancelled' then
    update public.products set stock_count = stock_count + old.quantity where id = old.product_id;
  elsif old.status = 'cancelled' and new.status <> 'cancelled' then
    update public.products set stock_count = greatest(0, stock_count - new.quantity) where id = new.product_id;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_reserve_stock on public.orders;
create trigger orders_reserve_stock after insert on public.orders
for each row execute function public.reserve_order_stock();

drop trigger if exists orders_restore_cancelled_stock on public.orders;
create trigger orders_restore_cancelled_stock after update of status on public.orders
for each row execute function public.restore_cancelled_order_stock();
