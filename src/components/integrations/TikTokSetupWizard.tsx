import { useState } from "react";
import { IntegrationSetupWizard, CopyableText, InstructionLink } from "./IntegrationSetupWizard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface TikTokSetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function TikTokSetupWizard({ open, onOpenChange, onComplete }: TikTokSetupWizardProps) {
  const [clientKey, setClientKey] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  const steps = [
    {
      title: "Create TikTok Developer Account",
      description: "Set up your TikTok for Developers account",
      content: (
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You'll need a TikTok for Developers account. Registration is free but may require approval.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <h4 className="font-medium">Steps:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>
                Go to{" "}
                <InstructionLink href="https://developers.tiktok.com">
                  TikTok for Developers
                </InstructionLink>
              </li>
              <li>Sign in with your TikTok account or create one</li>
              <li>Complete the developer registration</li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      title: "Create an App",
      description: "Register a new app in the developer portal",
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">Steps:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Navigate to "My Apps" in the developer portal</li>
              <li>Click "Create App"</li>
              <li>Fill in the required information</li>
              <li>Add the following redirect URI:</li>
            </ol>
          </div>
          
          <CopyableText 
            text={`${window.location.origin}/api/oauth/tiktok/callback`}
            label="Redirect URI"
          />
        </div>
      ),
    },
    {
      title: "Enter Credentials",
      description: "Paste your app credentials",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client-key">Client Key</Label>
            <Input
              id="client-key"
              placeholder="Your TikTok Client Key"
              value={clientKey}
              onChange={(e) => setClientKey(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="client-secret">Client Secret</Label>
            <Input
              id="client-secret"
              type="password"
              placeholder="Your TikTok Client Secret"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Connect Your Account",
      description: "Authorize access to your TikTok account",
      content: (
        <div className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-black flex items-center justify-center">
            <span className="text-2xl">🎵</span>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Ready to Connect!</h4>
            <p className="text-sm text-muted-foreground">
              Click "Complete Setup" to authorize Story Studio to access your TikTok account.
            </p>
          </div>
          
          <ul className="text-sm text-left space-y-1 bg-muted/50 rounded-lg p-4">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Post short-form content
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> View analytics
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Manage videos
            </li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <IntegrationSetupWizard
      open={open}
      onOpenChange={onOpenChange}
      platform="tiktok"
      platformName="TikTok"
      steps={steps}
      onComplete={onComplete}
    />
  );
}
