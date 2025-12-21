import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Palette,
  Type,
  Sparkles,
  Music,
  Copy,
  Download,
  Share2,
  Play,
} from "lucide-react";
import { mockStyleBlueprint } from "@/data/mockData";
import { useState } from "react";
import { toast } from "sonner";

const StyleBlueprintDetail = () => {
  const navigate = useNavigate();
  const blueprint = mockStyleBlueprint;
  const [playingAnimation, setPlayingAnimation] = useState<string | null>(null);

  const copyColor = (hex: string, name: string) => {
    navigator.clipboard.writeText(hex);
    toast.success(`Copied ${name} (${hex}) to clipboard`);
  };

  const playAnimation = (cssClass: string) => {
    setPlayingAnimation(cssClass);
    setTimeout(() => setPlayingAnimation(null), 1500);
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/youtube-analysis")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Analysis
        </Button>
        <PageHeader
          title={blueprint.name}
          description="Complete visual style analysis with colors, typography, and animations"
        >
          <Button variant="outline">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="hero">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </PageHeader>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Color Palette */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Color Palette
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {blueprint.visualStyle.colorPalette.map((color, i) => (
                <button
                  key={i}
                  onClick={() => copyColor(color.hex, color.name)}
                  className="group relative overflow-hidden rounded-xl transition-all hover:scale-105 hover:shadow-lg"
                >
                  <div
                    className="aspect-square w-full"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                    <Copy className="h-5 w-5" />
                  </div>
                  <div className="border-t border-border bg-card p-2">
                    <p className="text-xs font-medium truncate">{color.name}</p>
                    <p className="text-xs text-muted-foreground">{color.hex}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Badge variant="soft">{blueprint.visualStyle.animationStyle}</Badge>
              <Badge variant="softSecondary">{blueprint.visualStyle.characterDesign}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5 text-secondary" />
              Typography
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground mb-1">Heading Font</p>
                <p className="font-display text-xl font-bold">{blueprint.typography.headingFont}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground mb-1">Body Font</p>
                <p className="font-body text-xl">{blueprint.typography.bodyFont}</p>
              </div>
            </div>
            <div className="space-y-3">
              {blueprint.typography.samples.map((sample, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <span
                    style={{
                      fontSize: sample.size,
                      fontWeight: sample.weight,
                      fontFamily: sample.name.includes('H') || sample.name === 'Display' 
                        ? 'Quicksand, sans-serif' 
                        : 'Nunito, sans-serif',
                    }}
                    className="truncate"
                  >
                    {sample.name}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{sample.size}</span>
                    <span>•</span>
                    <span>{sample.weight}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Animations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent-foreground" />
              Animation Previews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {blueprint.animations.map((animation, i) => (
                <button
                  key={i}
                  onClick={() => playAnimation(animation.cssClass)}
                  className="rounded-xl border border-border p-4 text-left transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <Badge
                      variant={
                        animation.type === 'fade'
                          ? 'soft'
                          : animation.type === 'slide'
                          ? 'softSecondary'
                          : animation.type === 'scale'
                          ? 'softAccent'
                          : 'outline'
                      }
                    >
                      {animation.type}
                    </Badge>
                    <Play className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div
                    className={`h-16 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 ${
                      playingAnimation === animation.cssClass ? animation.cssClass : ''
                    }`}
                  />
                  <p className="mt-2 font-medium">{animation.name}</p>
                  <p className="text-xs text-muted-foreground">{animation.duration}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Audio Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5 text-status-published" />
              Audio Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground mb-1">Music Style</p>
              <p className="font-medium">{blueprint.audioProfile.musicStyle}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground mb-1">Voice Type</p>
              <p className="font-medium">{blueprint.audioProfile.voiceType}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground mb-1">Sound Effects</p>
              <p className="font-medium">{blueprint.audioProfile.soundEffects}</p>
            </div>
          </CardContent>
        </Card>

        {/* Mood Board */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mood Board</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {blueprint.moodBoard.map((image, i) => (
                <div
                  key={i}
                  className="group relative aspect-video overflow-hidden rounded-xl"
                >
                  <img
                    src={image}
                    alt={`Mood ${i + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Narrative & Target */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Narrative Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground mb-1">Pacing</p>
                <p className="font-medium">{blueprint.narrativeStructure.pacing}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground mb-1">Story Type</p>
                <p className="font-medium">{blueprint.narrativeStructure.storyType}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground mb-1">Target Age</p>
                <Badge variant="soft" className="mt-1">{blueprint.narrativeStructure.targetAge}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant="hero" onClick={() => navigate("/stories")}>
          <Sparkles className="h-4 w-4" />
          Generate Story with This Style
        </Button>
        <Button variant="outline">Apply to Existing Story</Button>
      </div>
    </AppLayout>
  );
};

export default StyleBlueprintDetail;
