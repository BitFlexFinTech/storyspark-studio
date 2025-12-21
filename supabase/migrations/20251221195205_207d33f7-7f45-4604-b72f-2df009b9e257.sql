-- Create competitor_videos table for tracking competitor video performance
CREATE TABLE public.competitor_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES public.competitors(id) ON DELETE CASCADE,
  youtube_video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  thumbnail_url TEXT,
  published_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(competitor_id, youtube_video_id)
);

-- Enable RLS
ALTER TABLE public.competitor_videos ENABLE ROW LEVEL SECURITY;

-- Users can view competitor videos they track
CREATE POLICY "Users can view their tracked competitor videos"
  ON public.competitor_videos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.competitors 
      WHERE competitors.id = competitor_videos.competitor_id 
      AND competitors.user_id = auth.uid()
    )
  );

-- Service role can insert competitor videos
CREATE POLICY "Service role can insert competitor videos"
  ON public.competitor_videos FOR INSERT
  WITH CHECK (true);

-- Service role can update competitor videos
CREATE POLICY "Service role can update competitor videos"
  ON public.competitor_videos FOR UPDATE
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_competitor_videos_competitor_id ON public.competitor_videos(competitor_id);
CREATE INDEX idx_competitor_videos_published_at ON public.competitor_videos(published_at DESC);