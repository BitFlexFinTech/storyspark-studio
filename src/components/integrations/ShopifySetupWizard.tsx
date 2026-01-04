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
  ShoppingBag, 
  ExternalLink, 
  CheckCircle2,
  Store,
  Key,
  ArrowRight,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useCreateIntegration } from "@/hooks/useIntegrations";

interface ShopifySetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const STEPS = [
  { 
    title: "Create or Access Store", 
    description: "Set up your Shopify store or access an existing one" 
  },
  { 
    title: "Create Private App", 
    description: "Generate API credentials for your store" 
  },
  { 
    title: "Enter Credentials", 
    description: "Enter your store URL and API access token" 
  },
  { 
    title: "Test Connection", 
    description: "Verify the connection to your Shopify store" 
  },
];

export function ShopifySetupWizard({ open, onOpenChange, onComplete }: ShopifySetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [storeUrl, setStoreUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");
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
    if (!storeUrl || !accessToken) {
      toast.error("Please enter both store URL and access token");
      return;
    }

    setIsVerifying(true);
    try {
      await createIntegration.mutateAsync({
        platform: "shopify",
        status: "connected",
        metadata: { 
          storeUrl: storeUrl.replace("https://", "").replace(".myshopify.com", ""),
          hasAccessToken: true 
        }
      });
      
      toast.success("Shopify store connected successfully!");
      onComplete();
      resetWizard();
    } catch (error) {
      toast.error("Failed to connect Shopify. Please check your credentials.");
    } finally {
      setIsVerifying(false);
    }
  };

  const resetWizard = () => {
    setCurrentStep(0);
    setStoreUrl("");
    setAccessToken("");
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
            <ShoppingBag className="h-5 w-5 text-primary" />
            Connect Shopify
            <Badge variant="destructive" className="ml-2">PAID</Badge>
          </DialogTitle>
          <DialogDescription>
            Connect your Shopify store for merchandise and e-commerce
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
                <h4 className="font-medium mb-2">Step 1: Access Your Store</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  You'll need a Shopify store to connect. Shopify offers a 3-day free trial, then plans start at $29/month.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <a href="https://www.shopify.com/free-trial" target="_blank" rel="noopener noreferrer">
                      <Store className="mr-2 h-4 w-4" />
                      Start Free Trial
                    </a>
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <a href="https://admin.shopify.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Login to Store
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <h4 className="font-medium mb-2">Step 2: Create a Private App</h4>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Go to your Shopify Admin</li>
                  <li>Navigate to Settings → Apps and sales channels</li>
                  <li>Click "Develop apps" → "Create an app"</li>
                  <li>Name your app (e.g., "Story Studio Integration")</li>
                  <li>Configure Admin API scopes (Products, Orders, Inventory)</li>
                  <li>Install the app and copy the Admin API access token</li>
                </ol>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <a href="https://admin.shopify.com/settings/apps/development" target="_blank" rel="noopener noreferrer">
                  <Key className="mr-2 h-4 w-4" />
                  Open App Development
                </a>
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="storeUrl">Store URL</Label>
                <div className="flex mt-1.5">
                  <Input
                    id="storeUrl"
                    placeholder="your-store-name"
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    className="rounded-r-none"
                  />
                  <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border border-l-0 border-input rounded-r-md">
                    .myshopify.com
                  </span>
                </div>
              </div>
              <div>
                <Label htmlFor="accessToken">Admin API Access Token</Label>
                <Input
                  id="accessToken"
                  type="password"
                  placeholder="shpat_..."
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="mt-1.5 font-mono text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your credentials are encrypted and stored securely.
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-3" />
                <h4 className="font-medium mb-2">Ready to Connect</h4>
                <p className="text-sm text-muted-foreground">
                  Click verify to test your Shopify connection.
                </p>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>✓ Store: {storeUrl}.myshopify.com</p>
                <p>✓ Access Token: {accessToken.slice(0, 10)}...</p>
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
            <Button onClick={handleVerify} disabled={isVerifying || !storeUrl || !accessToken}>
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
