
-- Update handle_new_user trigger to also insert default role from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _role app_role;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

  -- Insert role from metadata, default to 'user'
  _role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', '')::app_role, 'user');
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);

  RETURN NEW;
END;
$$;

-- Ensure the trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix missing role for existing test user
INSERT INTO public.user_roles (user_id, role) 
VALUES ('3a876472-af25-4d25-aef8-34819f6576e5', 'user')
ON CONFLICT DO NOTHING;
