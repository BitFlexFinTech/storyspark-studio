import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

interface ComparisonData {
  userMetrics: {
    avgViews: number;
    avgWatchTimeHours: number;
    avgEngagement: number;
    videoCount: number;
  };
  competitorAvg: {
    avgViews: number;
    avgEngagement: number;
  };
  topCompetitor: {
    name: string;
    avgViews: number;
    avgEngagement: number;
  } | null;
  competitors: Array<{
    channelId: string;
    channelName: string;
    subscriberCount: number;
    metrics: {
      avgViews: number;
      avgLikes: number;
      avgEngagement: number;
      avgDuration: number;
      videoCount: number;
    };
    videos: Array<{
      videoId: string;
      title: string;
      publishedAt: string;
      views: number;
      likes: number;
      comments: number;
      durationMinutes: number;
    }>;
  }>;
}

interface CompetitorComparisonChartProps {
  data: ComparisonData | null;
  isLoading: boolean;
}

export function CompetitorComparisonChart({ data, isLoading }: CompetitorComparisonChartProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.competitors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Comparison</CardTitle>
          <CardDescription>Add competitors to see how your channel compares</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
          No competitor data available
        </CardContent>
      </Card>
    );
  }

  // Prepare bar chart data
  const barChartData = [
    {
      name: "You",
      views: data.userMetrics.avgViews,
      engagement: data.userMetrics.avgEngagement,
      fill: "hsl(var(--primary))",
    },
    {
      name: "Competitor Avg",
      views: data.competitorAvg.avgViews,
      engagement: data.competitorAvg.avgEngagement,
      fill: "hsl(var(--muted-foreground))",
    },
    ...(data.topCompetitor ? [{
      name: data.topCompetitor.name.substring(0, 15) + (data.topCompetitor.name.length > 15 ? "..." : ""),
      views: data.topCompetitor.avgViews,
      engagement: data.topCompetitor.avgEngagement,
      fill: "hsl(var(--destructive))",
    }] : []),
  ];

  // Prepare line chart data (video performance over time)
  const allVideos = data.competitors.flatMap((c) =>
    c.videos.map((v) => ({
      ...v,
      channelName: c.channelName,
      date: new Date(v.publishedAt).toLocaleDateString(),
    }))
  ).sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());

  // Prepare radar chart data
  const radarData = data.competitors.slice(0, 5).map((c) => ({
    channel: c.channelName.substring(0, 10),
    views: Math.min(c.metrics.avgViews / 1000, 100),
    engagement: c.metrics.avgEngagement * 10,
    likes: Math.min(c.metrics.avgLikes / 100, 100),
    duration: Math.min(c.metrics.avgDuration, 20),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Comparison</CardTitle>
        <CardDescription>
          Compare your channel metrics against competitors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tickFormatter={formatNumber} className="text-xs" />
                  <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === "views" ? formatNumber(value) : `${value.toFixed(1)}%`,
                      name === "views" ? "Avg Views" : "Engagement",
                    ]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="views" name="Avg Views" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="trends">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={allVideos.slice(-20)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis tickFormatter={formatNumber} className="text-xs" />
                  <Tooltip
                    formatter={(value: number) => [formatNumber(value), "Views"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="breakdown">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid className="stroke-muted" />
                  <PolarAngleAxis dataKey="channel" className="text-xs" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                  <Radar
                    name="Views (K)"
                    dataKey="views"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Engagement"
                    dataKey="engagement"
                    stroke="hsl(var(--destructive))"
                    fill="hsl(var(--destructive))"
                    fillOpacity={0.3}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
