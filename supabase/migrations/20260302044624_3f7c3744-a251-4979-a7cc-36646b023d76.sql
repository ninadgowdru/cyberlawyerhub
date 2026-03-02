
-- Fix: All policies were RESTRICTIVE (all must pass). They need to be PERMISSIVE (any one passes).
-- Drop and recreate as PERMISSIVE for user_roles, bookings, fir_reports, profiles, lawyers, lawyer_availability.

-- ===== user_roles =====
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all user roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own role" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update user roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete user roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ===== bookings =====
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Lawyers can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON public.bookings;

CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Lawyers can view their bookings" ON public.bookings FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM lawyers WHERE lawyers.id = bookings.lawyer_id AND lawyers.user_id = auth.uid()));
CREATE POLICY "Users can create own bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all bookings" ON public.bookings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update bookings" ON public.bookings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ===== fir_reports =====
DROP POLICY IF EXISTS "Users can view own FIR reports" ON public.fir_reports;
DROP POLICY IF EXISTS "Users can create FIR reports" ON public.fir_reports;
DROP POLICY IF EXISTS "Admins can view all FIR reports" ON public.fir_reports;
DROP POLICY IF EXISTS "Admins can update FIR reports" ON public.fir_reports;

CREATE POLICY "Users can view own FIR reports" ON public.fir_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create FIR reports" ON public.fir_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all FIR reports" ON public.fir_reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update FIR reports" ON public.fir_reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ===== profiles =====
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ===== lawyers =====
DROP POLICY IF EXISTS "Anyone can view lawyers" ON public.lawyers;
DROP POLICY IF EXISTS "Lawyers can insert own profile" ON public.lawyers;
DROP POLICY IF EXISTS "Lawyers can update own profile" ON public.lawyers;
DROP POLICY IF EXISTS "Admins can update lawyers" ON public.lawyers;

CREATE POLICY "Anyone can view lawyers" ON public.lawyers FOR SELECT USING (true);
CREATE POLICY "Lawyers can insert own profile" ON public.lawyers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Lawyers can update own profile" ON public.lawyers FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can update lawyers" ON public.lawyers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ===== lawyer_availability =====
DROP POLICY IF EXISTS "Anyone can view availability" ON public.lawyer_availability;
DROP POLICY IF EXISTS "Lawyers can insert own availability" ON public.lawyer_availability;
DROP POLICY IF EXISTS "Lawyers can update own availability" ON public.lawyer_availability;
DROP POLICY IF EXISTS "Lawyers can delete own availability" ON public.lawyer_availability;

CREATE POLICY "Anyone can view availability" ON public.lawyer_availability FOR SELECT USING (true);
CREATE POLICY "Lawyers can insert own availability" ON public.lawyer_availability FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM lawyers WHERE lawyers.id = lawyer_availability.lawyer_id AND lawyers.user_id = auth.uid()));
CREATE POLICY "Lawyers can update own availability" ON public.lawyer_availability FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM lawyers WHERE lawyers.id = lawyer_availability.lawyer_id AND lawyers.user_id = auth.uid()));
CREATE POLICY "Lawyers can delete own availability" ON public.lawyer_availability FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM lawyers WHERE lawyers.id = lawyer_availability.lawyer_id AND lawyers.user_id = auth.uid()));

-- Insert missing role for existing user
INSERT INTO public.user_roles (user_id, role) VALUES ('588e5a1b-6d24-47e1-a945-d2cd64f6cdc8', 'user') ON CONFLICT DO NOTHING;
