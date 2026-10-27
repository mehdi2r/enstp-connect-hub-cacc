CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  academic_year smallint,
  specialty text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT academic_year_range CHECK (academic_year IS NULL OR academic_year BETWEEN 1 AND 5),
  CONSTRAINT specialty_values CHECK (specialty IS NULL OR specialty IN ('DIB','DMS')),
  CONSTRAINT specialty_required CHECK (academic_year IS NULL OR academic_year < 3 OR specialty IS NOT NULL)
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

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
  IF s NOT IN ('DIB','DMS') OR y IS NULL OR y < 3 THEN s := NULL; END IF;
  IF y >= 3 AND s IS NULL THEN y := NULL; END IF;
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

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();