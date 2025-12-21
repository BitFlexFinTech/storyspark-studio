import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Play, Clock, Globe, Film } from "lucide-react";
import { mockVideos } from "@/data/mockData";

const Videos = () => {
  const [activeTab, setActiveTab] = useState("all");

  const filteredVideos = mockVideos.filter((video) => {
    if (activeTab === "all") return true;
    return video.status === activeTab;
  });

  return (
    <AppLayout>
      <PageHeader
        title="Videos"
        description="Manage your AI-generated videos and their language versions."
      >
        <Button variant="hero">
          <Video className="h-4 w-4" />
          Generate Video
        </Button>
      </PageHeader>

      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Videos</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="review">In Review</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredVideos.map((video) => (
          <Card
            key={video.id}
            className="group cursor-pointer overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
          >
            <div className="relative aspect-video overflow-hidden">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="rounded-full bg-primary p-4 shadow-lg">
                  <Play className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 rounded bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur-sm">
                {video.duration}
              </div>
            </div>
            <CardContent className="p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-display font-bold text-foreground line-clamp-2">
                  {video.title}
                </h3>
                <StatusBadge status={video.status} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  {video.language}
                </div>
                <div className="flex items-center gap-1">
                  <Film className="h-4 w-4" />
                  {video.scenes} scenes
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Video className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">No videos found</h3>
          <p className="max-w-sm text-muted-foreground">
            Generate videos from your stories to see them here.
          </p>
        </div>
      )}
    </AppLayout>
  );
};

export default Videos;
