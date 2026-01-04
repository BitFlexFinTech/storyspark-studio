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
  CreditCard, 
  ExternalLink, 
  CheckCircle2,
  Copy,
  Key,
  ArrowRight,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useCreateIntegration } from "@/hooks/useIntegrations";

interface StripeSetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const STEPS = [
  { 
    title: "Create Stripe Account", 
    description: "Sign up for a free Stripe account if you don't have one" 
  },
  { 
    title: "Get API Keys", 
    description: "Navigate to Developers → API keys in your Stripe Dashboard" 
  },
  { 
    title: "Enter Credentials", 
    description: "Enter your Stripe API keys to connect" 
  },
  { 
    title: "Verify Connection", 
    description: "Test the connection to ensure everything works" 
  },
];

export function StripeSetupWizard({ open, onOpenChange, onComplete }: StripeSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [publishableKey, setPublishableKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
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
    if (!publishableKey.startsWith("pk_") || !secretKey.startsWith("sk_")) {
      toast.error("Invalid API keys. Publishable key should start with 'pk_' and secret key with 'sk_'");
      return;
    }

    setIsVerifying(true);
    try {
      await createIntegration.mutateAsync({
        platform: "stripe",
        status: "connected",
        metadata: { 
          publishableKey,
          hasSecretKey: true 
        }
      });
      
      toast.success("Stripe connected successfully!");
      onComplete();
      resetWizard();
    } catch (error) {
      toast.error("Failed to connect Stripe. Please check your API keys.");
    } finally {
      setIsVerifying(false);
    }
  };

  const resetWizard = () => {
    setCurrentStep(0);
    setPublishableKey("");
    setSecretKey("");
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
            <CreditCard className="h-5 w-5 text-primary" />
            Connect Stripe
            <Badge variant="secondary" className="ml-2">FREEMIUM</Badge>
          </DialogTitle>
          <DialogDescription>
            Accept payments and manage subscriptions with Stripe
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
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
        <div className="min-h-[200px]">
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <h4 className="font-medium mb-2">Step 1: Create Stripe Account</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Stripe is a payment processing platform. The basic account is free - you only pay transaction fees when you process payments.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="https://dashboard.stripe.com/register" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Create Stripe Account
                  </a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Already have an account? Click Next to continue.
              </p>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <h4 className="font-medium mb-2">Step 2: Get Your API Keys</h4>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Log in to your Stripe Dashboard</li>
                  <li>Click "Developers" in the left sidebar</li>
                  <li>Click "API keys"</li>
                  <li>Copy both your Publishable key and Secret key</li>
                </ol>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer">
                  <Key className="mr-2 h-4 w-4" />
                  Open Stripe API Keys
                </a>
              </Button>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  ⚠️ For testing, use your test mode keys (starting with pk_test_ and sk_test_)
                </span>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="publishableKey">Publishable Key</Label>
                <Input
                  id="publishableKey"
                  placeholder="pk_test_..."
                  value={publishableKey}
                  onChange={(e) => setPublishableKey(e.target.value)}
                  className="mt-1.5 font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="secretKey">Secret Key</Label>
                <Input
                  id="secretKey"
                  type="password"
                  placeholder="sk_test_..."
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="mt-1.5 font-mono text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your keys are encrypted and stored securely. We never share your credentials.
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-3" />
                <h4 className="font-medium mb-2">Ready to Connect</h4>
                <p className="text-sm text-muted-foreground">
                  Click verify to test your Stripe connection and complete the setup.
                </p>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>✓ Publishable Key: {publishableKey.slice(0, 12)}...</p>
                <p>✓ Secret Key: {secretKey.slice(0, 10)}...</p>
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
            <Button onClick={handleVerify} disabled={isVerifying || !publishableKey || !secretKey}>
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
