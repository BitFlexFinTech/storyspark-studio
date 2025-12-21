import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";

interface KeywordData {
  keyword: string;
  search_volume: number;
  competition_score: number;
  outlier_score: number;
  trend_direction: 'rising' | 'stable' | 'declining';
  difficulty?: string;
  cpc_estimate?: number;
  related_keywords: string[];
  long_tail_keywords?: string[];
  content_ideas?: string[];
  best_video_format?: string;
  target_audience?: string;
  seasonality?: string;
  category?: string;
}

interface SavedKeyword {
  id: string;
  user_id: string;
  keyword: string;
  search_volume: number | null;
  competition_score: number | null;
  outlier_score: number | null;
  trend_direction: string | null;
  related_keywords: string[] | null;
  created_at: string;
}

export function useKeywordSearch() {
  const { user } = useAuth();
  const [isSearching, setIsSearching] = useState(false);

  const searchKeyword = async (keyword: string): Promise<KeywordData | null> => {
    if (!user) {
      toast.error('Please sign in to search keywords');
      return null;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('keyword-research', {
        body: { keyword },
      });

      if (error) throw error;
      return data as KeywordData;
    } catch (error) {
      console.error('Keyword search error:', error);
      toast.error('Failed to analyze keyword');
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  return { searchKeyword, isSearching };
}

export function useTrendingKeywords() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trending-keywords'],
    queryFn: async (): Promise<KeywordData[]> => {
      const { data, error } = await supabase.functions.invoke('keyword-research', {
        body: { action: 'trending' },
      });

      if (error) throw error;
      return data?.keywords ?? [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useSavedKeywords() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['saved-keywords', user?.id],
    queryFn: async (): Promise<SavedKeyword[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('keywords')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data ?? []).map(k => ({
        ...k,
        related_keywords: Array.isArray(k.related_keywords) 
          ? k.related_keywords as string[]
          : []
      }));
    },
    enabled: !!user,
  });
}

export function useSaveKeyword() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keywordData: KeywordData) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('keywords').insert({
        user_id: user.id,
        keyword: keywordData.keyword,
        search_volume: keywordData.search_volume,
        competition_score: keywordData.competition_score,
        outlier_score: keywordData.outlier_score,
        trend_direction: keywordData.trend_direction,
        related_keywords: keywordData.related_keywords,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-keywords'] });
      toast.success('Keyword saved');
    },
    onError: () => {
      toast.error('Failed to save keyword');
    },
  });
}

export function useDeleteKeyword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keywordId: string) => {
      const { error } = await supabase
        .from('keywords')
        .delete()
        .eq('id', keywordId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-keywords'] });
      toast.success('Keyword deleted');
    },
    onError: () => {
      toast.error('Failed to delete keyword');
    },
  });
}
