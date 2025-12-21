import { useState } from "react";
import { useYouTubeChannels, useYouTubeChannelAnalytics } from "@/hooks/useYouTubeChannels";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { YouTubeSetupWizard } from "@/components/integrations/YouTubeSetupWizard";
import { 
  Youtube, 
  Plus, 
  Users, 
  Video, 
  Eye, 
  Clock, 
  TrendingUp, 
  BarChart3,
  Trash2,
  ExternalLink,
  RefreshCw
} from "lucide-react";
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

export default function YouTubeChannels() {
  const { channels, isLoading, deleteChannel, refetch } = useYouTubeChannels();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  const selectedChannel = channels.find(c => c.id === selectedChannelId) ?? channels[0];
  const { data: analytics, isLoading: analyticsLoading } = useYouTubeChannelAnalytics(selectedChannel?.id ?? null);

  const handleWizardComplete = () => {
    setWizardOpen(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="YouTube Channels"
        description="Manage and monitor all your connected YouTube channels"
      >
        <Button onClick={() => setWizardOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Channel
        </Button>
      </PageHeader>

      {/* Channel Selector */}
      {channels.length > 1 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Active Channel:</span>
              <Select
                value={selectedChannel?.id}
                onValueChange={setSelectedChannelId}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  {channels.map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      <div className="flex items-center gap-2">
                        {channel.thumbnail_url && (
                          <img 
                            src={channel.thumbnail_url} 
                            alt="" 
                            className="h-5 w-5 rounded-full"
                          />
                        )}
                        {channel.channel_name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && channels.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-red-100 p-4 mb-4">
              <Youtube className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No YouTube Channels Connected</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Connect your YouTube channel to start managing videos, tracking analytics, and optimizing content.
            </p>
            <Button onClick={() => setWizardOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Connect YouTube Channel
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Channel Cards */}
      {!isLoading && channels.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {channels.map((channel) => (
              <Card 
                key={channel.id} 
                className={channel.id === selectedChannel?.id ? 'ring-2 ring-primary' : ''}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {channel.thumbnail_url ? (
                        <img 
                          src={channel.thumbnail_url} 
                          alt={channel.channel_name}
                          className="h-12 w-12 rounded-full"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                          <Youtube className="h-6 w-6 text-red-600" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-base">{channel.channel_name}</CardTitle>
                        <CardDescription className="text-xs">
                          Connected {new Date(channel.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={channel.is_active ? "default" : "secondary"}>
                      {channel.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {channel.subscriber_count.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {channel.video_count} videos
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {channel.channel_url && (
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <a href={channel.channel_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </a>
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Disconnect Channel?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove {channel.channel_name} from Story Studio. 
                            You can reconnect it anytime.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteChannel.mutate(channel.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Disconnect
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Channel Analytics */}
          {selectedChannel && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {selectedChannel.channel_name} Analytics
                </h2>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {analyticsLoading ? (
                <div className="grid gap-4 md:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <Skeleton className="h-16 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Eye className="h-4 w-4" />
                          <span className="text-sm">Total Views</span>
                        </div>
                        <p className="text-2xl font-bold">
                          {analytics?.totalViews.toLocaleString() ?? 0}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">Watch Time</span>
                        </div>
                        <p className="text-2xl font-bold">
                          {analytics?.totalWatchTime.toFixed(1) ?? 0}h
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <BarChart3 className="h-4 w-4" />
                          <span className="text-sm">Avg Duration</span>
                        </div>
                        <p className="text-2xl font-bold">
                          {analytics?.avgViewDuration.toFixed(1) ?? 0}m
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm">New Subscribers</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                          +{analytics?.subscriberGrowth ?? 0}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Videos */}
                  {analytics?.topVideos && analytics.topVideos.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Top Performing Videos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analytics.topVideos.map((video, index) => (
                            <div key={video.id} className="flex items-center justify-between py-2 border-b last:border-0">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-muted-foreground w-6">
                                  #{index + 1}
                                </span>
                                <span className="font-medium truncate max-w-[300px]">
                                  {video.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{video.views.toLocaleString()} views</span>
                                <span>{video.likes.toLocaleString()} likes</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}

      <YouTubeSetupWizard 
        open={wizardOpen} 
        onOpenChange={setWizardOpen}
        onComplete={handleWizardComplete}
      />
    </div>
  );
}
