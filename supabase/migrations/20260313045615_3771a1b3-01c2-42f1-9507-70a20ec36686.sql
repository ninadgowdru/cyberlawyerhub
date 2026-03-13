ALTER TABLE public.bookings DROP CONSTRAINT bookings_duration_minutes_check;
ALTER TABLE public.bookings DROP CONSTRAINT bookings_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'cancelled'::text, 'refunded'::text, 'pending_verification'::text, 'confirmed'::text, 'rejected'::text]));