import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Youtube, Sparkles, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
  const navigate = useNavigate();
  const { isAuthenticated, signInWithYouTube, signIn, signUp, isLoading } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Email/password state
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (authMode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Logged in successfully!');
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) throw error;
        toast.success('Account created! You are now signed in.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
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

          {/* YouTube Connect button */}
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

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'signup')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleEmailAuth} className="space-y-4 mt-4">
              {authMode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
                variant="secondary"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {authMode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    {authMode === 'login' ? 'Sign In' : 'Create Account'}
                  </>
                )}
              </Button>
            </form>
          </Tabs>

          {/* Privacy note */}
          <p className="text-center text-xs text-muted-foreground">
            We only request read-only access to your channel data.
            <br />
            Your information is secure and never shared.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
