import { useState } from "react";
import { 
  useKeywordSearch, 
  useTrendingKeywords, 
  useSavedKeywords, 
  useSaveKeyword,
  useDeleteKeyword 
} from "@/hooks/useKeywords";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Bookmark,
  BookmarkPlus,
  Trash2,
  Sparkles,
  Target,
  BarChart3,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface KeywordResult {
  keyword: string;
  search_volume: number;
  competition_score: number;
  outlier_score: number;
  trend_direction: 'rising' | 'stable' | 'declining';
  difficulty?: string;
  related_keywords: string[];
  long_tail_keywords?: string[];
  content_ideas?: string[];
  best_video_format?: string;
  target_audience?: string;
}

export default function KeywordResearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState<KeywordResult | null>(null);
  const [expandedResult, setExpandedResult] = useState(false);

  const { searchKeyword, isSearching } = useKeywordSearch();
  const { data: trendingKeywords, isLoading: trendingLoading } = useTrendingKeywords();
  const { data: savedKeywords, isLoading: savedLoading } = useSavedKeywords();
  const saveKeyword = useSaveKeyword();
  const deleteKeyword = useDeleteKeyword();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    const result = await searchKeyword(searchTerm);
    if (result) {
      setSearchResult(result);
      setExpandedResult(true);
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifficultyBadge = (difficulty: string | undefined) => {
    switch (difficulty) {
      case 'easy': return <Badge variant="outline" className="bg-green-50 text-green-700">Easy</Badge>;
      case 'hard': return <Badge variant="outline" className="bg-red-50 text-red-700">Hard</Badge>;
      default: return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Medium</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Keyword Research"
        description="Discover high-performing keywords and trending topics for your videos"
      />

      {/* Search Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter a keyword to research..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching || !searchTerm.trim()}>
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Result */}
      {searchResult && (
        <Collapsible open={expandedResult} onOpenChange={setExpandedResult}>
          <Card className="border-primary/50">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {searchResult.keyword}
                    {getTrendIcon(searchResult.trend_direction)}
                  </CardTitle>
                  <CardDescription>AI-powered keyword analysis</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => saveKeyword.mutate(searchResult)}
                    disabled={saveKeyword.isPending}
                  >
                    <BookmarkPlus className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {expandedResult ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Search Volume</span>
                  <p className="text-xl font-bold">{searchResult.search_volume.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Competition</span>
                  <div className="flex items-center gap-2">
                    <Progress value={searchResult.competition_score * 100} className="flex-1" />
                    <span className={`text-sm font-medium ${getScoreColor(1 - searchResult.competition_score)}`}>
                      {(searchResult.competition_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Viral Potential</span>
                  <div className="flex items-center gap-2">
                    <Progress value={searchResult.outlier_score * 100} className="flex-1" />
                    <span className={`text-sm font-medium ${getScoreColor(searchResult.outlier_score)}`}>
                      {(searchResult.outlier_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Difficulty</span>
                  <div>{getDifficultyBadge(searchResult.difficulty)}</div>
                </div>
              </div>

              <CollapsibleContent className="space-y-4">
                {/* Related Keywords */}
                {searchResult.related_keywords?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Related Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {searchResult.related_keywords.map((kw, i) => (
                        <Badge 
                          key={i} 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-secondary/80"
                          onClick={() => {
                            setSearchTerm(kw);
                            handleSearch();
                          }}
                        >
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Long Tail Keywords */}
                {searchResult.long_tail_keywords && searchResult.long_tail_keywords.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Long-Tail Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {searchResult.long_tail_keywords.map((kw, i) => (
                        <Badge key={i} variant="outline">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Ideas */}
                {searchResult.content_ideas && searchResult.content_ideas.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Video Ideas
                    </h4>
                    <ul className="space-y-2">
                      {searchResult.content_ideas.map((idea, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-primary">•</span>
                          {idea}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Additional Info */}
                <div className="grid md:grid-cols-2 gap-4 pt-2 border-t">
                  {searchResult.best_video_format && (
                    <div>
                      <span className="text-sm text-muted-foreground">Best Format</span>
                      <p className="font-medium capitalize">{searchResult.best_video_format}</p>
                    </div>
                  )}
                  {searchResult.target_audience && (
                    <div>
                      <span className="text-sm text-muted-foreground">Target Audience</span>
                      <p className="font-medium">{searchResult.target_audience}</p>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </CardContent>
          </Card>
        </Collapsible>
      )}

      {/* Tabs for Trending and Saved */}
      <Tabs defaultValue="trending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trending" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-2">
            <Bookmark className="h-4 w-4" />
            Saved ({savedKeywords?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trending Keywords</CardTitle>
              <CardDescription>Currently popular topics on YouTube</CardDescription>
            </CardHeader>
            <CardContent>
              {trendingLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : trendingKeywords && trendingKeywords.length > 0 ? (
                <div className="space-y-2">
                  {trendingKeywords.map((kw, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer"
                      onClick={() => {
                        setSearchTerm(kw.keyword);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground w-6">
                          #{index + 1}
                        </span>
                        <span className="font-medium">{kw.keyword}</span>
                        {getTrendIcon(kw.trend_direction)}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {kw.search_volume?.toLocaleString()} searches
                        </span>
                        <Badge variant="outline">{kw.category}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No trending keywords available. Try searching for a keyword above.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Saved Keywords</CardTitle>
              <CardDescription>Keywords you're tracking</CardDescription>
            </CardHeader>
            <CardContent>
              {savedLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : savedKeywords && savedKeywords.length > 0 ? (
                <div className="space-y-2">
                  {savedKeywords.map((kw) => (
                    <div 
                      key={kw.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{kw.keyword}</span>
                        {getTrendIcon(kw.trend_direction ?? 'stable')}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {kw.search_volume?.toLocaleString() ?? 'N/A'} searches
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Competition: {((kw.competition_score ?? 0) * 100).toFixed(0)}%
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteKeyword.mutate(kw.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No saved keywords yet. Search and save keywords to track them here.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
