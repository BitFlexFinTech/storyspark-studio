import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useShortsAnalysis, useRefreshShortsAnalysis } from "@/hooks/useShortsAnalysis";
import { RefreshCw, Video, TrendingUp, Eye, ThumbsUp, Lightbulb, BarChart2, Zap } from "lucide-react";
import { toast } from "sonner";

export default function ShortsAnalyzer() {
  const { data: analysis, isLoading, error } = useShortsAnalysis();
  const refreshMutation = useRefreshShortsAnalysis();

  const handleRefresh = () => {
    refreshMutation.mutate(undefined, {
      onSuccess: () => toast.success("Analysis refreshed!"),
      onError: (err) => toast.error(err.message),
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <AppLayout>
      <PageHeader
        title="Shorts Analyzer"
        description="Compare your YouTube Shorts performance against competitors"
      />

      <div className="flex justify-end mb-6">
        <Button onClick={handleRefresh} disabled={refreshMutation.isPending}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
          Refresh Analysis
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      ) : error ? (
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center text-destructive">
            {error instanceof Error ? error.message : "Failed to load analysis"}
          </CardContent>
        </Card>
      ) : analysis ? (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Video className="h-4 w-4 text-primary" />
                  Your Shorts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analysis.userShorts.count}</p>
                <p className="text-xs text-muted-foreground">
                  Avg {formatNumber(analysis.userShorts.metrics.avgViews)} views
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  Competitor Shorts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analysis.competitorShorts.count}</p>
                <p className="text-xs text-muted-foreground">
                  Avg {formatNumber(analysis.competitorShorts.metrics.avgViews)} views
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Views Gap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${analysis.comparison.viewsGap > 0 ? "text-red-500" : "text-green-500"}`}>
                  {analysis.comparison.viewsGap > 0 ? "-" : "+"}
                  {formatNumber(Math.abs(analysis.comparison.viewsGap))}
                </p>
                <p className="text-xs text-muted-foreground">vs competitors</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-primary" />
                  Engagement Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analysis.userShorts.metrics.avgEngagement}%</p>
                <p className="text-xs text-muted-foreground">
                  Competitor: {analysis.competitorShorts.metrics.avgEngagement}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Comparison Bar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Your Avg Views</span>
                  <span>{formatNumber(analysis.userShorts.metrics.avgViews)}</span>
                </div>
                <Progress 
                  value={Math.min(100, (analysis.userShorts.metrics.avgViews / Math.max(analysis.competitorShorts.metrics.avgViews, 1)) * 100)} 
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Competitor Avg Views</span>
                  <span>{formatNumber(analysis.competitorShorts.metrics.avgViews)}</span>
                </div>
                <Progress value={100} className="h-2 bg-muted" />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="competitors" className="space-y-4">
            <TabsList>
              <TabsTrigger value="competitors">Top Competitor Shorts</TabsTrigger>
              <TabsTrigger value="yours">Your Shorts</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="competitors">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Competitor Shorts</CardTitle>
                </CardHeader>
                <CardContent>
                  {analysis.competitorShorts.topPerformers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No competitor Shorts found. Add competitors to see their Shorts.
                    </p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {analysis.competitorShorts.topPerformers.map((short, i) => (
                        <div key={i} className="rounded-lg border overflow-hidden">
                          {short.thumbnail_url ? (
                            <img
                              src={short.thumbnail_url}
                              alt={short.title}
                              className="w-full aspect-[9/16] object-cover"
                            />
                          ) : (
                            <div className="w-full aspect-[9/16] bg-muted flex items-center justify-center">
                              <Video className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <div className="p-3 space-y-2">
                            <p className="font-medium text-sm line-clamp-2">{short.title}</p>
                            <p className="text-xs text-muted-foreground">{short.channel_name}</p>
                            <div className="flex gap-2 text-xs">
                              <Badge variant="secondary">
                                <Eye className="h-3 w-3 mr-1" />
                                {formatNumber(short.views)}
                              </Badge>
                              <Badge variant="outline">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                {short.engagement_rate}%
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="yours">
              <Card>
                <CardHeader>
                  <CardTitle>Your Shorts</CardTitle>
                </CardHeader>
                <CardContent>
                  {analysis.userShorts.videos.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No Shorts found. Create short-form content (≤60 seconds) to see them here.
                    </p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {analysis.userShorts.videos.map((video) => (
                        <div key={video.id} className="rounded-lg border overflow-hidden">
                          {video.thumbnail_url ? (
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="w-full aspect-[9/16] object-cover"
                            />
                          ) : (
                            <div className="w-full aspect-[9/16] bg-muted flex items-center justify-center">
                              <Video className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          <div className="p-3 space-y-2">
                            <p className="font-medium text-sm line-clamp-2">{video.title}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant={video.status === "published" ? "default" : "secondary"}>
                                {video.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{video.duration}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.insights.trends.map((trend, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Zap className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                          {trend}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.insights.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0">
                            {i + 1}
                          </span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Video className="h-4 w-4 text-blue-500" />
                      Top Formats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysis.insights.topFormats.map((format, i) => (
                        <Badge key={i} variant="secondary">{format}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {analysis.insights.hookPatterns && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Zap className="h-4 w-4 text-orange-500" />
                        Hook Patterns
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.insights.hookPatterns.map((hook, i) => (
                          <li key={i} className="text-sm text-muted-foreground">
                            "{hook}"
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </AppLayout>
  );
}
