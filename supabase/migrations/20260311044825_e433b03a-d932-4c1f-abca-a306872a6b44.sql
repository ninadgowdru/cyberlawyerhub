
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_reference_id text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS case_description text;
ALTER TABLE public.bookings ALTER COLUMN duration_minutes SET DEFAULT 0;
ALTER TABLE public.lawyers ADD COLUMN IF NOT EXISTS upi_id text;
