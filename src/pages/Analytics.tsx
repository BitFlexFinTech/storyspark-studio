import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Eye,
  Users,
  Clock,
  TrendingUp,
  ThumbsUp,
  MessageSquare,
  Share2,
  BarChart3,
} from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useVideos } from "@/hooks/useVideos";
import { useState } from "react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--status-published))", "hsl(var(--muted-foreground))"];

// Default demographics data
const defaultDemographics = {
  ageGroups: [
    { name: "2-4", value: 25 },
    { name: "5-7", value: 35 },
    { name: "8-10", value: 25 },
    { name: "Parents", value: 15 },
  ],
  countries: [
    { name: "United States", value: 35 },
    { name: "United Kingdom", value: 18 },
    { name: "Canada", value: 12 },
    { name: "Australia", value: 10 },
    { name: "Germany", value: 8 },
  ],
};

const Analytics = () => {
  const [dateRange, setDateRange] = useState("7d");
  const { data: analyticsData = [], isLoading: analyticsLoading } = useAnalytics();
  const { data: videos = [], isLoading: videosLoading } = useVideos();

  const isLoading = analyticsLoading || videosLoading;

  // Aggregate analytics from real data
  const totalViews = analyticsData.reduce((sum, a) => sum + (a.views || 0), 0);
  const totalLikes = analyticsData.reduce((sum, a) => sum + (a.likes || 0), 0);
  const totalComments = analyticsData.reduce((sum, a) => sum + (a.comments || 0), 0);
  const totalWatchTime = analyticsData.reduce((sum, a) => sum + (a.watch_time_hours || 0), 0);

  const aggregatedAnalytics = {
    totalViews: totalViews || 0,
    totalSubscribers: 0, // Would come from channel data
    subscriberGrowth: 0,
    avgWatchTime: totalWatchTime > 0 ? `${(totalWatchTime / Math.max(analyticsData.length, 1)).toFixed(1)}h` : "0h",
    engagementRate: totalViews > 0 ? ((totalLikes + totalComments) / totalViews * 100).toFixed(1) : "0",
    demographics: defaultDemographics,
  };

  // Create time series data for charts
  const timeSeriesData = analyticsData.slice(-7).map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    views: item.views || 0,
    likes: item.likes || 0,
    comments: item.comments || 0,
  }));

  // If no real data, show placeholder chart data
  const chartData = timeSeriesData.length > 0 ? timeSeriesData : [
    { date: "No data", views: 0, likes: 0, comments: 0 }
  ];

  // Video performance data
  const videoPerformance = videos.slice(0, 5).map((video, i) => {
    const videoAnalytics = analyticsData.filter(a => a.video_id === video.id);
    const views = videoAnalytics.reduce((sum, a) => sum + (a.views || 0), 0);
    const likes = videoAnalytics.reduce((sum, a) => sum + (a.likes || 0), 0);
    const watchTime = videoAnalytics.reduce((sum, a) => sum + (a.watch_time_hours || 0), 0);
    
    return {
      id: video.id,
      title: video.title,
      totalViews: views,
      avgWatchTime: watchTime > 0 ? `${watchTime.toFixed(1)}h` : "N/A",
      engagementRate: views > 0 ? ((likes / views) * 100).toFixed(1) : "0",
    };
  });

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <AppLayout>
      <PageHeader
        title="Analytics"
        description="Track your content performance and audience engagement"
      >
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      {/* Stats Overview */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))
        ) : (
          <>
            <StatCard
              title="Total Views"
              value={formatNumber(aggregatedAnalytics.totalViews)}
              icon={<Eye className="h-5 w-5 text-primary" />}
              trend={aggregatedAnalytics.totalViews > 0 ? { value: 12.5, isPositive: true } : undefined}
            />
            <StatCard
              title="Total Likes"
              value={formatNumber(totalLikes)}
              icon={<ThumbsUp className="h-5 w-5 text-secondary" />}
            />
            <StatCard
              title="Avg Watch Time"
              value={aggregatedAnalytics.avgWatchTime}
              icon={<Clock className="h-5 w-5 text-accent-foreground" />}
            />
            <StatCard
              title="Engagement Rate"
              value={`${aggregatedAnalytics.engagementRate}%`}
              icon={<TrendingUp className="h-5 w-5 text-status-published" />}
            />
          </>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Views Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Views Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : chartData.length > 0 && chartData[0].views > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={formatNumber} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="views"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorViews)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mb-4 opacity-50" />
                  <p>No analytics data yet</p>
                  <p className="text-sm">Import videos to start tracking performance</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          {/* Engagement Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : chartData.length > 0 && (chartData[0].likes > 0 || chartData[0].comments > 0) ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="likes" fill="hsl(var(--primary))" name="Likes" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="comments" fill="hsl(var(--secondary))" name="Comments" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                  <ThumbsUp className="h-12 w-12 mb-4 opacity-50" />
                  <p>No engagement data yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Engagement Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <ThumbsUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Likes</p>
                    <p className="text-2xl font-bold">
                      {formatNumber(totalLikes)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-secondary/10 p-3">
                    <MessageSquare className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Comments</p>
                    <p className="text-2xl font-bold">
                      {formatNumber(totalComments)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-accent/20 p-3">
                    <Share2 className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Shares</p>
                    <p className="text-2xl font-bold">N/A</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Age Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>Age Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={aggregatedAnalytics.demographics.ageGroups}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {aggregatedAnalytics.demographics.ageGroups.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Top Countries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aggregatedAnalytics.demographics.countries.map((country, i) => (
                    <div key={country.name} className="flex items-center gap-3">
                      <div className="w-32 truncate font-medium">{country.name}</div>
                      <div className="flex-1">
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${country.value}%`,
                              backgroundColor: COLORS[i % COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                      <div className="w-12 text-right text-sm text-muted-foreground">
                        {country.value}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {/* Top Performing Content */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : videoPerformance.length > 0 ? (
                <div className="space-y-4">
                  {videoPerformance.map((video, i) => (
                    <div
                      key={video.id}
                      className="flex items-center gap-4 rounded-xl border border-border p-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
                        #{i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{video.title}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatNumber(video.totalViews)} views</span>
                          <span>•</span>
                          <span>{video.avgWatchTime} avg watch time</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-status-approved">
                          {video.engagementRate}%
                        </p>
                        <p className="text-xs text-muted-foreground">engagement</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Eye className="h-12 w-12 mb-4 opacity-50" />
                  <p>No videos imported yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Analytics;
