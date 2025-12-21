import { useAuth } from "@/contexts/AuthContext";
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
  ArrowRight
} from "lucide-react";
import { dashboardStats, mockDrafts, mockStories } from "@/data/mockData";
import { Link } from "react-router-dom";
import { CompetitorActivityWidget } from "@/components/dashboard/CompetitorActivityWidget";

const Dashboard = () => {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const recentDrafts = mockDrafts.slice(0, 3);
  const recentStories = mockStories.slice(0, 3);

  return (
    <AppLayout>
      <PageHeader
        title={`Welcome back${isAdmin ? ", Admin" : ""}!`}
        description="Here's what's happening in your creative studio today."
      />

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isAdmin ? (
          <>
            <StatCard
              title="Pending Approvals"
              value={dashboardStats.admin.pendingApprovals}
              icon={<Clock className="h-5 w-5 text-primary" />}
              trend={{ value: 12, isPositive: false }}
            />
            <StatCard
              title="System Health"
              value={`${dashboardStats.admin.systemHealth}%`}
              icon={<Activity className="h-5 w-5 text-secondary" />}
            />
            <StatCard
              title="Active Users"
              value={dashboardStats.admin.activeUsers}
              icon={<Users className="h-5 w-5 text-accent-foreground" />}
              trend={{ value: 8, isPositive: true }}
            />
            <StatCard
              title="Content Generated"
              value={dashboardStats.admin.contentGenerated}
              icon={<Sparkles className="h-5 w-5 text-status-published" />}
              trend={{ value: 24, isPositive: true }}
            />
          </>
        ) : (
          <>
            <StatCard
              title="Active Drafts"
              value={dashboardStats.user.activeDrafts}
              icon={<FileText className="h-5 w-5 text-primary" />}
            />
            <StatCard
              title="Avg. Replication Score"
              value={`${dashboardStats.user.avgReplicationScore}%`}
              icon={<BarChart3 className="h-5 w-5 text-secondary" />}
              trend={{ value: 5, isPositive: true }}
            />
            <StatCard
              title="Recent Creations"
              value={dashboardStats.user.recentCreations}
              icon={<Sparkles className="h-5 w-5 text-accent-foreground" />}
            />
            <StatCard
              title="Published This Month"
              value={dashboardStats.user.publishedThisMonth}
              icon={<CheckCircle className="h-5 w-5 text-status-published" />}
              trend={{ value: 15, isPositive: true }}
            />
          </>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
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
            {recentDrafts.map((draft) => (
              <div key={draft.id} className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
                <img src={draft.thumbnail} alt={draft.title} className="h-12 w-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-foreground">{draft.title}</p>
                  <p className="text-sm text-muted-foreground capitalize">{draft.type}</p>
                </div>
                <StatusBadge status={draft.status} />
              </div>
            ))}
          </CardContent>
        </Card>

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
            {recentStories.map((story) => (
              <div key={story.id} className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
                <img src={story.thumbnail} alt={story.title} className="h-12 w-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-foreground">{story.title}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Score: {story.replicationScore}%</span>
                  </div>
                </div>
                <StatusBadge status={story.status} />
              </div>
            ))}
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
