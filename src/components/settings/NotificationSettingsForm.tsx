import { useState, useEffect } from "react";
import { Bell, Mail, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  useNotificationSettings,
  useCreateNotificationSettings,
  useUpdateNotificationSettings,
  NotificationSettings,
  UpdateNotificationSettingsInput,
} from "@/hooks/useNotificationSettings";

const daysOfWeek = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

const timeOptions = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
];

export function NotificationSettingsForm() {
  const { data: settings, isLoading } = useNotificationSettings();
  const createSettings = useCreateNotificationSettings();
  const updateSettings = useUpdateNotificationSettings();

  const [formData, setFormData] = useState<UpdateNotificationSettingsInput>({
    email_enabled: true,
    email_frequency: "immediate",
    email_for_new_videos: true,
    email_for_milestones: true,
    email_for_trending: true,
    digest_time: "09:00:00",
    digest_day: 1,
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        email_enabled: settings.email_enabled,
        email_frequency: settings.email_frequency as "immediate" | "daily_digest" | "weekly_digest",
        email_for_new_videos: settings.email_for_new_videos,
        email_for_milestones: settings.email_for_milestones,
        email_for_trending: settings.email_for_trending,
        digest_time: settings.digest_time,
        digest_day: settings.digest_day,
      });
    }
  }, [settings]);

  const handleChange = <K extends keyof UpdateNotificationSettingsInput>(
    key: K,
    value: UpdateNotificationSettingsInput[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      if (!settings) {
        await createSettings.mutateAsync(formData);
      } else {
        await updateSettings.mutateAsync(formData);
      }
      toast.success("Notification settings saved!");
      setHasChanges(false);
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle>Email Notifications</CardTitle>
        </div>
        <CardDescription>
          Configure how and when you receive email notifications about competitor activity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="email-enabled" className="text-base font-medium cursor-pointer">
                Receive Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Turn off to disable all email notifications
              </p>
            </div>
          </div>
          <Switch
            id="email-enabled"
            checked={formData.email_enabled}
            onCheckedChange={(v) => handleChange("email_enabled", v)}
          />
        </div>

        {formData.email_enabled && (
          <>
            {/* Notification Types */}
            <div className="space-y-4">
              <Label className="text-base">Notification Types</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="new-videos" className="cursor-pointer">
                    New competitor videos
                  </Label>
                  <Switch
                    id="new-videos"
                    checked={formData.email_for_new_videos}
                    onCheckedChange={(v) => handleChange("email_for_new_videos", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="milestones" className="cursor-pointer">
                    Subscriber/view milestones
                  </Label>
                  <Switch
                    id="milestones"
                    checked={formData.email_for_milestones}
                    onCheckedChange={(v) => handleChange("email_for_milestones", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="trending" className="cursor-pointer">
                    Trending videos
                  </Label>
                  <Switch
                    id="trending"
                    checked={formData.email_for_trending}
                    onCheckedChange={(v) => handleChange("email_for_trending", v)}
                  />
                </div>
              </div>
            </div>

            {/* Delivery Frequency */}
            <div className="space-y-4">
              <Label className="text-base">Delivery Frequency</Label>
              <RadioGroup
                value={formData.email_frequency}
                onValueChange={(v) =>
                  handleChange("email_frequency", v as "immediate" | "daily_digest" | "weekly_digest")
                }
                className="space-y-3"
              >
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.email_frequency === "immediate"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="immediate" />
                  <div>
                    <span className="font-medium">Immediate</span>
                    <p className="text-xs text-muted-foreground">
                      Get notified right away for high-priority alerts
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.email_frequency === "daily_digest"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="daily_digest" />
                  <div className="flex-1">
                    <span className="font-medium">Daily Digest</span>
                    <p className="text-xs text-muted-foreground">
                      Receive a summary once per day
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.email_frequency === "weekly_digest"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="weekly_digest" />
                  <div className="flex-1">
                    <span className="font-medium">Weekly Digest</span>
                    <p className="text-xs text-muted-foreground">
                      Receive a weekly summary
                    </p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            {/* Digest Timing */}
            {(formData.email_frequency === "daily_digest" ||
              formData.email_frequency === "weekly_digest") && (
              <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label>Digest Delivery Time</Label>
                </div>
                <div className="flex gap-4">
                  {formData.email_frequency === "weekly_digest" && (
                    <div className="flex-1 space-y-2">
                      <Label className="text-sm text-muted-foreground">Day</Label>
                      <Select
                        value={String(formData.digest_day)}
                        onValueChange={(v) => handleChange("digest_day", parseInt(v))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {daysOfWeek.map((day) => (
                            <SelectItem key={day.value} value={String(day.value)}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <Label className="text-sm text-muted-foreground">Time</Label>
                    <Select
                      value={formData.digest_time?.slice(0, 5)}
                      onValueChange={(v) => handleChange("digest_time", v + ":00")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={!hasChanges && !!settings}
          >
            {createSettings.isPending || updateSettings.isPending
              ? "Saving..."
              : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
