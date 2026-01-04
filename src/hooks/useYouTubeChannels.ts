import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface YouTubeChannel {
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

interface ChannelAnalytics {
  totalViews: number;
  totalWatchTime: number;
  avgViewDuration: number;
  subscriberGrowth: number;
  topVideos: {
    id: string;
    title: string;
    views: number;
    likes: number;
  }[];
}

export function useYouTubeChannels() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const channelsQuery = useQuery({
    queryKey: ['youtube-channels', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('youtube_channels')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as YouTubeChannel[];
    },
    enabled: !!user,
  });

  const deleteChannel = useMutation({
    mutationFn: async (channelId: string) => {
      const { error } = await supabase
        .from('youtube_channels')
        .delete()
        .eq('id', channelId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube-channels'] });
      toast.success('Channel disconnected');
    },
    onError: (error) => {
      toast.error('Failed to disconnect channel');
      console.error(error);
    },
  });

  const setActiveChannel = useMutation({
    mutationFn: async ({ channelId, isActive }: { channelId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('youtube_channels')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', channelId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube-channels'] });
    },
  });

  return {
    channels: channelsQuery.data ?? [],
    isLoading: channelsQuery.isLoading,
    error: channelsQuery.error,
    deleteChannel,
    setActiveChannel,
    refetch: channelsQuery.refetch,
  };
}

export function useYouTubeChannelAnalytics(channelId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['youtube-channel-analytics', channelId],
    queryFn: async (): Promise<ChannelAnalytics> => {
      if (!user || !channelId) {
        return {
          totalViews: 0,
          totalWatchTime: 0,
          avgViewDuration: 0,
          subscriberGrowth: 0,
          topVideos: [],
        };
      }

      // Get videos for this channel's user
      const { data: videos, error } = await supabase
        .from('videos')
        .select('id, title')
        .eq('user_id', user.id)
        .limit(10);

      if (error) throw error;

      // Get analytics for these videos
      const videoIds = videos?.map(v => v.id) ?? [];
      
      if (videoIds.length === 0) {
        return {
          totalViews: 0,
          totalWatchTime: 0,
          avgViewDuration: 0,
          subscriberGrowth: 0,
          topVideos: [],
        };
      }

      const { data: analytics, error: analyticsError } = await supabase
        .from('video_analytics')
        .select('*')
        .in('video_id', videoIds);

      if (analyticsError) throw analyticsError;

      // Aggregate analytics from real data
      const totalViews = analytics?.reduce((sum, a) => sum + (a.views || 0), 0) ?? 0;
      const totalWatchTime = analytics?.reduce((sum, a) => sum + (a.watch_time_hours || 0), 0) ?? 0;
      const avgViewDuration = totalViews > 0 ? (totalWatchTime * 60) / totalViews : 0;

      // Aggregate per-video analytics
      const videoAnalyticsMap = new Map<string, { views: number; likes: number }>();
      analytics?.forEach(a => {
        const existing = videoAnalyticsMap.get(a.video_id) || { views: 0, likes: 0 };
        videoAnalyticsMap.set(a.video_id, {
          views: existing.views + (a.views || 0),
          likes: existing.likes + (a.likes || 0),
        });
      });

      // Create top videos list with real data
      const topVideos = videos?.slice(0, 5).map((v) => {
        const videoStats = videoAnalyticsMap.get(v.id) || { views: 0, likes: 0 };
        return {
          id: v.id,
          title: v.title,
          views: videoStats.views,
          likes: videoStats.likes,
        };
      }).sort((a, b) => b.views - a.views) ?? [];

      // Calculate subscriber growth from analytics if available
      const recentAnalytics = analytics?.slice(-7) ?? [];
      const oldAnalytics = analytics?.slice(0, 7) ?? [];
      const recentViews = recentAnalytics.reduce((sum, a) => sum + (a.views || 0), 0);
      const oldViews = oldAnalytics.reduce((sum, a) => sum + (a.views || 0), 0);
      const subscriberGrowth = oldViews > 0 ? Math.round(((recentViews - oldViews) / oldViews) * 100) : 0;

      return {
        totalViews,
        totalWatchTime,
        avgViewDuration,
        subscriberGrowth,
        topVideos,
      };
    },
    enabled: !!user && !!channelId,
  });
}
