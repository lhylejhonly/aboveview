-- New checkout orders use QR payment only. Existing COD orders remain readable
-- in the admin workspace for historical records.
alter table public.orders alter column payment_method set default 'qr';

notify pgrst, 'reload schema';
