import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CompetitorActivity {
  recentNotifications: {
    id: string;
    title: string;
    message: string;
    notification_type: string;
    created_at: string;
    is_read: boolean;
  }[];
  competitorsCount: number;
  unreadCount: number;
  alertsCount: number;
}

export function useRecentCompetitorActivity() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["recent-competitor-activity"],
    queryFn: async (): Promise<CompetitorActivity> => {
      if (!user) {
        return {
          recentNotifications: [],
          competitorsCount: 0,
          unreadCount: 0,
          alertsCount: 0,
        };
      }

      // Fetch recent notifications (competitor-related)
      const { data: notifications, error: notifError } = await supabase
        .from("notifications")
        .select("id, title, message, notification_type, created_at, is_read")
        .eq("user_id", user.id)
        .in("notification_type", ["new_video", "milestone", "trending"])
        .order("created_at", { ascending: false })
        .limit(5);

      if (notifError) throw notifError;

      // Fetch competitors count
      const { count: competitorsCount, error: compError } = await supabase
        .from("competitors")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (compError) throw compError;

      // Fetch unread count
      const { count: unreadCount, error: unreadError } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (unreadError) throw unreadError;

      // Fetch active alerts count
      const { count: alertsCount, error: alertsError } = await supabase
        .from("competitor_alerts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (alertsError) throw alertsError;

      return {
        recentNotifications: notifications || [],
        competitorsCount: competitorsCount || 0,
        unreadCount: unreadCount || 0,
        alertsCount: alertsCount || 0,
      };
    },
    enabled: !!user,
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });
}
