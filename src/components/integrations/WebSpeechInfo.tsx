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
  Volume2, 
  CheckCircle2,
  Globe,
  Play,
  Settings,
  Mic
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface WebSpeechInfoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FEATURES = [
  { icon: Globe, label: "Browser Native", description: "No external service required" },
  { icon: Volume2, label: "Multiple Voices", description: "Access to system voices" },
  { icon: Settings, label: "Customizable", description: "Adjust rate, pitch, and volume" },
  { icon: Mic, label: "Voice Preview", description: "Test character voices instantly" },
];

export function WebSpeechInfo({ open, onOpenChange }: WebSpeechInfoProps) {
  const [isTesting, setIsTesting] = useState(false);

  const handleTestVoice = () => {
    if (!('speechSynthesis' in window)) {
      toast.error("Web Speech API is not supported in your browser");
      return;
    }

    setIsTesting(true);
    const utterance = new SpeechSynthesisUtterance(
      "Hello! I'm using the Web Speech API. This is completely free and works in your browser."
    );
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onend = () => setIsTesting(false);
    utterance.onerror = () => {
      setIsTesting(false);
      toast.error("Voice playback failed");
    };

    speechSynthesis.speak(utterance);
  };

  const handleStopVoice = () => {
    speechSynthesis.cancel();
    setIsTesting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            Web Speech API
            <Badge className="ml-2 bg-emerald-500 hover:bg-emerald-600">FREE</Badge>
          </DialogTitle>
          <DialogDescription>
            Browser-native voice synthesis - No setup required
          </DialogDescription>
        </DialogHeader>

        {/* Status */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          <div>
            <p className="font-medium text-emerald-700 dark:text-emerald-400">
              Built Into Your Browser
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-500">
              Web Speech API is available in all modern browsers
            </p>
          </div>
        </div>

        {/* Features */}
        <div>
          <h4 className="text-sm font-medium mb-3">Features</h4>
          <div className="grid grid-cols-2 gap-2">
            {FEATURES.map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <feature.icon className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium">{feature.label}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Voice */}
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <h4 className="font-medium mb-2">Try It Now</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Click the button below to hear a sample voice using the Web Speech API.
          </p>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={isTesting ? handleStopVoice : handleTestVoice}
          >
            {isTesting ? (
              <>
                <Volume2 className="mr-2 h-4 w-4 animate-pulse" />
                Stop Playing
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Test Voice
              </>
            )}
          </Button>
        </div>

        {/* Comparison Note */}
        <div className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/30">
          <p className="font-medium mb-1">Comparison with ElevenLabs:</p>
          <p>
            Web Speech API uses system voices which are functional for testing. 
            For production-quality character voices, consider ElevenLabs for more natural, 
            expressive AI-generated voices.
          </p>
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
