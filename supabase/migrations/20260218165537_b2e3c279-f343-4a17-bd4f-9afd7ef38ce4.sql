
-- Fix: Change restrictive SELECT policies to permissive on lawyers and profiles tables
-- Current policies are RESTRICTIVE which blocks all access without a permissive policy

-- Drop and recreate lawyers SELECT policy as PERMISSIVE
DROP POLICY IF EXISTS "Anyone can view lawyers" ON public.lawyers;
CREATE POLICY "Anyone can view lawyers"
  ON public.lawyers
  FOR SELECT
  USING (true);

-- Drop and recreate profiles SELECT policy as PERMISSIVE
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Also fix lawyer_availability SELECT policy
DROP POLICY IF EXISTS "Anyone can view availability" ON public.lawyer_availability;
CREATE POLICY "Anyone can view availability"
  ON public.lawyer_availability
  FOR SELECT
  USING (true);
