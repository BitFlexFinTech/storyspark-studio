import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Notification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  data: Record<string, any> | null;
  is_read: boolean;
  created_at: string;
  competitor_id: string | null;
  alert_id: string | null;
}

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Initial fetch of unread count
    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      setUnreadCount(count || 0);
    };

    fetchUnreadCount();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as Notification;
          
          // Show toast for new notification
          toast.info(notification.title, {
            description: notification.message,
            duration: 5000,
          });

          // Update unread count
          setUnreadCount((prev) => prev + 1);

          // Invalidate notifications query
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refetch unread count on update
          fetchUnreadCount();
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    setUnreadCount((prev) => Math.max(0, prev - 1));
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const markAllAsRead = async () => {
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    setUnreadCount(0);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  return {
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
