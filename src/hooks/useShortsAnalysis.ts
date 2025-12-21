import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ShortVideo {
  id: string;
  title: string;
  thumbnail_url: string | null;
  duration: string | null;
  status: string | null;
  created_at: string;
}

export interface CompetitorShort {
  title: string;
  thumbnail_url: string | null;
  views: number;
  likes: number;
  channel_name: string;
  duration_seconds: number | null;
  published_at: string | null;
  engagement_rate: string | number;
}

export interface ShortsMetrics {
  avgViews: number;
  avgLikes: number;
  avgEngagement: number;
  totalViews: number;
  totalLikes: number;
}

export interface ShortsInsights {
  trends: string[];
  recommendations: string[];
  topFormats: string[];
  hookPatterns?: string[];
}

export interface ShortsAnalysis {
  userShorts: {
    count: number;
    metrics: ShortsMetrics;
    videos: ShortVideo[];
  };
  competitorShorts: {
    count: number;
    metrics: ShortsMetrics;
    topPerformers: CompetitorShort[];
  };
  comparison: {
    userAvgViews: number;
    competitorAvgViews: number;
    viewsGap: number;
    userAvgEngagement: number;
    competitorAvgEngagement: number;
  };
  insights: ShortsInsights;
}

export function useShortsAnalysis() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["shorts-analysis", user?.id],
    queryFn: async (): Promise<ShortsAnalysis> => {
      const { data, error } = await supabase.functions.invoke("analyze-shorts");

      if (error) {
        throw new Error(error.message);
      }

      return data as ShortsAnalysis;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

export function useRefreshShortsAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<ShortsAnalysis> => {
      const { data, error } = await supabase.functions.invoke("analyze-shorts");

      if (error) {
        throw new Error(error.message);
      }

      return data as ShortsAnalysis;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["shorts-analysis"], data);
    },
  });
}
