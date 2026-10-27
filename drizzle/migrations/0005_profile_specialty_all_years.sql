CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  y smallint;
  s text;
BEGIN
  BEGIN
    y := NULLIF(NEW.raw_user_meta_data->>'academic_year','')::smallint;
  EXCEPTION WHEN others THEN y := NULL; END;
  IF y IS NOT NULL AND (y < 1 OR y > 5) THEN y := NULL; END IF;
  s := NEW.raw_user_meta_data->>'specialty';
  IF s NOT IN ('DIB','DMS') THEN s := NULL; END IF;
  INSERT INTO public.profiles (id, first_name, last_name, email, academic_year, specialty)
  VALUES (
    NEW.id,
    left(coalesce(NEW.raw_user_meta_data->>'first_name',''), 60),
    left(coalesce(NEW.raw_user_meta_data->>'last_name',''), 60),
    coalesce(NEW.email,''),
    y, s
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;