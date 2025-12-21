import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TitleSuggestion {
  title: string;
  reasoning: string;
  formula: string;
  estimatedCTR: number;
  keywordsUsed: string[];
}

export interface TitleAnalysis {
  originalAnalysis: {
    strengths: string[];
    weaknesses: string[];
    estimatedCTR: number;
  };
  suggestions: TitleSuggestion[];
  competitorTitles: string[];
  availableKeywords: string[];
}

interface OptimizeTitleParams {
  currentTitle: string;
  videoId?: string;
  niche?: string;
}

export function useTitleOptimizer() {
  return useMutation({
    mutationFn: async ({ currentTitle, videoId, niche }: OptimizeTitleParams): Promise<TitleAnalysis> => {
      const { data, error } = await supabase.functions.invoke("optimize-title", {
        body: { currentTitle, videoId, niche },
      });

      if (error) {
        throw new Error(error.message);
      }

      return data as TitleAnalysis;
    },
  });
}
