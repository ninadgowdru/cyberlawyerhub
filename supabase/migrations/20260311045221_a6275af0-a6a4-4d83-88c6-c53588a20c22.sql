
-- Allow lawyers to update their own bookings (for payment verification)
CREATE POLICY "Lawyers can update their bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM lawyers
  WHERE lawyers.id = bookings.lawyer_id AND lawyers.user_id = auth.uid()
));
