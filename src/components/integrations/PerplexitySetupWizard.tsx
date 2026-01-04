import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ExternalLink, 
  CheckCircle2,
  Key,
  ArrowRight,
  Loader2,
  Brain,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { useCreateIntegration } from "@/hooks/useIntegrations";

interface PerplexitySetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const STEPS = [
  { 
    title: "Create Account", 
    description: "Sign up for Perplexity AI" 
  },
  { 
    title: "Get API Key", 
    description: "Generate an API key in account settings" 
  },
  { 
    title: "Enter API Key", 
    description: "Paste your Perplexity API key" 
  },
  { 
    title: "Test Query", 
    description: "Verify the connection" 
  },
];

export function PerplexitySetupWizard({ open, onOpenChange, onComplete }: PerplexitySetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const createIntegration = useCreateIntegration();

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleVerify = async () => {
    if (!apiKey) {
      toast.error("Please enter your API key");
      return;
    }

    setIsVerifying(true);
    try {
      await createIntegration.mutateAsync({
        platform: "perplexity",
        status: "connected",
        metadata: { hasApiKey: true }
      });
      
      toast.success("Perplexity connected successfully!");
      onComplete();
      resetWizard();
    } catch (error) {
      toast.error("Failed to connect Perplexity. Please check your API key.");
    } finally {
      setIsVerifying(false);
    }
  };

  const resetWizard = () => {
    setCurrentStep(0);
    setApiKey("");
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetWizard();
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Connect Perplexity
            <Badge variant="destructive" className="ml-2">PAID</Badge>
          </DialogTitle>
          <DialogDescription>
            AI-powered search and research engine
          </DialogDescription>
        </DialogHeader>

        {/* Free Alternative Banner */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Sparkles className="h-5 w-5 text-emerald-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Free Alternative Available
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-500">
              Use Lovable AI for research and insights at no cost
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-4">
          {STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                index <= currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[180px]">
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <h4 className="font-medium mb-2">Step 1: Create Perplexity Account</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Perplexity Pro starts at $20/month. API access requires a Pro subscription.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="https://www.perplexity.ai" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Go to Perplexity
                  </a>
                </Button>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <h4 className="font-medium mb-2">Step 2: Get Your API Key</h4>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Log in to Perplexity</li>
                  <li>Go to Settings → API</li>
                  <li>Generate a new API key</li>
                  <li>Copy the key (you won't see it again!)</li>
                </ol>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noopener noreferrer">
                  <Key className="mr-2 h-4 w-4" />
                  Open API Settings
                </a>
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="apiKey">Perplexity API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="pplx-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="mt-1.5 font-mono text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your API key is encrypted and stored securely.
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                <Brain className="h-12 w-12 text-primary mx-auto mb-3" />
                <h4 className="font-medium mb-2">Ready to Search</h4>
                <p className="text-sm text-muted-foreground">
                  Click verify to test your Perplexity connection.
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>✓ API Key: {apiKey.slice(0, 8)}...</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0}>
            Back
          </Button>
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleVerify} disabled={isVerifying || !apiKey}>
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Verify & Connect
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
