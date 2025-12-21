import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_enabled: boolean;
  email_frequency: "immediate" | "daily_digest" | "weekly_digest";
  email_for_new_videos: boolean;
  email_for_milestones: boolean;
  email_for_trending: boolean;
  digest_time: string;
  digest_day: number;
  created_at: string;
  updated_at: string;
}

export interface UpdateNotificationSettingsInput {
  email_enabled?: boolean;
  email_frequency?: "immediate" | "daily_digest" | "weekly_digest";
  email_for_new_videos?: boolean;
  email_for_milestones?: boolean;
  email_for_trending?: boolean;
  digest_time?: string;
  digest_day?: number;
}

export function useNotificationSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notification-settings"],
    queryFn: async (): Promise<NotificationSettings | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      // Return null if no settings exist yet
      if (!data) return null;
      
      return data as NotificationSettings;
    },
    enabled: !!user,
  });
}

export function useCreateNotificationSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: UpdateNotificationSettingsInput = {}) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("notification_settings")
        .insert({
          user_id: user.id,
          email_enabled: input.email_enabled ?? true,
          email_frequency: input.email_frequency ?? "immediate",
          email_for_new_videos: input.email_for_new_videos ?? true,
          email_for_milestones: input.email_for_milestones ?? true,
          email_for_trending: input.email_for_trending ?? true,
          digest_time: input.digest_time ?? "09:00:00",
          digest_day: input.digest_day ?? 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-settings"] });
    },
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: UpdateNotificationSettingsInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("notification_settings")
        .update(input)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-settings"] });
    },
  });
}
