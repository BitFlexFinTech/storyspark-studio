import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteNotification } from "@/hooks/useNotifications";
import { Bell, Video, TrendingUp, Award, CheckCheck, Trash2, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function Notifications() {
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "new_video": return <Video className="h-5 w-5 text-blue-500" />;
      case "milestone": return <Award className="h-5 w-5 text-yellow-500" />;
      case "trending": return <TrendingUp className="h-5 w-5 text-green-500" />;
      default: return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const filterNotifications = (type?: string) => {
    if (!type || type === "all") return notifications;
    if (type === "unread") return notifications.filter((n) => !n.is_read);
    return notifications.filter((n) => n.notification_type === type);
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => toast.success("All notifications marked as read"),
    });
  };

  return (
    <AppLayout>
      <PageHeader
        title="Notifications"
        description="Stay updated on competitor activity and milestones"
      />

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <span className="font-medium">{unreadCount} unread</span>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="new_video">New Videos</TabsTrigger>
          <TabsTrigger value="milestone">Milestones</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        {["all", "unread", "new_video", "milestone", "trending"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4 mt-6">
            {isLoading ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent></Card>
            ) : filterNotifications(tab).length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No notifications</CardContent></Card>
            ) : (
              filterNotifications(tab).map((notification) => (
                <Card
                  key={notification.id}
                  className={`transition-colors ${!notification.is_read ? "bg-primary/5 border-primary/20" : ""}`}
                >
                  <CardContent className="flex items-start gap-4 py-4">
                    <div className="mt-1">{getIcon(notification.notification_type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                        </div>
                        {!notification.is_read && <Badge variant="secondary">New</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {notification.data?.videoId && (
                        <Button variant="ghost" size="icon" asChild>
                          <a
                            href={`https://youtube.com/watch?v=${notification.data.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markRead.mutate(notification.id)}
                        >
                          <CheckCheck className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNotification.mutate(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </AppLayout>
  );
}
