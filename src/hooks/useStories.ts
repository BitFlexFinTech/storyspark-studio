import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { mockStories } from '@/data/mockData';

export interface Story {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  style: string | null;
  status: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useStories() {
  const { isAuthenticated, isDemoMode, user } = useAuth();

  return useQuery({
    queryKey: ['stories', user?.id],
    queryFn: async () => {
      if (isDemoMode) {
        return mockStories.map(s => ({
          id: s.id,
          user_id: 'demo-user',
          title: s.title,
          description: s.description,
          style: s.style,
          status: s.status,
          thumbnail_url: s.thumbnail,
          created_at: s.createdAt,
          updated_at: s.createdAt,
        })) as Story[];
      }

      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Story[];
    },
    enabled: isAuthenticated,
  });
}

export function useStory(id: string) {
  const { isDemoMode } = useAuth();

  return useQuery({
    queryKey: ['story', id],
    queryFn: async () => {
      if (isDemoMode) {
        const story = mockStories.find(s => s.id === id);
        if (!story) return null;
        return {
          id: story.id,
          user_id: 'demo-user',
          title: story.title,
          description: story.description,
          style: story.style,
          status: story.status,
          thumbnail_url: story.thumbnail,
          created_at: story.createdAt,
          updated_at: story.createdAt,
          scenes: story.scenes,
        };
      }

      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (story: Omit<Story, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('stories')
        .insert({ ...story, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}

export function useUpdateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Story> & { id: string }) => {
      const { data, error } = await supabase
        .from('stories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['story', variables.id] });
    },
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}
