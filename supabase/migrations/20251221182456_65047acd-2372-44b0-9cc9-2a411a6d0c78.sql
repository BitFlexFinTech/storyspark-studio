-- Create competitor_alerts table for user-defined alert rules
CREATE TABLE public.competitor_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  competitor_id UUID REFERENCES public.competitors(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'new_video', 'milestone_subscribers', 'milestone_views', 'trending_video'
  threshold INTEGER, -- For milestones (e.g., 100000 subscribers)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on competitor_alerts
ALTER TABLE public.competitor_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for competitor_alerts
CREATE POLICY "Users can view their own alerts" ON public.competitor_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alerts" ON public.competitor_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" ON public.competitor_alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts" ON public.competitor_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- Create notifications table for triggered alerts
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  alert_id UUID REFERENCES public.competitor_alerts(id) ON DELETE SET NULL,
  competitor_id UUID REFERENCES public.competitors(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- 'new_video', 'milestone', 'trending', 'system'
  is_read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Service role can insert notifications (for cron job)
CREATE POLICY "Service role can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Create scheduled_content table for content calendar
CREATE TABLE public.scheduled_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  video_id UUID REFERENCES public.videos(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  status TEXT DEFAULT 'planned', -- 'planned', 'ready', 'published', 'skipped'
  notes TEXT,
  suggested_by_ai BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on scheduled_content
ALTER TABLE public.scheduled_content ENABLE ROW LEVEL SECURITY;

-- RLS policies for scheduled_content
CREATE POLICY "Users can view their own scheduled content" ON public.scheduled_content
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scheduled content" ON public.scheduled_content
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled content" ON public.scheduled_content
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled content" ON public.scheduled_content
  FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updated_at on scheduled_content
CREATE TRIGGER update_scheduled_content_updated_at
  BEFORE UPDATE ON public.scheduled_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();