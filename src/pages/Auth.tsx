import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Youtube, Loader2, Sparkles } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const { isAuthenticated, signInWithYouTube, isLoading } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleYouTubeConnect = async () => {
    setIsConnecting(true);
    const { error } = await signInWithYouTube();
    
    if (error) {
      toast.error('Failed to connect with YouTube. Please try again.');
      setIsConnecting(false);
    }
    // Don't set isConnecting to false on success - we're redirecting to Google
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
            <Youtube className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Welcome to StoryForge
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Connect your YouTube channel to get started with AI-powered content optimization
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-4">
          {/* Features list */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Automatic channel analysis</span> — We'll scan your videos and provide insights
              </p>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Competitor tracking</span> — Monitor and analyze competing channels
              </p>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">AI-powered optimization</span> — Get suggestions to improve your content
              </p>
            </div>
          </div>

          {/* Connect button */}
          <Button
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={handleYouTubeConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Youtube className="mr-2 h-5 w-5" />
                Connect with YouTube
              </>
            )}
          </Button>

          {/* Privacy note */}
          <p className="text-center text-xs text-muted-foreground">
            We only request read-only access to your channel data.
            <br />
            Your videos and analytics are never shared.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
