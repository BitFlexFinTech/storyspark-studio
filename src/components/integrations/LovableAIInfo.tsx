import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  CheckCircle2,
  Cpu,
  Brain,
  MessageSquare,
  FileText,
  Zap
} from "lucide-react";

interface LovableAIInfoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AVAILABLE_MODELS = [
  { name: "Gemini 2.5 Flash", provider: "Google", description: "Fast, multimodal reasoning" },
  { name: "Gemini 2.5 Pro", provider: "Google", description: "Advanced reasoning & analysis" },
  { name: "GPT-5", provider: "OpenAI", description: "Powerful all-rounder" },
  { name: "GPT-5 Mini", provider: "OpenAI", description: "Cost-effective performance" },
];

const CAPABILITIES = [
  { icon: Brain, label: "Text Generation", description: "Stories, scripts, dialogue" },
  { icon: MessageSquare, label: "Research & Analysis", description: "Competitor insights, trends" },
  { icon: FileText, label: "Content Optimization", description: "Titles, descriptions, SEO" },
  { icon: Zap, label: "Real-time Processing", description: "Fast responses, streaming" },
];

export function LovableAIInfo({ open, onOpenChange }: LovableAIInfoProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Lovable AI
            <Badge className="ml-2 bg-emerald-500 hover:bg-emerald-600">FREE</Badge>
          </DialogTitle>
          <DialogDescription>
            Built-in AI capabilities - No API key required
          </DialogDescription>
        </DialogHeader>

        {/* Status */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          <div>
            <p className="font-medium text-emerald-700 dark:text-emerald-400">
              Already Connected
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-500">
              Lovable AI is available in all your projects
            </p>
          </div>
        </div>

        {/* Available Models */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Available Models
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {AVAILABLE_MODELS.map((model) => (
              <div
                key={model.name}
                className="rounded-lg border border-border bg-muted/30 p-3"
              >
                <p className="font-medium text-sm">{model.name}</p>
                <p className="text-xs text-muted-foreground">{model.provider}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Capabilities */}
        <div>
          <h4 className="text-sm font-medium mb-3">Capabilities</h4>
          <div className="space-y-2">
            {CAPABILITIES.map((cap) => (
              <div
                key={cap.label}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <div className="rounded-lg bg-primary/10 p-2">
                  <cap.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{cap.label}</p>
                  <p className="text-xs text-muted-foreground">{cap.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t">
          <Button className="w-full" onClick={() => onOpenChange(false)}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Got It
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
