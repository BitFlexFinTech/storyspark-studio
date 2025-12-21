import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CompetitorAlert {
  id: string;
  user_id: string;
  competitor_id: string;
  alert_type: "new_video" | "milestone_subscribers" | "milestone_views" | "trending_video";
  threshold: number | null;
  is_active: boolean;
  created_at: string;
}

export interface CreateAlertInput {
  competitor_id: string;
  alert_type: CompetitorAlert["alert_type"];
  threshold?: number;
}

export function useCompetitorAlerts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["competitor-alerts"],
    queryFn: async (): Promise<CompetitorAlert[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("competitor_alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as CompetitorAlert[];
    },
    enabled: !!user,
  });
}

export function useCreateCompetitorAlert() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateAlertInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("competitor_alerts")
        .insert({
          user_id: user.id,
          competitor_id: input.competitor_id,
          alert_type: input.alert_type,
          threshold: input.threshold || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitor-alerts"] });
    },
  });
}

export function useUpdateCompetitorAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      is_active,
      threshold,
    }: {
      id: string;
      is_active?: boolean;
      threshold?: number;
    }) => {
      const updateData: Partial<CompetitorAlert> = {};
      if (is_active !== undefined) updateData.is_active = is_active;
      if (threshold !== undefined) updateData.threshold = threshold;

      const { error } = await supabase
        .from("competitor_alerts")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitor-alerts"] });
    },
  });
}

export function useDeleteCompetitorAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("competitor_alerts")
        .delete()
        .eq("id", alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitor-alerts"] });
    },
  });
}
