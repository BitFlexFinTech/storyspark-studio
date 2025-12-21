-- YouTube channels (multi-channel support)
CREATE TABLE public.youtube_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  channel_id TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  channel_url TEXT,
  thumbnail_url TEXT,
  subscriber_count INTEGER DEFAULT 0,
  video_count INTEGER DEFAULT 0,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.youtube_channels ENABLE ROW LEVEL SECURITY;

-- RLS policies for youtube_channels
CREATE POLICY "Users can view their own YouTube channels"
  ON public.youtube_channels FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own YouTube channels"
  ON public.youtube_channels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own YouTube channels"
  ON public.youtube_channels FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own YouTube channels"
  ON public.youtube_channels FOR DELETE
  USING (auth.uid() = user_id);

-- Integration connections (OAuth state)
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  status TEXT DEFAULT 'disconnected',
  oauth_state TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- RLS policies for integrations
CREATE POLICY "Users can view their own integrations"
  ON public.integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own integrations"
  ON public.integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations"
  ON public.integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations"
  ON public.integrations FOR DELETE
  USING (auth.uid() = user_id);

-- Integration setup progress (wizard state)
CREATE TABLE public.integration_setup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 5,
  step_data JSONB DEFAULT '{}',
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integration_setup ENABLE ROW LEVEL SECURITY;

-- RLS policies for integration_setup
CREATE POLICY "Users can view their own setup progress"
  ON public.integration_setup FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own setup progress"
  ON public.integration_setup FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own setup progress"
  ON public.integration_setup FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own setup progress"
  ON public.integration_setup FOR DELETE
  USING (auth.uid() = user_id);

-- Keyword research results
CREATE TABLE public.keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  keyword TEXT NOT NULL,
  search_volume INTEGER,
  competition_score NUMERIC(5,2),
  outlier_score NUMERIC(5,2),
  trend_direction TEXT,
  related_keywords JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;

-- RLS policies for keywords
CREATE POLICY "Users can view their own keywords"
  ON public.keywords FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own keywords"
  ON public.keywords FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own keywords"
  ON public.keywords FOR DELETE
  USING (auth.uid() = user_id);

-- Competitor tracking
CREATE TABLE public.competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  channel_id TEXT NOT NULL,
  channel_name TEXT,
  subscriber_count INTEGER,
  video_count INTEGER,
  avg_views INTEGER,
  last_video_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

-- RLS policies for competitors
CREATE POLICY "Users can view their own competitors"
  ON public.competitors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own competitors"
  ON public.competitors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own competitors"
  ON public.competitors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own competitors"
  ON public.competitors FOR DELETE
  USING (auth.uid() = user_id);

-- Trend alerts
CREATE TABLE public.trend_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  keyword TEXT NOT NULL,
  alert_type TEXT,
  threshold INTEGER,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trend_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for trend_alerts
CREATE POLICY "Users can view their own trend alerts"
  ON public.trend_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trend alerts"
  ON public.trend_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trend alerts"
  ON public.trend_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trend alerts"
  ON public.trend_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- Video optimization history
CREATE TABLE public.video_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  optimization_type TEXT,
  original_value TEXT,
  optimized_value TEXT,
  performance_before JSONB,
  performance_after JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_optimizations ENABLE ROW LEVEL SECURITY;

-- RLS policies for video_optimizations
CREATE POLICY "Users can view their own video optimizations"
  ON public.video_optimizations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own video optimizations"
  ON public.video_optimizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Optimization bot settings
CREATE TABLE public.optimization_bot_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  is_enabled BOOLEAN DEFAULT true,
  auto_apply BOOLEAN DEFAULT false,
  scan_frequency TEXT DEFAULT 'daily',
  optimization_types TEXT[] DEFAULT ARRAY['thumbnail', 'title'],
  performance_threshold NUMERIC(5,2) DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.optimization_bot_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for optimization_bot_settings
CREATE POLICY "Users can view their own bot settings"
  ON public.optimization_bot_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bot settings"
  ON public.optimization_bot_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bot settings"
  ON public.optimization_bot_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Optimization queue
CREATE TABLE public.optimization_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  optimization_type TEXT,
  current_value TEXT,
  suggested_values JSONB,
  selected_value TEXT,
  status TEXT DEFAULT 'pending',
  performance_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.optimization_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies for optimization_queue
CREATE POLICY "Users can view their own optimization queue"
  ON public.optimization_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own optimization queue items"
  ON public.optimization_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own optimization queue items"
  ON public.optimization_queue FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own optimization queue items"
  ON public.optimization_queue FOR DELETE
  USING (auth.uid() = user_id);

-- A/B test results
CREATE TABLE public.ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  test_type TEXT,
  variant_a TEXT,
  variant_b TEXT,
  variant_a_metrics JSONB,
  variant_b_metrics JSONB,
  winner TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;

-- RLS policies for ab_tests
CREATE POLICY "Users can view their own A/B tests"
  ON public.ab_tests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own A/B tests"
  ON public.ab_tests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own A/B tests"
  ON public.ab_tests FOR UPDATE
  USING (auth.uid() = user_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_youtube_channels_updated_at
  BEFORE UPDATE ON public.youtube_channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();