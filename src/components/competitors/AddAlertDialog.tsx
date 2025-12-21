import { useState } from "react";
import { Plus, Video, TrendingUp, Users, Eye, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateCompetitorAlert } from "@/hooks/useCompetitorAlerts";
import { toast } from "sonner";

interface Competitor {
  id: string;
  channel_name: string | null;
}

interface AddAlertDialogProps {
  competitors: Competitor[];
}

const alertTypes = [
  {
    value: "new_video",
    label: "New Video Upload",
    description: "Get notified when a new video is uploaded",
    icon: Video,
    hasThreshold: false,
  },
  {
    value: "milestone_subscribers",
    label: "Subscriber Milestone",
    description: "Notify when subscriber count reaches a threshold",
    icon: Users,
    hasThreshold: true,
    thresholdLabel: "Subscriber count",
    thresholdPlaceholder: "e.g., 100000",
  },
  {
    value: "milestone_views",
    label: "Views Milestone",
    description: "Notify when a video hits a view count",
    icon: Eye,
    hasThreshold: true,
    thresholdLabel: "View count",
    thresholdPlaceholder: "e.g., 50000",
  },
  {
    value: "trending_video",
    label: "Trending Video",
    description: "Notify when a video goes viral (high views in short time)",
    icon: TrendingUp,
    hasThreshold: true,
    thresholdLabel: "Views threshold (default: 100K)",
    thresholdPlaceholder: "100000",
  },
] as const;

type AlertType = typeof alertTypes[number]["value"];

export function AddAlertDialog({ competitors }: AddAlertDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>("");
  const [alertType, setAlertType] = useState<AlertType>("new_video");
  const [threshold, setThreshold] = useState<string>("");
  const [sendEmail, setSendEmail] = useState(false);
  const [emailPriority, setEmailPriority] = useState<"normal" | "high">("normal");

  const createAlert = useCreateCompetitorAlert();

  const selectedAlertConfig = alertTypes.find((t) => t.value === alertType);

  const handleSubmit = () => {
    if (!selectedCompetitor || !alertType) return;

    createAlert.mutate(
      {
        competitor_id: selectedCompetitor,
        alert_type: alertType,
        threshold: threshold ? parseInt(threshold) : undefined,
        send_email: sendEmail,
        email_priority: emailPriority,
      },
      {
        onSuccess: () => {
          toast.success("Alert rule created successfully!");
          setOpen(false);
          resetForm();
        },
        onError: (error) => {
          toast.error("Failed to create alert: " + error.message);
        },
      }
    );
  };

  const resetForm = () => {
    setSelectedCompetitor("");
    setAlertType("new_video");
    setThreshold("");
    setSendEmail(false);
    setEmailPriority("normal");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Alert Rule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Alert Rule</DialogTitle>
          <DialogDescription>
            Get notified when competitors upload videos or hit milestones.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Competitor</Label>
            <Select value={selectedCompetitor} onValueChange={setSelectedCompetitor}>
              <SelectTrigger>
                <SelectValue placeholder="Select a competitor" />
              </SelectTrigger>
              <SelectContent>
                {competitors.map((competitor) => (
                  <SelectItem key={competitor.id} value={competitor.id}>
                    {competitor.channel_name || competitor.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Alert Type</Label>
            <RadioGroup
              value={alertType}
              onValueChange={(v) => setAlertType(v as AlertType)}
              className="space-y-2"
            >
              {alertTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <label
                    key={type.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      alertType === type.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={type.value} className="mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{type.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {type.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </RadioGroup>
          </div>

          {selectedAlertConfig?.hasThreshold && (
            <div className="space-y-2">
              <Label>{selectedAlertConfig.thresholdLabel}</Label>
              <Input
                type="number"
                placeholder={selectedAlertConfig.thresholdPlaceholder}
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </div>
          )}

          {/* Email Notification Settings */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="send-email" className="cursor-pointer">
                  Email Notifications
                </Label>
              </div>
              <Switch
                id="send-email"
                checked={sendEmail}
                onCheckedChange={setSendEmail}
              />
            </div>

            {sendEmail && (
              <div className="space-y-2 pl-6">
                <Label>Email Priority</Label>
                <Select
                  value={emailPriority}
                  onValueChange={(v) => setEmailPriority(v as "normal" | "high")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">
                      <div className="flex flex-col">
                        <span>Normal Priority</span>
                        <span className="text-xs text-muted-foreground">
                          Included in digest emails
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex flex-col">
                        <span>High Priority</span>
                        <span className="text-xs text-muted-foreground">
                          Immediate email notification
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedCompetitor || createAlert.isPending}
          >
            {createAlert.isPending ? "Creating..." : "Create Alert"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
