CREATE TABLE IF NOT EXISTS public.wilaya_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  author_name text NOT NULL DEFAULT '',
  wilaya_code smallint NOT NULL CHECK (wilaya_code BETWEEN 1 AND 58),
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.wilaya_posts TO authenticated;
GRANT ALL ON public.wilaya_posts TO service_role;
ALTER TABLE public.wilaya_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signed-in read posts" ON public.wilaya_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "own post insert" ON public.wilaya_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own post delete" ON public.wilaya_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS wilaya_posts_code_created_idx ON public.wilaya_posts (wilaya_code, created_at DESC);

CREATE TABLE IF NOT EXISTS public.shared_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  author_name text NOT NULL DEFAULT '',
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 150),
  path text NOT NULL,
  file_type text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.shared_files TO authenticated;
GRANT ALL ON public.shared_files TO service_role;
ALTER TABLE public.shared_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signed-in read files" ON public.shared_files FOR SELECT TO authenticated USING (true);
CREATE POLICY "own file insert" ON public.shared_files FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own file delete" ON public.shared_files FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "signed-in read knowledge" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'knowledge');
CREATE POLICY "own upload knowledge" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'knowledge' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own delete knowledge" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'knowledge' AND (storage.foldername(name))[1] = auth.uid()::text);