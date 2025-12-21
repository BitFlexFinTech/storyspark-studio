import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useThumbnailAnalysis, useRefreshThumbnailAnalysis } from "@/hooks/useThumbnailAnalysis";
import { RefreshCw, CheckCircle, XCircle, Eye, Palette, Type, Smile } from "lucide-react";
import { toast } from "sonner";

export default function ThumbnailAnalysis() {
  const { data: analysis, isLoading, error } = useThumbnailAnalysis();
  const refreshMutation = useRefreshThumbnailAnalysis();

  const handleRefresh = () => {
    refreshMutation.mutate(undefined, {
      onSuccess: () => toast.success("Analysis refreshed!"),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <AppLayout>
      <PageHeader
        title="Thumbnail Analysis"
        description="AI-powered analysis of competitor thumbnails to identify what makes them perform well"
      />

      <div className="flex justify-end mb-6">
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
    </AppLayout>
  );
}
