
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _role app_role;
  _phone text;
BEGIN
  _phone := NEW.raw_user_meta_data->>'phone';
  
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), _phone);

  _role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', '')::app_role, 'user');
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);

  IF _role = 'lawyer' THEN
    INSERT INTO public.lawyers (user_id, bar_council_id, city, hourly_rate, specializations, upi_id)
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
      ),
      NEW.raw_user_meta_data->>'upi_id'
    );
  END IF;

  RETURN NEW;
END;
$function$;
