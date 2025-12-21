import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface VideoAnalytics {
  id: string;
  video_id: string;
  date: string;
  views: number;
  watch_time_hours: number;
  likes: number;
  comments: number;
  shares: number;
  retention_rate: number;
  created_at: string;
}

export interface AggregatedAnalytics {
  totalViews: number;
  totalWatchTime: number;
  avgRetention: number;
  totalSubscribers: number;
  viewsGrowth: number;
  watchTimeGrowth: number;
  retentionGrowth: number;
  subscriberGrowth: number;
}

export interface AnalyticsDataPoint {
  date: string;
  views: number;
  watchTime: number;
  likes: number;
  comments: number;
  shares: number;
  retention: number;
}

export function useVideoAnalytics(videoId: string) {
  const { isDemoMode } = useAuth();

  return useQuery({
    queryKey: ['video-analytics', videoId],
    queryFn: async () => {
      if (isDemoMode) {
        return [] as VideoAnalytics[];
      }

      const { data, error } = await supabase
        .from('video_analytics')
        .select('*')
        .eq('video_id', videoId)
        .order('date', { ascending: true });

      if (error) throw error;
      return data as VideoAnalytics[];
    },
    enabled: !!videoId,
  });
}

export function useAggregatedAnalytics() {
  const { isAuthenticated, isDemoMode, user } = useAuth();

  return useQuery({
    queryKey: ['aggregated-analytics', user?.id],
    queryFn: async (): Promise<AggregatedAnalytics> => {
      if (isDemoMode) {
        return {
          totalViews: 0,
          totalWatchTime: 0,
          avgRetention: 0,
          totalSubscribers: 0,
          viewsGrowth: 0,
          watchTimeGrowth: 0,
          retentionGrowth: 0,
          subscriberGrowth: 0,
        };
      }

      // Get all videos for the user first
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('id');

      if (videosError) throw videosError;
      
      if (!videos || videos.length === 0) {
        return {
          totalViews: 0,
          totalWatchTime: 0,
          avgRetention: 0,
          totalSubscribers: 0,
          viewsGrowth: 0,
          watchTimeGrowth: 0,
          retentionGrowth: 0,
          subscriberGrowth: 0,
        };
      }

      const videoIds = videos.map(v => v.id);

      // Get analytics for all user's videos
      const { data: analytics, error: analyticsError } = await supabase
        .from('video_analytics')
        .select('*')
        .in('video_id', videoIds);

      if (analyticsError) throw analyticsError;

      if (!analytics || analytics.length === 0) {
        return {
          totalViews: 0,
          totalWatchTime: 0,
          avgRetention: 0,
          totalSubscribers: 0,
          viewsGrowth: 0,
          watchTimeGrowth: 0,
          retentionGrowth: 0,
          subscriberGrowth: 0,
        };
      }

      const totalViews = analytics.reduce((acc, a) => acc + (a.views || 0), 0);
      const totalWatchTime = analytics.reduce((acc, a) => acc + Number(a.watch_time_hours || 0), 0);
      const avgRetention = analytics.reduce((acc, a) => acc + Number(a.retention_rate || 0), 0) / analytics.length;

      return {
        totalViews,
        totalWatchTime,
        avgRetention,
        totalSubscribers: 0,
        viewsGrowth: 0,
        watchTimeGrowth: 0,
        retentionGrowth: 0,
        subscriberGrowth: 0,
      };
    },
    enabled: isAuthenticated,
  });
}

export function useAnalyticsTimeSeries() {
  const { isAuthenticated, isDemoMode, user } = useAuth();

  return useQuery({
    queryKey: ['analytics-time-series', user?.id],
    queryFn: async (): Promise<AnalyticsDataPoint[]> => {
      if (isDemoMode) {
        return [];
      }

      // Get all videos for the user
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('id');

      if (videosError) throw videosError;
      
      if (!videos || videos.length === 0) return [];

      const videoIds = videos.map(v => v.id);

      // Get analytics grouped by date
      const { data, error } = await supabase
        .from('video_analytics')
        .select('*')
        .in('video_id', videoIds)
        .order('date', { ascending: true });

      if (error) throw error;

      // Aggregate by date
      const byDate = (data || []).reduce((acc, item) => {
        const date = item.date;
        if (!acc[date]) {
          acc[date] = {
            date,
            views: 0,
            watchTime: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            retention: 0,
            count: 0,
          };
        }
        acc[date].views += item.views || 0;
        acc[date].watchTime += Number(item.watch_time_hours || 0);
        acc[date].likes += item.likes || 0;
        acc[date].comments += item.comments || 0;
        acc[date].shares += item.shares || 0;
        acc[date].retention += Number(item.retention_rate || 0);
        acc[date].count += 1;
        return acc;
      }, {} as Record<string, AnalyticsDataPoint & { count: number }>);

      return Object.values(byDate).map((d) => ({
        date: d.date,
        views: d.views,
        watchTime: d.watchTime,
        likes: d.likes,
        comments: d.comments,
        shares: d.shares,
        retention: d.count > 0 ? d.retention / d.count : 0,
      }));
    },
    enabled: isAuthenticated,
  });
}
