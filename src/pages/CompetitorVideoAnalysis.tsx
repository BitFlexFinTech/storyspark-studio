import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompetitorVideos, useSyncCompetitorVideos, useTopCompetitorVideos, useCompetitorVideoStats } from '@/hooks/useCompetitorVideos';
import { useCompetitors } from '@/hooks/useCompetitors';
import { RefreshCw, Eye, ThumbsUp, MessageSquare, Play, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function CompetitorVideoAnalysis() {
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('all');
  const { data: competitors } = useCompetitors();
  const { data: videos, isLoading } = useCompetitorVideos(selectedCompetitor === 'all' ? undefined : selectedCompetitor);
  const { data: topVideos } = useTopCompetitorVideos(10);
  const { data: stats } = useCompetitorVideoStats();
  const syncMutation = useSyncCompetitorVideos();

  const handleSync = async () => {
    try {
      const result = await syncMutation.mutateAsync();
      toast.success(`Synced ${result.synced} videos from ${result.competitors.length} competitors`);
    } catch (error) {
      toast.error('Failed to sync competitor videos');
    }
  };

  // Prepare chart data
  const chartData = competitors?.slice(0, 5).map(comp => {
    const compVideos = videos?.filter(v => v.competitor_id === comp.id) || [];
    const avgViews = compVideos.length > 0 
      ? Math.round(compVideos.reduce((sum, v) => sum + v.views, 0) / compVideos.length)
      : 0;
    return { name: comp.channel_name || 'Unknown', avgViews, videoCount: compVideos.length };
  }) || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Competitor Video Analysis"
          description="Track and compare competitor video performance"
        />

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Play className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Videos</p>
                  <p className="text-2xl font-bold">{stats?.totalVideos || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{formatViews(stats?.totalViews || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Views</p>
                  <p className="text-2xl font-bold">{formatViews(stats?.avgViews || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-500/10 p-2">
                  <ThumbsUp className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Engagement</p>
                  <p className="text-2xl font-bold">{stats?.avgEngagement || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <Select value={selectedCompetitor} onValueChange={setSelectedCompetitor}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Competitors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Competitors</SelectItem>
              {competitors?.map(comp => (
                <SelectItem key={comp.id} value={comp.id}>
                  {comp.channel_name || comp.channel_id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSync} disabled={syncMutation.isPending}>
            <RefreshCw className={`mr-2 h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            {syncMutation.isPending ? 'Syncing...' : 'Sync Videos'}
          </Button>
        </div>

        <Tabs defaultValue="videos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="videos">All Videos</TabsTrigger>
            <TabsTrigger value="top">Top Performers</TabsTrigger>
            <TabsTrigger value="comparison">Comparison Chart</TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="space-y-4">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}><CardContent className="p-4"><Skeleton className="h-40 w-full" /></CardContent></Card>
                ))}
              </div>
            ) : videos && videos.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {videos.map(video => (
                  <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative aspect-video">
                      {video.thumbnail_url ? (
                        <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Play className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <Badge className="absolute bottom-2 right-2 bg-black/70">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDuration(video.duration_seconds)}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium line-clamp-2 mb-2">{video.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {video.competitor?.channel_name || 'Unknown Channel'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{formatViews(video.views)}</span>
                        <span className="flex items-center gap-1"><ThumbsUp className="h-4 w-4" />{formatViews(video.likes)}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" />{formatViews(video.comments)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No competitor videos yet</h3>
                  <p className="text-muted-foreground mb-4">Add competitors and sync their videos to start tracking</p>
                  <Button onClick={handleSync}>Sync Competitor Videos</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="top">
            <Card>
              <CardHeader><CardTitle>Top 10 Performing Videos</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topVideos?.map((video, index) => (
                    <div key={video.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <span className="text-2xl font-bold text-muted-foreground w-8">#{index + 1}</span>
                      {video.thumbnail_url && (
                        <img src={video.thumbnail_url} alt="" className="w-24 h-14 object-cover rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{video.title}</h4>
                        <p className="text-sm text-muted-foreground">{video.competitor?.channel_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{formatViews(video.views)} views</p>
                        <p className="text-sm text-muted-foreground">{formatViews(video.likes)} likes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison">
            <Card>
              <CardHeader><CardTitle>Average Views by Competitor</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(v) => formatViews(v)} />
                      <Tooltip formatter={(v: number) => formatViews(v)} />
                      <Legend />
                      <Bar dataKey="avgViews" name="Avg Views" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
