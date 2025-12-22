import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useThumbnailAnalysis, useRefreshThumbnailAnalysis } from "@/hooks/useThumbnailAnalysis";
import { useUserThumbnailAnalysis, useRefreshUserThumbnailAnalysis } from "@/hooks/useUserThumbnailAnalysis";
import { RefreshCw, CheckCircle, XCircle, Eye, Palette, Type, Smile, AlertTriangle, ArrowRight, Image } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function ScoreRing({ score, size = 60 }: { score: number; size?: number }) {
  const getScoreColor = (s: number) => {
    if (s >= 71) return "text-green-500";
    if (s >= 41) return "text-yellow-500";
    return "text-red-500";
  };

  const getStrokeColor = (s: number) => {
    if (s >= 71) return "stroke-green-500";
    if (s >= 41) return "stroke-yellow-500";
    return "stroke-red-500";
  };

  const circumference = 2 * Math.PI * 24;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size} viewBox="0 0 60 60">
        <circle
          cx="30"
          cy="30"
          r="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-muted/30"
        />
        <circle
          cx="30"
          cy="30"
          r="24"
          fill="none"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={getStrokeColor(score)}
        />
      </svg>
      <span className={cn("absolute inset-0 flex items-center justify-center font-bold text-sm", getScoreColor(score))}>
        {score}
      </span>
    </div>
  );
}

