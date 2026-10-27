ALTER TABLE public.wilaya_posts ADD COLUMN parent_id uuid REFERENCES public.wilaya_posts(id) ON DELETE CASCADE;
CREATE INDEX wilaya_posts_parent_idx ON public.wilaya_posts(parent_id);