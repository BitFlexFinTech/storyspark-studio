import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ExternalLink, Copy, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateIntegration, useUpdateIntegration, useCreateIntegrationSetup, useUpdateIntegrationSetup } from "@/hooks/useIntegrations";

interface SetupStep {
  title: string;
  description: string;
  content: React.ReactNode;
}

interface IntegrationSetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: string;
  platformName: string;
  steps: SetupStep[];
  onComplete: () => void;
}

export function IntegrationSetupWizard({
  open,
  onOpenChange,
  platform,
  platformName,
  steps,
  onComplete,
}: IntegrationSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createIntegration = useCreateIntegration();
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await createIntegration.mutateAsync({
        platform,
        status: 'connected',
        metadata: stepData,
      });
      toast.success(`${platformName} connected successfully!`);
      onComplete();
      onOpenChange(false);
      setCurrentStep(0);
      setStepData({});
    } catch (error) {
      toast.error('Failed to complete setup');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Connect {platformName}
          </DialogTitle>
          <DialogDescription>
            Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Progress value={progress} className="h-2" />
          
          <div className="min-h-[200px]">
            {steps[currentStep]?.content}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            {isLastStep ? (
              <Button onClick={handleComplete} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Setup
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for copying text
export function CopyableText({ text, label }: { text: string; label: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
      <code className="flex-1 text-sm break-all">{text}</code>
      <Button variant="ghost" size="icon" onClick={handleCopy}>
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Helper component for external links with instructions
export function InstructionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-primary hover:underline"
    >
      {children}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}
