import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CompetitorPattern {
  channelName: string;
  preferredDays: string[];
  preferredTimes: string[];
  avgVideosPerWeek: number;
}

export interface OptimalSlot {
  day: string;
  timeRange: string;
  confidence: "high" | "medium" | "low";
  reasoning: string;
}

export interface AvoidSlot {
  day: string;
  timeRange: string;
  reason: string;
}

export interface SuggestedSchedule {
  date: string;
  time: string;
  isOptimal: boolean;
}

export interface UploadTimeAnalysis {
  competitorPatterns: CompetitorPattern[];
  optimalSlots: OptimalSlot[];
  avoidSlots: AvoidSlot[];
  suggestedSchedule: SuggestedSchedule[];
}

export function useUploadTimeAnalysis() {
  return useQuery({
    queryKey: ["upload-time-analysis"],
    queryFn: async (): Promise<UploadTimeAnalysis> => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("analyze-upload-times");

      if (response.error) {
        throw new Error(response.error.message || "Failed to analyze upload times");
      }

      return response.data;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

export function useRefreshUploadTimeAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<UploadTimeAnalysis> => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("analyze-upload-times");

      if (response.error) {
        throw new Error(response.error.message || "Failed to refresh analysis");
      }

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["upload-time-analysis"], data);
    },
  });
}
