import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AudienceActivity {
  day: string;
  hour: number;
  value: number;
}

export interface RecommendedSlot {
  day: string;
  time: string;
  confidence: number;
  reason: string;
}

export interface PeakDay {
  day: string;
  activityIndex: number;
}

export interface PeakHour {
  hour: number;
  activityIndex: number;
}

export interface CompetitorPattern {
  day: string;
  hour: number;
  count: number;
}

export interface WeeklyPlanItem {
  day: string;
  time: string;
  priority: string;
}

export interface AudienceTimeAnalysis {
  heatmap: AudienceActivity[];
  peakDays: PeakDay[];
  peakHours: PeakHour[];
  competitorPatterns: CompetitorPattern[];
  recommendedSlots: RecommendedSlot[];
  avoidSlots: { day: string; time: string; reason: string }[];
  weeklyPlan: WeeklyPlanItem[];
  insights: string[];
}

export function useAudienceTimeAnalysis() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['audience-time-analysis', user?.id],
    queryFn: async (): Promise<AudienceTimeAnalysis> => {
      const { data, error } = await supabase.functions.invoke('analyze-audience-times');

      if (error) {
        console.error('Error analyzing audience times:', error);
        throw new Error(error.message || 'Failed to analyze audience times');
      }

      return data as AudienceTimeAnalysis;
    },
    enabled: !!user,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  });
}

export function useRefreshAudienceTimeAnalysis() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (): Promise<AudienceTimeAnalysis> => {
      const { data, error } = await supabase.functions.invoke('analyze-audience-times');

      if (error) {
        throw new Error(error.message || 'Failed to refresh analysis');
      }

      return data as AudienceTimeAnalysis;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['audience-time-analysis', user?.id], data);
    },
  });
}
