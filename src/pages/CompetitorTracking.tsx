import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Users,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  TrendingUp,
  Eye,
  Video,
  Search,
  Bell,
} from "lucide-react";
import { useCompetitors, useAddCompetitor, useRemoveCompetitor, useRefreshCompetitor } from "@/hooks/useCompetitors";
import { useCompetitorAlerts } from "@/hooks/useCompetitorAlerts";
import { AlertRuleCard } from "@/components/competitors/AlertRuleCard";
import { AddAlertDialog } from "@/components/competitors/AddAlertDialog";
import { formatDistanceToNow } from "date-fns";

export default function CompetitorTracking() {
  const [channelInput, setChannelInput] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  
  const { data: competitors, isLoading } = useCompetitors();
  const { data: alerts, isLoading: alertsLoading } = useCompetitorAlerts();
  const addCompetitor = useAddCompetitor();
  const removeCompetitor = useRemoveCompetitor();
  const refreshCompetitor = useRefreshCompetitor();

  // Map alerts with competitor names
  const alertsWithNames = alerts?.map((alert) => ({
    ...alert,
    competitor_name: competitors?.find((c) => c.id === alert.competitor_id)?.channel_name,
  })) || [];

  const handleAddCompetitor = () => {
    if (!channelInput.trim()) return;
    addCompetitor.mutate(channelInput.trim());
    setChannelInput("");
  };

  const filteredCompetitors = competitors?.filter((c) =>
    c.channel_name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.channel_id.toLowerCase().includes(searchFilter.toLowerCase())
  ) || [];

  const totalSubscribers = competitors?.reduce((sum, c) => sum + (c.subscriber_count || 0), 0) || 0;
  const avgViews = competitors?.length
    ? Math.round(competitors.reduce((sum, c) => sum + (c.avg_views || 0), 0) / competitors.length)
    : 0;

  const formatNumber = (num: number | null) => {
    if (!num) return "N/A";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <PageHeader
          title="Competitor Tracking"
          description="Monitor and analyze competitor YouTube channels"
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tracked Channels</CardDescription>
              <CardTitle className="text-2xl">{competitors?.length || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Subscribers</CardDescription>
              <CardTitle className="text-2xl">{formatNumber(totalSubscribers)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg. Views/Video</CardDescription>
              <CardTitle className="text-2xl">{formatNumber(avgViews)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Analysis Status</CardDescription>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">Active</Badge>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Add Competitor Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Competitor</CardTitle>
            <CardDescription>
              Enter a YouTube channel URL or channel ID to start tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="https://youtube.com/@channel or channel ID"
                value={channelInput}
                onChange={(e) => setChannelInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCompetitor()}
                className="flex-1"
              />
              <Button
                onClick={handleAddCompetitor}
                disabled={!channelInput.trim() || addCompetitor.isPending}
              >
                {addCompetitor.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Channel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Competitors Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Tracked Competitors</CardTitle>
                <CardDescription>
                  {filteredCompetitors.length} channels being monitored
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter channels..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredCompetitors.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No competitors tracked yet</p>
                <p className="text-sm">Add a YouTube channel above to start monitoring</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Users className="h-4 w-4" />
                        Subscribers
                      </div>
                    </TableHead>
                    <TableHead className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Video className="h-4 w-4" />
                        Videos
                      </div>
                    </TableHead>
                    <TableHead className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Eye className="h-4 w-4" />
                        Avg Views
                      </div>
                    </TableHead>
                    <TableHead className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Last Video
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompetitors.map((competitor) => (
                    <TableRow key={competitor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{competitor.channel_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {competitor.channel_id.substring(0, 16)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatNumber(competitor.subscriber_count)}
                      </TableCell>
                      <TableCell className="text-right">
                        {competitor.video_count || "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(competitor.avg_views)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {competitor.last_video_date
                          ? formatDistanceToNow(new Date(competitor.last_video_date), { addSuffix: true })
                          : "Unknown"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => refreshCompetitor.mutate(competitor.id)}
                            disabled={refreshCompetitor.isPending}
                          >
                            <RefreshCw className={`h-4 w-4 ${refreshCompetitor.isPending ? "animate-spin" : ""}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <a
                              href={`https://youtube.com/channel/${competitor.channel_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Competitor</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to stop tracking {competitor.channel_name}?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => removeCompetitor.mutate(competitor.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Alert Rules Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5" />
                  Notification Alerts
                </CardTitle>
                <CardDescription>
                  Get notified when competitors upload videos or hit milestones
                </CardDescription>
              </div>
              <AddAlertDialog competitors={competitors || []} />
            </div>
          </CardHeader>
          <CardContent>
            {alertsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : alertsWithNames.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No alert rules configured</p>
                <p className="text-sm">Create an alert to get notified about competitor activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alertsWithNames.map((alert) => (
                  <AlertRuleCard key={alert.id} alert={alert} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
