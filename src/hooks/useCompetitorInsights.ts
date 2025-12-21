import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ContentGap {
  topic: string;
  reason: string;
  priority: "high" | "medium" | "low";
  estimatedImpact: string;
}

export interface StrategyRecommendation {
  title: string;
  description: string;
  category: "content" | "seo" | "engagement" | "branding" | "schedule";
  effort: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
}

export interface CompetitorStrength {
  competitor: string;
  strength: string;
  howToLearn: string;
}

export interface OpportunityScore {
  score: number;
  explanation: string;
}

export interface UploadFrequencyAdvice {
  currentAverage: string;
  recommended: string;
  reasoning: string;
}

export interface CompetitorInsights {
  contentGaps: ContentGap[];
  strategyRecommendations: StrategyRecommendation[];
  competitorStrengths: CompetitorStrength[];
  opportunityScore: OpportunityScore;
  uploadFrequencyAdvice: UploadFrequencyAdvice;
}

export interface InsightsResponse {
  insights: CompetitorInsights;
  competitors: Array<{
    name: string;
    subscribers: number;
    videos: number;
    avgViews: number;
    lastVideo: string | null;
  }>;
}

export function useCompetitorInsights() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["competitor-insights", user?.id],
    queryFn: async (): Promise<InsightsResponse> => {
      const { data, error } = await supabase.functions.invoke("competitor-insights");

      if (error) {
        console.error("Error fetching insights:", error);
        throw new Error(error.message || "Failed to fetch insights");
      }

      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useRefreshInsights() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("competitor-insights");

      if (error) {
        throw new Error(error.message || "Failed to refresh insights");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitor-insights", user?.id] });
      toast.success("Insights refreshed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to refresh insights");
    },
  });
}
