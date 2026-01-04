import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  BarChart3, 
  Sparkles, 
  TrendingUp,
  Clock,
  CheckCircle,
  Users,
  Activity,
  ArrowRight,
  Youtube,
  Loader2,
  Video,
  Eye,
  BookOpen
} from "lucide-react";
import { Link } from "react-router-dom";
import { CompetitorActivityWidget } from "@/components/dashboard/CompetitorActivityWidget";
import { toast } from "sonner";
import { useVideos } from "@/hooks/useVideos";
import { useStories } from "@/hooks/useStories";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { role, user } = useAuth();
  const { 
    isOnboarding, 
    isComplete, 
    channel, 
    videosImported, 
    error, 
    needsReauth,
    startOnboarding 
  } = useOnboarding();
  const { data: videos = [], isLoading: videosLoading } = useVideos();
  const { data: stories = [], isLoading: storiesLoading } = useStories();
  
  const isAdmin = role === "admin";

  // Compute dashboard stats from real data
  const dashboardStats = {
    activeDrafts: videos.filter(v => v.status === 'draft').length,
    publishedThisMonth: videos.filter(v => {
      if (!v.published_at) return false;
      const publishDate = new Date(v.published_at);
      const now = new Date();
      return publishDate.getMonth() === now.getMonth() && publishDate.getFullYear() === now.getFullYear();
    }).length,
    recentCreations: stories.length,
    avgReplicationScore: 85, // Placeholder until we have real scoring
  };

  // Recent data
  const recentDrafts = videos.filter(v => v.status === 'draft').slice(0, 3);
  const recentStories = stories.slice(0, 3);

  // Auto-start onboarding when user lands on dashboard without a channel
  useEffect(() => {
    if (!isComplete && !isOnboarding && !error && user) {
      startOnboarding();
    }
  }, [isComplete, isOnboarding, error, user]);

  // Show success toast when onboarding completes
  useEffect(() => {
    if (isComplete && channel && videosImported > 0) {
      toast.success(`Connected ${channel.name}! Imported ${videosImported} videos.`);
    }
  }, [isComplete, channel, videosImported]);

  // Show error toast
  useEffect(() => {
    if (error && !needsReauth) {
      toast.error(error);
    }
  }, [error, needsReauth]);

  // Show onboarding loading state
  if (isOnboarding) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
            <Youtube className="h-10 w-10 text-white" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Setting up your channel...</h2>
            <p className="text-muted-foreground">We're importing your videos and analytics</p>
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  // Show reauth prompt if needed
  if (needsReauth) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
            <Youtube className="h-10 w-10 text-white" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">YouTube Access Expired</h2>
            <p className="text-muted-foreground">Please sign out and sign in again to reconnect your channel</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/auth">Sign Out & Reconnect</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Get recent videos from database
  const recentVideos = videos.slice(0, 5);

  return (
    <AppLayout>
      <PageHeader
        title={channel ? `Welcome, ${channel.name}!` : `Welcome back${isAdmin ? ", Admin" : ""}!`}
        description={channel 
          ? `Your channel has ${channel.subscriberCount.toLocaleString()} subscribers and ${channel.videoCount} videos`
          : "Here's what's happening in your creative studio today."
        }
      />

      {/* Channel Stats (if connected) */}
      {channel && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Subscribers"
            value={channel.subscriberCount.toLocaleString()}
            icon={<Users className="h-5 w-5 text-primary" />}
          />
          <StatCard
            title="Total Videos"
            value={channel.videoCount.toString()}
            icon={<Video className="h-5 w-5 text-secondary" />}
          />
          <StatCard
            title="Videos Imported"
            value={recentVideos.length.toString()}
            icon={<CheckCircle className="h-5 w-5 text-status-published" />}
          />
          <StatCard
            title="Analytics Ready"
            value="Active"
            icon={<BarChart3 className="h-5 w-5 text-accent-foreground" />}
          />
        </div>
      )}

      {/* Default Stats (if no channel or admin) */}
      {(!channel || isAdmin) && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isAdmin ? (
            <>
              <StatCard
                title="Pending Approvals"
                value={videos.filter(v => v.status === 'review').length.toString()}
                icon={<Clock className="h-5 w-5 text-primary" />}
              />
              <StatCard
                title="System Health"
                value="98%"
                icon={<Activity className="h-5 w-5 text-secondary" />}
              />
              <StatCard
                title="Active Users"
                value="12"
                icon={<Users className="h-5 w-5 text-accent-foreground" />}
                trend={{ value: 8, isPositive: true }}
              />
              <StatCard
                title="Content Generated"
                value={stories.length.toString()}
                icon={<Sparkles className="h-5 w-5 text-status-published" />}
              />
            </>
          ) : !channel && (
            <>
              <StatCard
                title="Active Drafts"
                value={dashboardStats.activeDrafts.toString()}
                icon={<FileText className="h-5 w-5 text-primary" />}
              />
              <StatCard
                title="Avg. Replication Score"
                value={`${dashboardStats.avgReplicationScore}%`}
                icon={<BarChart3 className="h-5 w-5 text-secondary" />}
                trend={{ value: 5, isPositive: true }}
              />
              <StatCard
                title="Recent Creations"
                value={dashboardStats.recentCreations.toString()}
                icon={<Sparkles className="h-5 w-5 text-accent-foreground" />}
              />
              <StatCard
                title="Published This Month"
                value={dashboardStats.publishedThisMonth.toString()}
                icon={<CheckCircle className="h-5 w-5 text-status-published" />}
                trend={{ value: 15, isPositive: true }}
              />
            </>
          )}
        </div>
      )}

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Videos from YouTube */}
        {recentVideos.length > 0 ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-500" />
                Your Videos
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/videos">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {videosLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
                    <Skeleton className="h-12 w-20 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              ) : (
                recentVideos.map((video) => (
                  <div key={video.id} className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
                    <img 
                      src={video.thumbnail_url || '/placeholder.svg'} 
                      alt={video.title} 
                      className="h-12 w-20 rounded-lg object-cover" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-foreground">{video.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {video.published_at ? new Date(video.published_at).toLocaleDateString() : 'Draft'}
                      </p>
                    </div>
                    <StatusBadge status={(video.status as 'draft' | 'review' | 'approved' | 'published') || 'draft'} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {isAdmin ? "Pending Reviews" : "Your Drafts"}
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/drafts">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentDrafts.length > 0 ? (
                recentDrafts.map((draft) => (
                  <div key={draft.id} className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
                    <img src={draft.thumbnail_url || '/placeholder.svg'} alt={draft.title} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-foreground">{draft.title}</p>
                      <p className="text-sm text-muted-foreground capitalize">{draft.status}</p>
                    </div>
                    <StatusBadge status={(draft.status as 'draft' | 'review' | 'approved' | 'published') || 'draft'} />
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No drafts yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              Top Stories
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/stories">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {storiesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : recentStories.length > 0 ? (
              recentStories.map((story) => (
                <div key={story.id} className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-foreground">{story.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{story.scenes?.length || 0} scenes</span>
                    </div>
                  </div>
                  <StatusBadge status={(story.status as 'draft' | 'review' | 'approved' | 'published') || 'draft'} />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <BookOpen className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No stories yet</p>
                <Button variant="link" size="sm" asChild className="mt-2">
                  <Link to="/youtube-analysis">Analyze a video to create one</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Competitor Activity Widget */}
        <CompetitorActivityWidget />
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="mb-4 font-display text-lg font-bold text-foreground">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="hero" asChild><Link to="/youtube-analysis"><Sparkles className="h-4 w-4" />Analyze YouTube</Link></Button>
          <Button variant="heroSecondary" asChild><Link to="/stories">View Stories</Link></Button>
          <Button variant="outline" asChild><Link to="/drafts">Manage Drafts</Link></Button>
          {isAdmin && <Button variant="accent" asChild><Link to="/admin-review">Review Content</Link></Button>}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
