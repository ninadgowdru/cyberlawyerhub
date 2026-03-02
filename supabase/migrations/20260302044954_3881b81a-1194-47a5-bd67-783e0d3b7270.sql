
-- Enhanced trigger to also create lawyer profile and set phone from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _role app_role;
  _phone text;
BEGIN
  _phone := NEW.raw_user_meta_data->>'phone';
  
  -- Insert profile
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), _phone);

  -- Insert role from metadata, default to 'user'
  _role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', '')::app_role, 'user');
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);

  -- If lawyer role, create lawyer profile from metadata
  IF _role = 'lawyer' THEN
    INSERT INTO public.lawyers (user_id, bar_council_id, city, hourly_rate, specializations)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'bar_council_id', ''),
      COALESCE(NEW.raw_user_meta_data->>'city', 'Delhi'),
      COALESCE((NEW.raw_user_meta_data->>'hourly_rate')::integer, 1000),
      COALESCE(
        ARRAY(SELECT jsonb_array_elements_text(
          CASE WHEN NEW.raw_user_meta_data->'specializations' IS NOT NULL 
          THEN NEW.raw_user_meta_data->'specializations'
          ELSE '[]'::jsonb END
        )),
        '{}'::text[]
      )
    );
  END IF;

  RETURN NEW;
END;
$$;