export default function ThumbnailAnalysis() {
  const [selectedThumbnail, setSelectedThumbnail] = useState<{
    thumbnailUrl: string;
    title: string;
    score: number;
    strengths: string[];
    improvements: string[];
  } | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const { data: analysis, isLoading, error } = useThumbnailAnalysis();
  const { data: userAnalysis, isLoading: userLoading, error: userError } = useUserThumbnailAnalysis();
  const refreshMutation = useRefreshThumbnailAnalysis();
  const refreshUserMutation = useRefreshUserThumbnailAnalysis();

  const handleRefresh = () => {
    refreshMutation.mutate(undefined, {
      onSuccess: () => toast.success("Analysis refreshed!"),
      onError: (err) => toast.error(err.message),
    });
  };

  const handleUserRefresh = () => {
    refreshUserMutation.mutate(undefined, {
      onSuccess: () => toast.success("Your thumbnail analysis refreshed!"),
      onError: (err) => toast.error(err.message),
    });
  };

  const handleCompare = (thumbnail: typeof selectedThumbnail) => {
    setSelectedThumbnail(thumbnail);
    setIsCompareOpen(true);
  };

  const getScoreLabel = (score: number) => {
    if (score >= 71) return { label: "Excellent", color: "text-green-500" };
    if (score >= 41) return { label: "Good", color: "text-yellow-500" };
    return { label: "Needs Work", color: "text-red-500" };
  };

  return (
    <AppLayout>
      <PageHeader
        title="Thumbnail Analysis"
        description="AI-powered analysis of competitor thumbnails and your own thumbnail performance"
      />

      <Tabs defaultValue="competitors" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
            <TabsTrigger value="my-thumbnails">My Thumbnails</TabsTrigger>
          </TabsList>
        </div>

        {/* Competitors Tab */}
        <TabsContent value="competitors" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={handleRefresh} disabled={refreshMutation.isPending}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
              Refresh Analysis
            </Button>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : error ? (
            <Card className="border-destructive">
              <CardContent className="pt-6 text-center text-destructive">
                {error instanceof Error ? error.message : "Failed to load analysis"}
              </CardContent>
            </Card>
          ) : analysis ? (
            <div className="space-y-8">
              {/* Pattern Overview */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Palette className="h-4 w-4 text-primary" />
                      Color Schemes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysis.patterns.colorSchemes.map((c, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{c.dominant}</span>
                        <span className="text-muted-foreground">{c.frequency}%</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Type className="h-4 w-4 text-primary" />
                      Text Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>{analysis.patterns.textUsage.textStyle}</p>
                    <p className="text-muted-foreground">~{analysis.patterns.textUsage.avgWordCount} words avg</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Smile className="h-4 w-4 text-primary" />
                      Faces Present
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{analysis.patterns.facesPresent}%</p>
                    <p className="text-sm text-muted-foreground">of thumbnails</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Eye className="h-4 w-4 text-primary" />
                      Emotional Tone
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-1">
                    {analysis.patterns.emotionalTone.map((tone, i) => (
                      <Badge key={i} variant="secondary">{tone}</Badge>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Thumbnails</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {analysis.topPerformers.map((performer, i) => (
                      <div key={i} className="rounded-lg border overflow-hidden">
                        <img
                          src={performer.thumbnailUrl}
                          alt={performer.videoTitle}
                          className="w-full aspect-video object-cover"
                        />
                        <div className="p-3 space-y-2">
                          <p className="font-medium text-sm line-clamp-2">{performer.videoTitle}</p>
                          <p className="text-sm text-muted-foreground">{performer.views.toLocaleString()} views</p>
                          <div className="flex flex-wrap gap-1">
                            {performer.keyElements.slice(0, 3).map((el, j) => (
                              <Badge key={j} variant="outline" className="text-xs">{el}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Do's and Don'ts */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-green-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      Do's
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.doList.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-red-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-5 w-5" />
                      Don'ts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.dontList.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-lg border">
                        <Badge variant={rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "secondary"}>
                          {rec.priority}
                        </Badge>
                        <div>
                          <p className="font-medium">{rec.tip}</p>
                          <p className="text-sm text-muted-foreground">{rec.example}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </TabsContent>

        {/* My Thumbnails Tab */}
        <TabsContent value="my-thumbnails" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={handleUserRefresh} disabled={refreshUserMutation.isPending}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshUserMutation.isPending ? "animate-spin" : ""}`} />
              Refresh My Analysis
            </Button>
          </div>

          {userLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-32" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            </div>
          ) : userError ? (
            <Card className="border-destructive">
              <CardContent className="pt-6 text-center text-destructive">
                {userError instanceof Error ? userError.message : "Failed to load your thumbnail analysis"}
              </CardContent>
            </Card>
          ) : userAnalysis ? (
            <div className="space-y-6">
              {/* Overall Score Card */}
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Overall Thumbnail Score</h3>
                      <p className={cn("text-sm font-medium mt-1", getScoreLabel(userAnalysis.overallScore).color)}>
                        {getScoreLabel(userAnalysis.overallScore).label}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Based on {userAnalysis.userThumbnails.length} analyzed thumbnails
                      </p>
                    </div>
                    <ScoreRing score={userAnalysis.overallScore} size={80} />
                  </div>
                  <div className="mt-4">
                    <Progress value={userAnalysis.overallScore} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Top Recommendations */}
              {userAnalysis.topRecommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Top Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {userAnalysis.topRecommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* User Thumbnails Grid */}
              {userAnalysis.userThumbnails.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h4 className="font-medium mb-2">No Thumbnails Found</h4>
                    <p className="text-sm text-muted-foreground">
                      Connect your YouTube channel to analyze your thumbnails
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {userAnalysis.userThumbnails.map((thumbnail, i) => (
                    <Card key={i} className="overflow-hidden">
                      <div className="relative">
                        <img
                          src={thumbnail.thumbnailUrl}
                          alt={thumbnail.title}
                          className="w-full aspect-video object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <ScoreRing score={thumbnail.score} size={50} />
                        </div>
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <p className="font-medium text-sm line-clamp-2">{thumbnail.title}</p>
                        
                        {/* Strengths */}
                        {thumbnail.strengths.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-green-600">Strengths</p>
                            {thumbnail.strengths.slice(0, 2).map((s, j) => (
                              <div key={j} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                                {s}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Improvements */}
                        {thumbnail.improvements.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-yellow-600">Improvements</p>
                            {thumbnail.improvements.slice(0, 2).map((imp, j) => (
                              <div key={j} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 shrink-0" />
                                {imp}
                              </div>
                            ))}
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleCompare(thumbnail)}
                        >
                          Compare with Competitor
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </TabsContent>
      </Tabs>

      {/* Comparison Dialog */}
      <Dialog open={isCompareOpen} onOpenChange={setIsCompareOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Thumbnail Comparison</DialogTitle>
          </DialogHeader>
          {selectedThumbnail && userAnalysis?.competitorBenchmarks?.[0] && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* User Thumbnail */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge>Your Thumbnail</Badge>
                  <ScoreRing score={selectedThumbnail.score} size={40} />
                </div>
                <img
                  src={selectedThumbnail.thumbnailUrl}
                  alt={selectedThumbnail.title}
                  className="w-full aspect-video object-cover rounded-lg"
                />
                <p className="font-medium text-sm">{selectedThumbnail.title}</p>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-green-600">Strengths:</p>
                  {selectedThumbnail.strengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5" />
                      {s}
                    </div>
                  ))}
                  <p className="text-xs font-medium text-yellow-600 mt-3">Improvements:</p>
                  {selectedThumbnail.improvements.map((imp, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5" />
                      {imp}
                    </div>
                  ))}
                </div>
              </div>

              {/* Competitor Thumbnail */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Top Competitor</Badge>
                  <span className="text-xs text-muted-foreground">
                    {userAnalysis.competitorBenchmarks[0].channelName}
                  </span>
                </div>
                <img
                  src={userAnalysis.competitorBenchmarks[0].url}
                  alt="Competitor thumbnail"
                  className="w-full aspect-video object-cover rounded-lg"
                />
                <p className="text-sm text-muted-foreground">
                  This is a top-performing thumbnail from your competitor. 
                  Study the elements that make it effective.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
