ALTER TABLE public.lawyers DROP CONSTRAINT lawyers_hourly_rate_check;
ALTER TABLE public.lawyers ADD CONSTRAINT lawyers_hourly_rate_check CHECK (hourly_rate >= 500 AND hourly_rate <= 500000);