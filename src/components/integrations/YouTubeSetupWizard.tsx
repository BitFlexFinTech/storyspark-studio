import { useState } from "react";
import { IntegrationSetupWizard, CopyableText, InstructionLink } from "./IntegrationSetupWizard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Youtube, Info } from "lucide-react";

interface YouTubeSetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function YouTubeSetupWizard({ open, onOpenChange, onComplete }: YouTubeSetupWizardProps) {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  const steps = [
    {
      title: "Create Google Cloud Project",
      description: "Set up your Google Cloud project for YouTube API access",
      content: (
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You'll need a Google Cloud account to access the YouTube API. This is free for basic usage.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <h4 className="font-medium">Steps:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>
                Go to{" "}
                <InstructionLink href="https://console.cloud.google.com">
                  Google Cloud Console
                </InstructionLink>
              </li>
              <li>Create a new project or select an existing one</li>
              <li>Note your Project ID for the next steps</li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      title: "Enable YouTube Data API",
      description: "Enable the API in your Google Cloud project",
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">Steps:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>
                Go to{" "}
                <InstructionLink href="https://console.cloud.google.com/apis/library/youtube.googleapis.com">
                  YouTube Data API v3
                </InstructionLink>
              </li>
              <li>Click "Enable" to activate the API</li>
              <li>Wait for the API to be enabled (usually instant)</li>
            </ol>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              The YouTube Data API v3 provides access to channel management, video uploads, and analytics.
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
    {
      title: "Create OAuth Credentials",
      description: "Set up OAuth 2.0 credentials for authentication",
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">Steps:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>
                Go to{" "}
                <InstructionLink href="https://console.cloud.google.com/apis/credentials">
                  Credentials page
                </InstructionLink>
              </li>
              <li>Click "Create Credentials" → "OAuth client ID"</li>
              <li>Select "Web application" as the application type</li>
              <li>Add authorized redirect URI:</li>
            </ol>
          </div>
          
          <CopyableText 
            text={`${window.location.origin}/api/oauth/youtube/callback`}
            label="Redirect URI"
          />
          
          <p className="text-sm text-muted-foreground">
            Copy your Client ID and Client Secret for the next step.
          </p>
        </div>
      ),
    },
    {
      title: "Enter Credentials",
      description: "Paste your OAuth credentials",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client-id">Client ID</Label>
            <Input
              id="client-id"
              placeholder="xxxxx.apps.googleusercontent.com"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="client-secret">Client Secret</Label>
            <Input
              id="client-secret"
              type="password"
              placeholder="GOCSPX-xxxxx"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
            />
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your credentials are encrypted and stored securely. They are never shared.
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
    {
      title: "Connect Your Channel",
      description: "Authorize access to your YouTube channel",
      content: (
        <div className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <Youtube className="h-8 w-8 text-red-600" />
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Ready to Connect!</h4>
            <p className="text-sm text-muted-foreground">
              Click "Complete Setup" to authorize Story Studio to access your YouTube channel.
              You'll be able to:
            </p>
          </div>
          
          <ul className="text-sm text-left space-y-1 bg-muted/50 rounded-lg p-4">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> View channel analytics
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Upload and manage videos
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Update video metadata
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Manage thumbnails
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
      platform="youtube"
      platformName="YouTube"
      steps={steps}
      onComplete={onComplete}
    />
  );
}
