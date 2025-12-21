import { Bell, Mail, Trash2, Video, TrendingUp, Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CompetitorAlert, useUpdateCompetitorAlert, useDeleteCompetitorAlert } from "@/hooks/useCompetitorAlerts";

interface AlertRuleCardProps {
  alert: CompetitorAlert & { competitor_name?: string };
}

const alertTypeConfig: Record<string, { icon: typeof Video; label: string; color: string }> = {
  new_video: { icon: Video, label: "New Video", color: "bg-blue-500/10 text-blue-500" },
  milestone_subscribers: { icon: Users, label: "Subscriber Milestone", color: "bg-green-500/10 text-green-500" },
  milestone_views: { icon: Eye, label: "Views Milestone", color: "bg-purple-500/10 text-purple-500" },
  trending_video: { icon: TrendingUp, label: "Trending Video", color: "bg-orange-500/10 text-orange-500" },
};

export function AlertRuleCard({ alert }: AlertRuleCardProps) {
  const updateAlert = useUpdateCompetitorAlert();
  const deleteAlert = useDeleteCompetitorAlert();

  const config = alertTypeConfig[alert.alert_type] || {
    icon: Bell,
    label: alert.alert_type,
    color: "bg-muted text-muted-foreground",
  };
  const Icon = config.icon;

  const handleToggleActive = () => {
    updateAlert.mutate({ id: alert.id, is_active: !alert.is_active });
  };

  const handleDelete = () => {
    deleteAlert.mutate(alert.id);
  };

  const formatThreshold = (threshold: number | null) => {
    if (!threshold) return null;
    if (threshold >= 1000000) return `${(threshold / 1000000).toFixed(1)}M`;
    if (threshold >= 1000) return `${(threshold / 1000).toFixed(0)}K`;
    return threshold.toString();
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
        alert.is_active ? "bg-card border-border" : "bg-muted/30 border-border/50 opacity-60"
      }`}
    >
      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${config.color}`}>
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{alert.competitor_name || "Unknown"}</p>
          <Badge variant="outline" className={`text-xs ${config.color}`}>
            {config.label}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
          {alert.threshold && (
            <span>Threshold: {formatThreshold(alert.threshold)}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Active</span>
          <Switch
            checked={alert.is_active}
            onCheckedChange={handleToggleActive}
            disabled={updateAlert.isPending}
          />
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Alert Rule</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this alert? You will no longer receive
                notifications for this trigger.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
