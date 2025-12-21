import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  BarChart2,
  Eye,
  ThumbsUp,
  MessageSquare,
  Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CompetitorComparisonChart } from "@/components/analytics/CompetitorComparisonChart";
import { Link } from "react-router-dom";

export default function PerformanceComparison() {
  const { user } = useAuth();
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>("all");

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["competitor-videos", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("fetch-competitor-videos");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTrendIcon = (userValue: number, competitorValue: number) => {
    if (userValue > competitorValue * 1.1) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (userValue < competitorValue * 0.9) {
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const filteredCompetitors = selectedCompetitor === "all"
    ? data?.competitors || []
    : data?.competitors?.filter((c: any) => c.channelId === selectedCompetitor) || [];

  const allVideos = filteredCompetitors.flatMap((c: any) =>
    c.videos.map((v: any) => ({ ...v, channelName: c.channelName }))
  );

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Performance Comparison"
            description="Compare your channel's performance against competitors"
          />
          <Button
            onClick={() => refetch()}
            disabled={isRefetching}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>

        {error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-lg font-medium text-destructive">Failed to load comparison data</p>
              <Button onClick={() => refetch()} className="mt-4">Retry</Button>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-[400px]" />
          </div>
        ) : !data?.competitors?.length ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No competitor data available</p>
              <p className="text-muted-foreground mb-4">Add competitors to compare performance</p>
              <Button asChild>
                <Link to="/competitors">Add Competitors</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    Your Avg Views
                  </CardDescription>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {formatNumber(data.userMetrics.avgViews)}
                    {getTrendIcon(data.userMetrics.avgViews, data.competitorAvg.avgViews)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Competitor avg: {formatNumber(data.competitorAvg.avgViews)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    Your Engagement
                  </CardDescription>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {data.userMetrics.avgEngagement.toFixed(1)}%
                    {getTrendIcon(data.userMetrics.avgEngagement, data.competitorAvg.avgEngagement)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Competitor avg: {data.competitorAvg.avgEngagement.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Watch Time (hrs)
                  </CardDescription>
                  <CardTitle className="text-2xl">
                    {data.userMetrics.avgWatchTimeHours.toFixed(1)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Based on {data.userMetrics.videoCount} videos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Top Competitor</CardDescription>
                  <CardTitle className="text-lg truncate">
                    {data.topCompetitor?.name || "N/A"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {data.topCompetitor ? `${formatNumber(data.topCompetitor.avgViews)} avg views` : "No data"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart */}
            <CompetitorComparisonChart data={data} isLoading={false} />

            {/* Competitor Filter */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Video Performance Details</CardTitle>
                    <CardDescription>
                      Recent videos from tracked competitors
                    </CardDescription>
                  </div>
                  <Select value={selectedCompetitor} onValueChange={setSelectedCompetitor}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Competitors</SelectItem>
                      {data.competitors.map((c: any) => (
                        <SelectItem key={c.channelId} value={c.channelId}>
                          {c.channelName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Video</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                      <TableHead className="text-right">Likes</TableHead>
                      <TableHead className="text-right">Comments</TableHead>
                      <TableHead className="text-right">Duration</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allVideos.slice(0, 20).map((video: any) => (
                      <TableRow key={video.videoId}>
                        <TableCell>
                          <div className="max-w-[250px]">
                            <p className="font-medium truncate">{video.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(video.publishedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{video.channelName}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatNumber(video.views)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(video.likes)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(video.comments)}
                        </TableCell>
                        <TableCell className="text-right">
                          {video.durationMinutes.toFixed(0)}m
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <a
                              href={`https://youtube.com/watch?v=${video.videoId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
