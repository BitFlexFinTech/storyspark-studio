import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ThumbnailPattern {
  colorSchemes: { dominant: string; frequency: number }[];
  textUsage: { hasText: boolean; textStyle: string; avgWordCount: number };
  facesPresent: number;
  emotionalTone: string[];
}

export interface TopPerformer {
  thumbnailUrl: string;
  videoTitle: string;
  views: number;
  keyElements: string[];
}

export interface Recommendation {
  tip: string;
  example: string;
  priority: "high" | "medium" | "low";
}

export interface ThumbnailAnalysis {
  patterns: ThumbnailPattern;
  topPerformers: TopPerformer[];
  recommendations: Recommendation[];
  doList: string[];
  dontList: string[];
}

export function useThumbnailAnalysis(competitorIds?: string[]) {
  return useQuery({
    queryKey: ["thumbnail-analysis", competitorIds],
    queryFn: async (): Promise<ThumbnailAnalysis> => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("analyze-thumbnails", {
        body: { competitorIds },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to analyze thumbnails");
      }

      return response.data;
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    enabled: true,
  });
}

export function useRefreshThumbnailAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (competitorIds?: string[]): Promise<ThumbnailAnalysis> => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("analyze-thumbnails", {
        body: { competitorIds },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to refresh analysis");
      }

      return response.data;
    },
    onSuccess: (data, competitorIds) => {
      queryClient.setQueryData(["thumbnail-analysis", competitorIds], data);
    },
  });
}
