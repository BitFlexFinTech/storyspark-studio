import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Youtube, 
  Search, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle,
  Palette,
  Music,
  BookOpen,
  Loader2
} from "lucide-react";
import { mockStyleBlueprint } from "@/data/mockData";

const YouTubeAnalysis = () => {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const handleAnalyze = () => {
    if (!url) return;
    setIsAnalyzing(true);
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 2000);
  };

  return (
    <AppLayout>
      <PageHeader
        title="YouTube Analysis"
        description="Paste a YouTube video or channel URL to analyze style, structure, and generate content blueprints."
      />

      {/* URL Input */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Youtube className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Paste YouTube video or channel URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-12 pl-12 text-base"
              />
            </div>
            <Button
              variant="hero"
              size="lg"
              onClick={handleAnalyze}
              disabled={!url || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisComplete && (
        <div className="animate-fade-in space-y-6">
          {/* Scores */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-status-approved/30 bg-status-approved/5">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Replication Capability
                    </p>
                    <p className="mt-1 text-4xl font-bold text-status-approved">94%</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      High confidence in style matching
                    </p>
                  </div>
                  <div className="rounded-xl bg-status-approved/10 p-3">
                    <CheckCircle className="h-6 w-6 text-status-approved" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-status-draft/30 bg-status-draft/5">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Copyright Risk
                    </p>
                    <p className="mt-1 text-4xl font-bold text-status-draft">12%</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Low risk of copyright issues
                    </p>
                  </div>
                  <div className="rounded-xl bg-status-draft/10 p-3">
                    <AlertTriangle className="h-6 w-6 text-status-draft" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Content Quality
                    </p>
                    <p className="mt-1 text-4xl font-bold text-primary">A+</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Excellent production value
                    </p>
                  </div>
                  <div className="rounded-xl bg-primary/10 p-3">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Style Blueprint */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Style Blueprint
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-3">
              {/* Visual Style */}
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Palette className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground">Visual Style</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Color Palette</p>
                    <div className="mt-1 flex gap-1">
                      {mockStyleBlueprint.visualStyle.colorPalette.map((color, i) => (
                        <div
                          key={i}
                          className="h-6 w-6 rounded-full border border-border shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Animation</p>
                    <p className="text-sm font-medium">{mockStyleBlueprint.visualStyle.animationStyle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Characters</p>
                    <p className="text-sm font-medium">{mockStyleBlueprint.visualStyle.characterDesign}</p>
                  </div>
                </div>
              </div>

              {/* Narrative Structure */}
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="rounded-lg bg-secondary/10 p-2">
                    <BookOpen className="h-4 w-4 text-secondary" />
                  </div>
                  <h4 className="font-semibold text-foreground">Narrative</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Pacing</p>
                    <p className="text-sm font-medium">{mockStyleBlueprint.narrativeStructure.pacing}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Story Type</p>
                    <p className="text-sm font-medium">{mockStyleBlueprint.narrativeStructure.storyType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Target Age</p>
                    <Badge variant="soft">{mockStyleBlueprint.narrativeStructure.targetAge}</Badge>
                  </div>
                </div>
              </div>

              {/* Audio Profile */}
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="rounded-lg bg-accent/20 p-2">
                    <Music className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <h4 className="font-semibold text-foreground">Audio</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Music Style</p>
                    <p className="text-sm font-medium">{mockStyleBlueprint.audioProfile.musicStyle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Voice Type</p>
                    <p className="text-sm font-medium">{mockStyleBlueprint.audioProfile.voiceType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sound Effects</p>
                    <p className="text-sm font-medium">{mockStyleBlueprint.audioProfile.soundEffects}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button variant="hero">
              <Sparkles className="h-4 w-4" />
              Generate Story
            </Button>
            <Button variant="outline">Save Blueprint</Button>
            <Button variant="ghost">Export Report</Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!analysisComplete && !isAnalyzing && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Youtube className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            Ready to Analyze
          </h3>
          <p className="max-w-sm text-muted-foreground">
            Paste a YouTube URL above to analyze the content style and generate 
            a blueprint for creating similar content.
          </p>
        </div>
      )}
    </AppLayout>
  );
};

export default YouTubeAnalysis;
