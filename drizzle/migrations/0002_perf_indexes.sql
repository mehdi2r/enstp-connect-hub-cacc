CREATE INDEX IF NOT EXISTS chat_threads_user_updated_idx ON public.chat_threads (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS chat_messages_thread_created_idx ON public.chat_messages (thread_id, created_at);
CREATE INDEX IF NOT EXISTS approved_videos_created_idx ON public.approved_videos (created_at DESC);