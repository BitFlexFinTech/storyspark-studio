import { useState } from "react";
import { IntegrationSetupWizard, CopyableText, InstructionLink } from "./IntegrationSetupWizard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Instagram } from "lucide-react";

interface InstagramSetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function InstagramSetupWizard({ open, onOpenChange, onComplete }: InstagramSetupWizardProps) {
  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");

  const steps = [
    {
      title: "Create Meta Developer Account",
      description: "Set up your Meta for Developers account",
      content: (
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Instagram API access requires a Meta (Facebook) Developer account and an Instagram Business or Creator account.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <h4 className="font-medium">Steps:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>
                Go to{" "}
                <InstructionLink href="https://developers.facebook.com">
                  Meta for Developers
                </InstructionLink>
              </li>
              <li>Log in with your Facebook account</li>
              <li>Register as a developer if not already</li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      title: "Create a Meta App",
      description: "Set up a new app with Instagram API access",
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">Steps:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Click "Create App" in the developer dashboard</li>
              <li>Select "Business" as the app type</li>
              <li>Add "Instagram Graph API" product to your app</li>
              <li>Configure OAuth settings with this redirect URI:</li>
            </ol>
          </div>
          
          <CopyableText 
            text={`${window.location.origin}/api/oauth/instagram/callback`}
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
            <Label htmlFor="app-id">App ID</Label>
            <Input
              id="app-id"
              placeholder="Your Meta App ID"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="app-secret">App Secret</Label>
            <Input
              id="app-secret"
              type="password"
              placeholder="Your Meta App Secret"
              value={appSecret}
              onChange={(e) => setAppSecret(e.target.value)}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Connect Your Account",
      description: "Authorize access to your Instagram account",
      content: (
        <div className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
            <Instagram className="h-8 w-8 text-white" />
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Ready to Connect!</h4>
            <p className="text-sm text-muted-foreground">
              Click "Complete Setup" to authorize Story Studio to access your Instagram account.
            </p>
          </div>
          
          <ul className="text-sm text-left space-y-1 bg-muted/50 rounded-lg p-4">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Share images and stories
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> View insights and analytics
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Manage comments
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
      platform="instagram"
      platformName="Instagram"
      steps={steps}
      onComplete={onComplete}
    />
  );
}
