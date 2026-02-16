
-- Create lawyer_availability table for managing time slots
CREATE TABLE public.lawyer_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lawyer_id UUID NOT NULL REFERENCES public.lawyers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lawyer_id, date, start_time)
);

-- Enable RLS
ALTER TABLE public.lawyer_availability ENABLE ROW LEVEL SECURITY;

-- Anyone can view available slots
CREATE POLICY "Anyone can view availability"
  ON public.lawyer_availability FOR SELECT
  USING (true);

-- Lawyers can manage their own slots
CREATE POLICY "Lawyers can insert own availability"
  ON public.lawyer_availability FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.lawyers WHERE lawyers.id = lawyer_id AND lawyers.user_id = auth.uid()
  ));

CREATE POLICY "Lawyers can update own availability"
  ON public.lawyer_availability FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.lawyers WHERE lawyers.id = lawyer_id AND lawyers.user_id = auth.uid()
  ));

CREATE POLICY "Lawyers can delete own availability"
  ON public.lawyer_availability FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.lawyers WHERE lawyers.id = lawyer_id AND lawyers.user_id = auth.uid()
  ));

-- Add start_time column to bookings for scheduling
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE;

-- Index for fast lookups
CREATE INDEX idx_lawyer_availability_lookup ON public.lawyer_availability(lawyer_id, date, is_booked);
CREATE INDEX idx_bookings_user ON public.bookings(user_id, status);
CREATE INDEX idx_bookings_lawyer ON public.bookings(lawyer_id, status);
