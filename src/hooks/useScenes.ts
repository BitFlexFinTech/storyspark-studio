import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Scene {
  id: string;
  story_id: string;
  number: number;
  title: string;
  script: string | null;
  visual_description: string | null;
  duration: string | null;
  audio_waveform: number[] | null;
  created_at: string;
  updated_at: string;
}

export function useScenes(storyId: string) {
  return useQuery({
    queryKey: ['scenes', storyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scenes')
        .select('*')
        .eq('story_id', storyId)
        .order('number', { ascending: true });

      if (error) throw error;
      return data as Scene[];
    },
    enabled: !!storyId,
  });
}

export function useCreateScene() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scene: Omit<Scene, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('scenes')
        .insert(scene)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scenes', variables.story_id] });
    },
  });
}

export function useUpdateScene() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, story_id, ...updates }: Partial<Scene> & { id: string; story_id: string }) => {
      const { data, error } = await supabase
        .from('scenes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, story_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scenes', data.story_id] });
    },
  });
}

export function useReorderScenes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storyId, scenes }: { storyId: string; scenes: { id: string; number: number }[] }) => {
      // Update all scenes with their new order
      const updates = scenes.map(({ id, number }) =>
        supabase
          .from('scenes')
          .update({ number })
          .eq('id', id)
      );

      await Promise.all(updates);
      return storyId;
    },
    onSuccess: (storyId) => {
      queryClient.invalidateQueries({ queryKey: ['scenes', storyId] });
    },
  });
}

export function useDeleteScene() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, storyId }: { id: string; storyId: string }) => {
      const { error } = await supabase
        .from('scenes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return storyId;
    },
    onSuccess: (storyId) => {
      queryClient.invalidateQueries({ queryKey: ['scenes', storyId] });
    },
  });
}
