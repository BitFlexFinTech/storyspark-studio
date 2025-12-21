import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Integration {
  id: string;
  user_id: string;
  platform: string;
  status: string;
  oauth_state: string | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface YouTubeChannel {
  id: string;
  user_id: string;
  channel_id: string;
  channel_name: string;
  channel_url: string | null;
  thumbnail_url: string | null;
  subscriber_count: number;
  video_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IntegrationSetup {
  id: string;
  user_id: string;
  integration_id: string | null;
  platform: string;
  current_step: number;
  total_steps: number;
  step_data: Record<string, any>;
  completed: boolean;
  created_at: string;
}

export function useIntegrations() {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: ['integrations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Integration[];
    },
    enabled: isAuthenticated,
  });
}

export function useIntegration(platform: string) {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: ['integration', platform, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('platform', platform)
        .maybeSingle();

      if (error) throw error;
      return data as Integration | null;
    },
    enabled: isAuthenticated && !!platform,
  });
}

export function useCreateIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (integration: { platform: string; status?: string; metadata?: Record<string, any> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('integrations')
        .insert({ 
          ...integration, 
          user_id: user.id,
          status: integration.status || 'disconnected',
          metadata: integration.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}

export function useUpdateIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Integration> & { id: string }) => {
      const { data, error } = await supabase
        .from('integrations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['integration'] });
    },
  });
}

export function useDeleteIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}

// YouTube Channels
export function useYouTubeChannels() {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: ['youtube-channels', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('youtube_channels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as YouTubeChannel[];
    },
    enabled: isAuthenticated,
  });
}

export function useCreateYouTubeChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (channel: Omit<YouTubeChannel, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('youtube_channels')
        .insert({ ...channel, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube-channels'] });
    },
  });
}

export function useDeleteYouTubeChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('youtube_channels')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube-channels'] });
    },
  });
}

// Integration Setup
export function useIntegrationSetup(platform: string) {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: ['integration-setup', platform, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_setup')
        .select('*')
        .eq('platform', platform)
        .eq('completed', false)
        .maybeSingle();

      if (error) throw error;
      return data as IntegrationSetup | null;
    },
    enabled: isAuthenticated && !!platform,
  });
}

export function useCreateIntegrationSetup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (setup: { platform: string; total_steps: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('integration_setup')
        .insert({ 
          ...setup, 
          user_id: user.id,
          current_step: 1,
          step_data: {},
          completed: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-setup'] });
    },
  });
}

export function useUpdateIntegrationSetup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<IntegrationSetup> & { id: string }) => {
      const { data, error } = await supabase
        .from('integration_setup')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-setup'] });
    },
  });
}
