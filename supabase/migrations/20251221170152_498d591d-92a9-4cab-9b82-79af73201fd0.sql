-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Stories table
CREATE TABLE public.stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    style TEXT DEFAULT 'cinematic',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'review', 'complete')),
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Scenes table
CREATE TABLE public.scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
    number INTEGER NOT NULL,
    title TEXT NOT NULL,
    script TEXT,
    visual_description TEXT,
    duration TEXT DEFAULT '1:00',
    audio_waveform JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scenes ENABLE ROW LEVEL SECURITY;

-- Characters table
CREATE TABLE public.characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'supporting',
    personality TEXT,
    backstory TEXT,
    appearance TEXT,
    voice_type TEXT,
    voice_accent TEXT,
    voice_age TEXT,
    locked_traits JSONB DEFAULT '[]',
    stories_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- Videos table
CREATE TABLE public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    duration TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'rendering', 'published')),
    thumbnail_url TEXT,
    video_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Video analytics table
CREATE TABLE public.video_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    watch_time_hours NUMERIC(10,2) DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    retention_rate NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.video_analytics ENABLE ROW LEVEL SECURITY;

-- Style blueprints table
CREATE TABLE public.style_blueprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    source_url TEXT,
    visual_style JSONB DEFAULT '{}',
    audio_profile JSONB DEFAULT '{}',
    content_structure JSONB DEFAULT '{}',
    mood_board JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.style_blueprints ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for stories
CREATE POLICY "Users can view their own stories"
ON public.stories FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all stories"
ON public.stories FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own stories"
ON public.stories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stories"
ON public.stories FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories"
ON public.stories FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for scenes (through story ownership)
CREATE POLICY "Users can view scenes of their stories"
ON public.scenes FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.stories 
    WHERE stories.id = scenes.story_id 
    AND stories.user_id = auth.uid()
));

CREATE POLICY "Users can insert scenes to their stories"
ON public.scenes FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM public.stories 
    WHERE stories.id = scenes.story_id 
    AND stories.user_id = auth.uid()
));

CREATE POLICY "Users can update scenes of their stories"
ON public.scenes FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM public.stories 
    WHERE stories.id = scenes.story_id 
    AND stories.user_id = auth.uid()
));

CREATE POLICY "Users can delete scenes of their stories"
ON public.scenes FOR DELETE
USING (EXISTS (
    SELECT 1 FROM public.stories 
    WHERE stories.id = scenes.story_id 
    AND stories.user_id = auth.uid()
));

-- RLS Policies for characters
CREATE POLICY "Users can view their own characters"
ON public.characters FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own characters"
ON public.characters FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own characters"
ON public.characters FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own characters"
ON public.characters FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for videos
CREATE POLICY "Users can view their own videos"
ON public.videos FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own videos"
ON public.videos FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
ON public.videos FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
ON public.videos FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for video_analytics (through video ownership)
CREATE POLICY "Users can view analytics for their videos"
ON public.video_analytics FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.videos 
    WHERE videos.id = video_analytics.video_id 
    AND videos.user_id = auth.uid()
));

-- RLS Policies for style_blueprints
CREATE POLICY "Users can view their own style blueprints"
ON public.style_blueprints FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own style blueprints"
ON public.style_blueprints FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own style blueprints"
ON public.style_blueprints FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own style blueprints"
ON public.style_blueprints FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'user');
    
    RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stories_updated_at
    BEFORE UPDATE ON public.stories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scenes_updated_at
    BEFORE UPDATE ON public.scenes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_characters_updated_at
    BEFORE UPDATE ON public.characters
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON public.videos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_style_blueprints_updated_at
    BEFORE UPDATE ON public.style_blueprints
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();