import { useState } from "react";
import { Bell, Video, TrendingUp, Users, Check, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

const notificationIcons: Record<string, typeof Video> = {
  new_video: Video,
  milestone: Users,
  trending: TrendingUp,
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { data: notifications, isLoading } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const latestNotifications = notifications?.slice(0, 5) || [];

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markRead.mutate(notification.id);
    }
    setOpen(false);
    navigate("/notifications");
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate("/notifications");
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markAllRead.isPending}
              className="text-xs h-7"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-80">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : latestNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {latestNotifications.map((notification) => {
                const Icon = notificationIcons[notification.notification_type] || Bell;
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="w-full flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div
                      className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${
                        notification.is_read
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm truncate ${
                          notification.is_read ? "text-muted-foreground" : "font-medium"
                        }`}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-border p-2">
          <Button
            variant="ghost"
            className="w-full justify-center text-sm"
            onClick={handleViewAll}
          >
            <Eye className="h-4 w-4 mr-2" />
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
