import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Character {
  id: string;
  user_id: string;
  name: string;
  role: string | null;
  personality: string | null;
  backstory: string | null;
  appearance: string | null;
  voice_type: string | null;
  voice_accent: string | null;
  voice_age: string | null;
  locked_traits: string[] | null;
  stories_count: number | null;
  created_at: string;
  updated_at: string;
}

export function useCharacters() {
  const { isAuthenticated, isDemoMode, user } = useAuth();

  return useQuery({
    queryKey: ['characters', user?.id],
    queryFn: async () => {
      if (isDemoMode) {
        // Return empty array in demo mode - no mock data
        return [] as Character[];
      }

      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Character[];
    },
    enabled: isAuthenticated,
  });
}

export function useCharacter(id: string) {
  const { isDemoMode } = useAuth();

  return useQuery({
    queryKey: ['character', id],
    queryFn: async () => {
      if (isDemoMode) {
        return null;
      }

      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Character | null;
    },
    enabled: !!id,
  });
}

export function useCreateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (character: Omit<Character, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('characters')
        .insert({ ...character, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    },
  });
}

export function useUpdateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Character> & { id: string }) => {
      const { data, error } = await supabase
        .from('characters')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({ queryKey: ['character', variables.id] });
    },
  });
}

export function useDeleteCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    },
  });
}
