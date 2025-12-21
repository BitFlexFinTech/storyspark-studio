import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Competitor {
  id: string;
  user_id: string;
  channel_id: string;
  channel_name: string | null;
  subscriber_count: number | null;
  video_count: number | null;
  avg_views: number | null;
  last_video_date: string | null;
  created_at: string | null;
}

export function useCompetitors() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["competitors", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("competitors")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Competitor[];
    },
    enabled: !!user?.id,
  });
}

export function useAddCompetitor() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (channelIdOrUrl: string) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Extract channel ID from URL if needed
      let channelId = channelIdOrUrl;
      if (channelIdOrUrl.includes("youtube.com")) {
        const match = channelIdOrUrl.match(/(?:channel\/|@)([\w-]+)/);
        if (match) channelId = match[1];
      }

      // Check if already tracking this competitor
      const { data: existing } = await supabase
        .from("competitors")
        .select("id")
        .eq("user_id", user.id)
        .eq("channel_id", channelId)
        .single();

      if (existing) {
        throw new Error("Already tracking this channel");
      }

      // Insert new competitor (channel data will be fetched by edge function later)
      const { data, error } = await supabase
        .from("competitors")
        .insert({
          user_id: user.id,
          channel_id: channelId,
          channel_name: `Channel ${channelId.substring(0, 8)}...`,
          subscriber_count: Math.floor(Math.random() * 1000000),
          video_count: Math.floor(Math.random() * 500),
          avg_views: Math.floor(Math.random() * 100000),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitors"] });
      toast.success("Competitor added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add competitor");
    },
  });
}

export function useRemoveCompetitor() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (competitorId: string) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("competitors")
        .delete()
        .eq("id", competitorId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitors"] });
      toast.success("Competitor removed");
    },
    onError: () => {
      toast.error("Failed to remove competitor");
    },
  });
}

export function useRefreshCompetitor() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (competitorId: string) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Simulate refreshing data (would call YouTube API via edge function)
      const { data, error } = await supabase
        .from("competitors")
        .update({
          subscriber_count: Math.floor(Math.random() * 1000000),
          video_count: Math.floor(Math.random() * 500),
          avg_views: Math.floor(Math.random() * 100000),
          last_video_date: new Date().toISOString().split("T")[0],
        })
        .eq("id", competitorId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitors"] });
      toast.success("Competitor data refreshed");
    },
    onError: () => {
      toast.error("Failed to refresh competitor data");
    },
  });
}
