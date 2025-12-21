import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ScheduledContent {
  id: string;
  user_id: string;
  video_id: string | null;
  title: string;
  scheduled_date: string;
  scheduled_time: string | null;
  status: "planned" | "ready" | "published" | "skipped";
  notes: string | null;
  suggested_by_ai: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduledContentInput {
  title: string;
  scheduled_date: string;
  scheduled_time?: string;
  video_id?: string;
  notes?: string;
  suggested_by_ai?: boolean;
}

export function useScheduledContent(month?: Date) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["scheduled-content", month?.toISOString()],
    queryFn: async (): Promise<ScheduledContent[]> => {
      if (!user) return [];

      let query = supabase
        .from("scheduled_content")
        .select("*")
        .eq("user_id", user.id)
        .order("scheduled_date", { ascending: true });

      if (month) {
        const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
        const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        query = query
          .gte("scheduled_date", startOfMonth.toISOString().split("T")[0])
          .lte("scheduled_date", endOfMonth.toISOString().split("T")[0]);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as ScheduledContent[];
    },
    enabled: !!user,
  });
}

export function useCreateScheduledContent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateScheduledContentInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("scheduled_content")
        .insert({
          user_id: user.id,
          title: input.title,
          scheduled_date: input.scheduled_date,
          scheduled_time: input.scheduled_time || null,
          video_id: input.video_id || null,
          notes: input.notes || null,
          suggested_by_ai: input.suggested_by_ai || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-content"] });
    },
  });
}

export function useUpdateScheduledContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<ScheduledContent> & { id: string }) => {
      const { error } = await supabase
        .from("scheduled_content")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-content"] });
    },
  });
}

export function useDeleteScheduledContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("scheduled_content")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-content"] });
    },
  });
}
