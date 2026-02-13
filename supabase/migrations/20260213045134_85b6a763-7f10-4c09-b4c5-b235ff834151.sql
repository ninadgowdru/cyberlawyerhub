
-- Add foreign key from lawyers.user_id to profiles.user_id
ALTER TABLE public.lawyers
  ADD CONSTRAINT lawyers_user_id_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);

-- Create bookings table
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lawyer_id uuid NOT NULL REFERENCES public.lawyers(id),
  duration_minutes integer NOT NULL CHECK (duration_minutes IN (30, 60)),
  base_amount integer NOT NULL,
  platform_fee integer NOT NULL,
  total_amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'inr',
  stripe_session_id text,
  stripe_payment_intent_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own bookings
CREATE POLICY "Users can create own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Lawyers can view bookings for them
CREATE POLICY "Lawyers can view their bookings"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lawyers
      WHERE lawyers.id = bookings.lawyer_id
      AND lawyers.user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
