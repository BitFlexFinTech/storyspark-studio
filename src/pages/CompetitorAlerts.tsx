import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCompetitorAlerts, useCreateCompetitorAlert, useUpdateCompetitorAlert, useDeleteCompetitorAlert } from "@/hooks/useCompetitorAlerts";
import { useCompetitors } from "@/hooks/useCompetitors";
import { useNotifications } from "@/hooks/useNotifications";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { Bell, Plus, Trash2, Video, Users, TrendingUp, Eye, Mail, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const alertTypeOptions = [
  { value: "new_video", label: "New Video Upload", icon: Video, description: "When competitor uploads a new video" },
  { value: "subscriber_milestone", label: "Subscriber Milestone", icon: Users, description: "When competitor reaches X subscribers" },
  { value: "view_milestone", label: "View Milestone", icon: Eye, description: "When a video reaches X views" },
  { value: "trending", label: "Trending Video", icon: TrendingUp, description: "When a video goes viral (100k+ in 48hrs)" },
];

export default function CompetitorAlerts() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    competitor_id: "",
    alert_type: "new_video",
    threshold: 0,
    send_email: false,
    email_priority: "normal",
  });

  const { data: alerts = [], isLoading: alertsLoading } = useCompetitorAlerts();
  const { data: competitors = [] } = useCompetitors();
  const { data: notifications = [] } = useNotifications();
  const { unreadCount } = useRealtimeNotifications();
  
  const createAlert = useCreateCompetitorAlert();
  const updateAlert = useUpdateCompetitorAlert();
  const deleteAlert = useDeleteCompetitorAlert();

  const handleCreateAlert = () => {
    if (!newAlert.competitor_id && newAlert.alert_type !== "trending") {
      toast.error("Please select a competitor");
      return;
    }

    createAlert.mutate(
      {
        competitor_id: newAlert.competitor_id || null,
        alert_type: newAlert.alert_type,
        threshold: newAlert.threshold || null,
        send_email: newAlert.send_email,
        email_priority: newAlert.email_priority,
      },
      {
        onSuccess: () => {
          toast.success("Alert created!");
          setIsCreateOpen(false);
          setNewAlert({
            competitor_id: "",
            alert_type: "new_video",
            threshold: 0,
            send_email: false,
            email_priority: "normal",
          });
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const toggleAlert = (alertId: string, isActive: boolean) => {
    updateAlert.mutate(
      { id: alertId, is_active: !isActive },
      {
        onSuccess: () => toast.success(`Alert ${isActive ? "paused" : "activated"}`),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleDelete = (alertId: string) => {
    deleteAlert.mutate(alertId, {
      onSuccess: () => toast.success("Alert deleted"),
      onError: (err) => toast.error(err.message),
    });
  };

  const getAlertTypeInfo = (type: string) => {
    return alertTypeOptions.find((o) => o.value === type) || alertTypeOptions[0];
  };

  const recentNotifications = notifications
    .filter((n) => n.notification_type.includes("competitor") || n.notification_type.includes("alert"))
    .slice(0, 10);

  return (
    <AppLayout>
      <PageHeader
        title="Competitor Alerts"
        description="Get notified when competitors upload new videos or hit milestones"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Alert Rules */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Alert Rules</h3>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Alert
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Alert</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Alert Type</Label>
                    <Select
                      value={newAlert.alert_type}
                      onValueChange={(v) => setNewAlert({ ...newAlert, alert_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {alertTypeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              <opt.icon className="h-4 w-4" />
                              {opt.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {getAlertTypeInfo(newAlert.alert_type).description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Competitor</Label>
                    <Select
                      value={newAlert.competitor_id}
                      onValueChange={(v) => setNewAlert({ ...newAlert, competitor_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a competitor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Competitors</SelectItem>
                        {competitors.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.channel_name || c.channel_id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(newAlert.alert_type === "subscriber_milestone" || newAlert.alert_type === "view_milestone") && (
                    <div className="space-y-2">
                      <Label>Threshold</Label>
                      <Input
                        type="number"
                        value={newAlert.threshold}
                        onChange={(e) => setNewAlert({ ...newAlert, threshold: parseInt(e.target.value) || 0 })}
                        placeholder={newAlert.alert_type === "subscriber_milestone" ? "e.g., 100000" : "e.g., 1000000"}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive email when triggered</p>
                    </div>
                    <Switch
                      checked={newAlert.send_email}
                      onCheckedChange={(v) => setNewAlert({ ...newAlert, send_email: v })}
                    />
                  </div>

                  {newAlert.send_email && (
                    <div className="space-y-2">
                      <Label>Email Priority</Label>
                      <Select
                        value={newAlert.email_priority}
                        onValueChange={(v) => setNewAlert({ ...newAlert, email_priority: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (Digest)</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High (Immediate)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button 
                    onClick={handleCreateAlert} 
                    className="w-full"
                    disabled={createAlert.isPending}
                  >
                    Create Alert
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {alertsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h4 className="font-medium mb-2">No Alerts Configured</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Create alerts to get notified about competitor activity
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Alert
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => {
                const typeInfo = getAlertTypeInfo(alert.alert_type);
                const competitor = competitors.find((c) => c.id === alert.competitor_id);

                return (
                  <Card key={alert.id} className={!alert.is_active ? "opacity-60" : ""}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <typeInfo.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{typeInfo.label}</p>
                              {alert.send_email && (
                                <Badge variant="outline" className="text-xs">
                                  <Mail className="h-3 w-3 mr-1" />
                                  Email
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {competitor ? competitor.channel_name : "All competitors"}
                              {alert.threshold ? ` • Threshold: ${alert.threshold.toLocaleString()}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={alert.is_active || false}
                            onCheckedChange={() => toggleAlert(alert.id, alert.is_active || false)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(alert.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Notifications
              </span>
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount} new</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {recentNotifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No notifications yet
                </p>
              ) : (
                <div className="space-y-3">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border text-sm ${
                        !notification.is_read ? "bg-primary/5 border-primary/20" : ""
                      }`}
                    >
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(notification.created_at || ""), "MMM d, h:mm a")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
