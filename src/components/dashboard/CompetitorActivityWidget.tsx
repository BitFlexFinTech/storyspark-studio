import { Bell, Users, Video, TrendingUp, ArrowRight, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecentCompetitorActivity } from "@/hooks/useRecentCompetitorActivity";
import { formatDistanceToNow } from "date-fns";

const notificationIcons: Record<string, typeof Video> = {
  new_video: Video,
  milestone: Users,
  trending: TrendingUp,
};

const notificationColors: Record<string, string> = {
  new_video: "bg-blue-500/10 text-blue-500",
  milestone: "bg-green-500/10 text-green-500",
  trending: "bg-orange-500/10 text-orange-500",
};

export function CompetitorActivityWidget() {
  const { data, isLoading } = useRecentCompetitorActivity();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Competitor Activity
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/competitors">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-2xl font-bold">{data?.competitorsCount || 0}</p>
            <p className="text-xs text-muted-foreground">Tracked</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-2xl font-bold">{data?.alertsCount || 0}</p>
            <p className="text-xs text-muted-foreground">Active Alerts</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-2xl font-bold text-primary">{data?.unreadCount || 0}</p>
            <p className="text-xs text-muted-foreground">Unread</p>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Recent Alerts</p>
          {data?.recentNotifications.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-4 text-center">
              <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground mt-1">
                Set up alerts to track competitors
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {data?.recentNotifications.slice(0, 3).map((notification) => {
                const Icon = notificationIcons[notification.notification_type] || Bell;
                const colorClass =
                  notificationColors[notification.notification_type] ||
                  "bg-muted text-muted-foreground";

                return (
                  <Link
                    key={notification.id}
                    to="/notifications"
                    className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${colorClass}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <Badge variant="secondary" className="text-xs">
                        New
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link to="/competitors">Manage Alerts</Link>
          </Button>
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link to="/notifications">All Notifications</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
