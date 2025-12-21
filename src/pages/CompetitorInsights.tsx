import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  RefreshCw,
  Lightbulb,
  Target,
  TrendingUp,
  Award,
  Calendar,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useCompetitorInsights, useRefreshInsights } from "@/hooks/useCompetitorInsights";
import { Link } from "react-router-dom";

const priorityColors = {
  high: "bg-destructive text-destructive-foreground",
  medium: "bg-yellow-500 text-white",
  low: "bg-muted text-muted-foreground",
};

const effortColors = {
  low: "bg-green-500/20 text-green-700 dark:text-green-400",
  medium: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  high: "bg-red-500/20 text-red-700 dark:text-red-400",
};

const categoryIcons = {
  content: Lightbulb,
  seo: Target,
  engagement: TrendingUp,
  branding: Award,
  schedule: Calendar,
};

export default function CompetitorInsights() {
  const { data, isLoading, error } = useCompetitorInsights();
  const refreshInsights = useRefreshInsights();

  const insights = data?.insights;
  const competitors = data?.competitors || [];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Competitor Insights"
            description="AI-powered analysis and recommendations based on your competitors"
          />
          <Button
            onClick={() => refreshInsights.mutate()}
            disabled={refreshInsights.isPending}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshInsights.isPending ? "animate-spin" : ""}`} />
            Refresh Analysis
          </Button>
        </div>

        {error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-lg font-medium">Failed to load insights</p>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : "Please try again later"}
              </p>
              <Button onClick={() => refreshInsights.mutate()}>Retry</Button>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : !insights ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No insights available</p>
              <p className="text-muted-foreground mb-4">
                Add competitors to generate AI-powered insights
              </p>
              <Button asChild>
                <Link to="/competitors">Add Competitors</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Opportunity Score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Opportunity Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-primary">
                      {insights.opportunityScore.score}
                    </div>
                    <div className="flex-1">
                      <Progress value={insights.opportunityScore.score} className="h-2" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    {insights.opportunityScore.explanation}
                  </p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Upload Frequency Advice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Competitor Average</p>
                      <p className="text-lg font-semibold">{insights.uploadFrequencyAdvice.currentAverage}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Recommended</p>
                      <p className="text-lg font-semibold text-primary">
                        {insights.uploadFrequencyAdvice.recommended}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    {insights.uploadFrequencyAdvice.reasoning}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Content Gaps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Content Gaps
                </CardTitle>
                <CardDescription>
                  Topics and content types your competitors cover that you should explore
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.contentGaps.map((gap, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{gap.topic}</h4>
                        <Badge className={priorityColors[gap.priority]}>
                          {gap.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{gap.reason}</p>
                      <p className="text-xs text-primary font-medium">
                        Potential Impact: {gap.estimatedImpact}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strategy Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Strategy Recommendations
                </CardTitle>
                <CardDescription>
                  Actionable recommendations to improve your channel performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.strategyRecommendations.map((rec, index) => {
                    const Icon = categoryIcons[rec.category] || Lightbulb;
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-4 border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{rec.title}</h4>
                            <Badge variant="outline" className="capitalize">
                              {rec.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {rec.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs">
                            <span className={`px-2 py-1 rounded ${effortColors[rec.effort]}`}>
                              Effort: {rec.effort}
                            </span>
                            <span className={`px-2 py-1 rounded ${effortColors[rec.impact === "high" ? "low" : rec.impact === "low" ? "high" : "medium"]}`}>
                              Impact: {rec.impact}
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Competitor Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  Competitor Strengths
                </CardTitle>
                <CardDescription>
                  What your competitors do well and how you can learn from them
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {insights.competitorStrengths.map((strength, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    >
                      <h4 className="font-semibold text-primary mb-1">{strength.competitor}</h4>
                      <p className="text-sm font-medium mb-2">{strength.strength}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">How to apply:</span> {strength.howToLearn}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tracked Competitors Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Analyzed Competitors</CardTitle>
                <CardDescription>
                  {competitors.length} channels included in this analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {competitors.map((c, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {c.name} • {c.subscribers?.toLocaleString() || 0} subs
                    </Badge>
                  ))}
                </div>
                <Button asChild variant="link" className="px-0 mt-4">
                  <Link to="/competitors">
                    Manage Competitors <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
