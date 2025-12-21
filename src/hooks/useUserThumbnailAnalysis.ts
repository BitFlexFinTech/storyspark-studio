import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ThumbnailAnalysisResult {
  videoId: string;
  thumbnailUrl: string;
  title: string;
  score: number;
  strengths: string[];
  improvements: string[];
}

export interface UserThumbnailAnalysis {
  userThumbnails: ThumbnailAnalysisResult[];
  overallScore: number;
  topRecommendations: string[];
  competitorBenchmarks: { url: string; channelName: string }[];
}

export function useUserThumbnailAnalysis() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-thumbnail-analysis', user?.id],
    queryFn: async (): Promise<UserThumbnailAnalysis> => {
      const { data, error } = await supabase.functions.invoke('analyze-user-thumbnails');

      if (error) {
        console.error('Error analyzing thumbnails:', error);
        throw new Error(error.message || 'Failed to analyze thumbnails');
      }

      return data as UserThumbnailAnalysis;
    },
    enabled: !!user,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useRefreshUserThumbnailAnalysis() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (): Promise<UserThumbnailAnalysis> => {
      const { data, error } = await supabase.functions.invoke('analyze-user-thumbnails');

      if (error) {
        throw new Error(error.message || 'Failed to refresh analysis');
      }

      return data as UserThumbnailAnalysis;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user-thumbnail-analysis', user?.id], data);
    },
  });
}
