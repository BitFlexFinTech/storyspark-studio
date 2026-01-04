import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Search, Plus, BarChart3 } from "lucide-react";
import { useStories } from "@/hooks/useStories";

const Stories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { data: stories = [], isLoading } = useStories();

  const filteredStories = stories.filter((story) => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || story.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <AppLayout>
      <PageHeader
        title="Stories"
        description="Manage your AI-generated stories and scripts."
      >
        <Button variant="hero" asChild>
          <Link to="/youtube-analysis">
            <Plus className="h-4 w-4" />
            New Story
          </Link>
        </Button>
      </PageHeader>

      {/* Search & Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stories Grid */}
      {!isLoading && filteredStories.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStories.map((story) => (
            <Link key={story.id} to={`/stories/${story.id}`}>
              <Card className="group h-full overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {story.thumbnail_url ? (
                    <img
                      src={story.thumbnail_url}
                      alt={story.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <StatusBadge status={(story.status as 'draft' | 'review' | 'approved' | 'published') || 'draft'} />
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="mb-2 font-display font-bold text-foreground group-hover:text-primary transition-colors">
                    {story.title}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {story.description || "No description"}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      {story.scenes?.length || 0} scenes
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4 text-secondary" />
                      <span className="font-medium text-secondary">{story.style || 'Default'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredStories.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            No stories found
          </h3>
          <p className="max-w-sm text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search or filters."
              : "Start by analyzing a YouTube video to generate your first story."}
          </p>
          {!searchQuery && (
            <Button variant="hero" className="mt-4" asChild>
              <Link to="/youtube-analysis">
                <Plus className="h-4 w-4" />
                Analyze Video
              </Link>
            </Button>
          )}
        </div>
      )}
    </AppLayout>
  );
};

export default Stories;
