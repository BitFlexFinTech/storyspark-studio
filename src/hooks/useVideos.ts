import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { mockStories } from '@/data/mockData';

export interface Video {
  id: string;
  story_id: string | null;
  user_id: string;
  title: string;
  duration: string | null;
  status: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useVideos() {
  const { isAuthenticated, isDemoMode, user } = useAuth();

  return useQuery({
    queryKey: ['videos', user?.id],
    queryFn: async () => {
      if (isDemoMode) {
        // Convert mock stories to videos for demo
        return mockStories
          .filter(s => s.status === 'complete')
          .map(s => ({
            id: s.id,
            story_id: s.id,
            user_id: 'demo-user',
            title: s.title,
            duration: s.scenes.reduce((acc, scene) => {
              const [mins, secs] = scene.duration.split(':').map(Number);
              return acc + mins * 60 + secs;
            }, 0).toString(),
            status: 'published',
            thumbnail_url: s.thumbnail,
            video_url: null,
            published_at: s.createdAt,
            created_at: s.createdAt,
            updated_at: s.createdAt,
          })) as Video[];
      }

      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Video[];
    },
    enabled: isAuthenticated,
  });
}

export function useVideo(id: string) {
  const { isDemoMode } = useAuth();

  return useQuery({
    queryKey: ['video', id],
    queryFn: async () => {
      if (isDemoMode) {
        const story = mockStories.find(s => s.id === id);
        if (!story) return null;
        return {
          id: story.id,
          story_id: story.id,
          user_id: 'demo-user',
          title: story.title,
          duration: null,
          status: story.status === 'complete' ? 'published' : 'draft',
          thumbnail_url: story.thumbnail,
          video_url: null,
          published_at: null,
          created_at: story.createdAt,
          updated_at: story.createdAt,
        } as Video;
      }

      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Video | null;
    },
    enabled: !!id,
  });
}

export function useCreateVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (video: Omit<Video, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('videos')
        .insert({ ...video, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
}

export function useUpdateVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Video> & { id: string }) => {
      const { data, error } = await supabase
        .from('videos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['video', variables.id] });
    },
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
}
