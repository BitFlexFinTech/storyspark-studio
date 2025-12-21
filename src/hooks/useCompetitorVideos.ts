import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CompetitorVideo {
  id: string;
  competitor_id: string;
  youtube_video_id: string;
  title: string;
  thumbnail_url: string | null;
  published_at: string | null;
  views: number;
  likes: number;
  comments: number;
  duration_seconds: number | null;
  first_seen_at: string;
  last_updated_at: string;
  competitor?: {
    channel_name: string | null;
    channel_id: string;
  };
}

export interface SyncResult {
  message: string;
  synced: number;
  added: number;
  updated: number;
  competitors: {
    channelName: string;
    videosAdded: number;
    videosUpdated: number;
  }[];
}

export function useCompetitorVideos(competitorId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['competitor-videos', user?.id, competitorId],
    queryFn: async (): Promise<CompetitorVideo[]> => {
      let query = supabase
        .from('competitor_videos')
        .select(`
          *,
          competitor:competitors(channel_name, channel_id)
        `)
        .order('views', { ascending: false });

      if (competitorId) {
        query = query.eq('competitor_id', competitorId);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('Error fetching competitor videos:', error);
        throw new Error(error.message || 'Failed to fetch competitor videos');
      }

      return (data || []) as unknown as CompetitorVideo[];
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useTopCompetitorVideos(limit: number = 10) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['top-competitor-videos', user?.id, limit],
    queryFn: async (): Promise<CompetitorVideo[]> => {
      const { data, error } = await supabase
        .from('competitor_videos')
        .select(`
          *,
          competitor:competitors(channel_name, channel_id)
        `)
        .order('views', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching top competitor videos:', error);
        throw new Error(error.message || 'Failed to fetch top videos');
      }

      return (data || []) as unknown as CompetitorVideo[];
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSyncCompetitorVideos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<SyncResult> => {
      const { data, error } = await supabase.functions.invoke('sync-competitor-videos');

      if (error) {
        throw new Error(error.message || 'Failed to sync competitor videos');
      }

      return data as SyncResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitor-videos'] });
      queryClient.invalidateQueries({ queryKey: ['top-competitor-videos'] });
    },
  });
}

export function useCompetitorVideoStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['competitor-video-stats', user?.id],
    queryFn: async () => {
      const { data: videos, error } = await supabase
        .from('competitor_videos')
        .select(`
          views,
          likes,
          comments,
          competitor:competitors(channel_name, user_id)
        `);

      if (error) {
        throw new Error(error.message);
      }

      // Filter to only user's competitors
      const userVideos = (videos || []).filter(
        (v: any) => v.competitor?.user_id === user?.id
      );

      const totalViews = userVideos.reduce((sum, v) => sum + (v.views || 0), 0);
      const totalLikes = userVideos.reduce((sum, v) => sum + (v.likes || 0), 0);
      const totalComments = userVideos.reduce((sum, v) => sum + (v.comments || 0), 0);
      const avgViews = userVideos.length > 0 ? Math.round(totalViews / userVideos.length) : 0;
      const avgEngagement = totalViews > 0 
        ? ((totalLikes + totalComments) / totalViews * 100).toFixed(2)
        : '0';

      return {
        totalVideos: userVideos.length,
        totalViews,
        avgViews,
        avgEngagement: parseFloat(avgEngagement),
      };
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
  });
}
