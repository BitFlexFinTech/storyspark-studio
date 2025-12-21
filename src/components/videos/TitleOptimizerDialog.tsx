import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTitleOptimizer, TitleSuggestion } from "@/hooks/useTitleOptimizer";
import { Wand2, Copy, Check, TrendingUp, AlertCircle, Lightbulb, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface TitleOptimizerDialogProps {
  initialTitle?: string;
  videoId?: string;
  trigger?: React.ReactNode;
  onSelectTitle?: (title: string) => void;
}

export function TitleOptimizerDialog({ 
  initialTitle = "", 
  videoId,
  trigger,
  onSelectTitle 
}: TitleOptimizerDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [niche, setNiche] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const optimizer = useTitleOptimizer();

  const handleOptimize = () => {
    if (!title.trim()) {
      toast.error("Please enter a title to optimize");
      return;
    }
    optimizer.mutate({ currentTitle: title, videoId, niche: niche || undefined });
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Title copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const selectTitle = (selectedTitle: string) => {
    if (onSelectTitle) {
      onSelectTitle(selectedTitle);
      setOpen(false);
      toast.success("Title applied!");
    } else {
      copyToClipboard(selectedTitle, -1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Wand2 className="h-4 w-4 mr-2" />
            Optimize Title
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            AI Title Optimizer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Current Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your video title..."
            />
          </div>

          <div className="space-y-2">
            <Label>Niche (optional)</Label>
            <Input
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g., Tech Reviews, Gaming, Cooking..."
            />
          </div>

          <Button 
            onClick={handleOptimize} 
            disabled={optimizer.isPending || !title.trim()}
            className="w-full"
          >
            {optimizer.isPending ? (
              <>Analyzing...</>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Optimized Titles
              </>
            )}
          </Button>

          {optimizer.isPending && (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}

          {optimizer.data && (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {/* Original Analysis */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      Current Title Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Estimated CTR:</span>
                      <Badge variant={optimizer.data.originalAnalysis.estimatedCTR > 4 ? "default" : "secondary"}>
                        {optimizer.data.originalAnalysis.estimatedCTR}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-green-600 mb-1">Strengths</p>
                        <ul className="space-y-1">
                          {optimizer.data.originalAnalysis.strengths.map((s, i) => (
                            <li key={i} className="text-muted-foreground flex items-start gap-1">
                              <Check className="h-3 w-3 text-green-500 mt-1 shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-red-600 mb-1">Improvements</p>
                        <ul className="space-y-1">
                          {optimizer.data.originalAnalysis.weaknesses.map((w, i) => (
                            <li key={i} className="text-muted-foreground flex items-start gap-1">
                              <AlertCircle className="h-3 w-3 text-red-500 mt-1 shrink-0" />
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Suggestions */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Optimized Suggestions
                  </h4>
                  {optimizer.data.suggestions.map((suggestion, index) => (
                    <SuggestionCard
                      key={index}
                      suggestion={suggestion}
                      index={index}
                      isCopied={copiedIndex === index}
                      onCopy={() => copyToClipboard(suggestion.title, index)}
                      onSelect={() => selectTitle(suggestion.title)}
                      showSelectButton={!!onSelectTitle}
                    />
                  ))}
                </div>

                {/* Competitor Inspiration */}
                {optimizer.data.competitorTitles.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Top Competitor Titles</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {optimizer.data.competitorTitles.map((t, i) => (
                          <li key={i} className="text-muted-foreground">{t}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          )}

          {optimizer.error && (
            <Card className="border-destructive">
              <CardContent className="pt-4 text-center text-destructive">
                {optimizer.error.message}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SuggestionCard({ 
  suggestion, 
  index, 
  isCopied, 
  onCopy, 
  onSelect,
  showSelectButton 
}: { 
  suggestion: TitleSuggestion; 
  index: number;
  isCopied: boolean;
  onCopy: () => void;
  onSelect: () => void;
  showSelectButton: boolean;
}) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm flex-1">{suggestion.title}</p>
          <div className="flex gap-1 shrink-0">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onCopy}
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            {showSelectButton && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onSelect}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {suggestion.formula}
          </Badge>
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {suggestion.estimatedCTR}% CTR
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground">{suggestion.reasoning}</p>

        {suggestion.keywordsUsed.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {suggestion.keywordsUsed.map((kw, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {kw}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
