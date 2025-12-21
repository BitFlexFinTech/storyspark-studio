import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShieldCheck, 
  Video, 
  BookOpen, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  Send,
  Clock
} from "lucide-react";
import { mockDrafts, mockStories, mockVideos } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const AdminReview = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("videos");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (role !== "admin") {
      navigate("/dashboard");
    }
  }, [role, navigate]);

  const pendingVideos = mockVideos.filter((v) => v.status === "review");
  const pendingStories = mockStories.filter((s) => s.status === "review");
  const pendingDrafts = mockDrafts.filter((d) => d.status === "review");

  const [selectedItem, setSelectedItem] = useState<any>(pendingVideos[0] || pendingStories[0]);

  return (
    <AppLayout>
      <PageHeader
        title="Admin Review"
        description="Review and approve content before publishing."
      >
        <Badge variant="soft" className="gap-1">
          <Clock className="h-3 w-3" />
          {pendingVideos.length + pendingStories.length + pendingDrafts.length} items pending
        </Badge>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Queue */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Review Queue</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full rounded-none border-b">
                  <TabsTrigger value="videos" className="flex-1 gap-1">
                    <Video className="h-4 w-4" />
                    Videos ({pendingVideos.length})
                  </TabsTrigger>
                  <TabsTrigger value="stories" className="flex-1 gap-1">
                    <BookOpen className="h-4 w-4" />
                    Stories ({pendingStories.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="videos" className="m-0">
                  {pendingVideos.length > 0 ? (
                    <div className="divide-y">
                      {pendingVideos.map((video) => (
                        <div
                          key={video.id}
                          onClick={() => setSelectedItem(video)}
                          className={`flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-muted/50 ${
                            selectedItem?.id === video.id ? "bg-primary/5" : ""
                          }`}
                        >
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium">{video.title}</p>
                            <p className="text-xs text-muted-foreground">{video.duration}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="p-4 text-center text-sm text-muted-foreground">
                      No videos pending review
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="stories" className="m-0">
                  {pendingStories.length > 0 ? (
                    <div className="divide-y">
                      {pendingStories.map((story) => (
                        <div
                          key={story.id}
                          onClick={() => setSelectedItem(story)}
                          className={`flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-muted/50 ${
                            selectedItem?.id === story.id ? "bg-primary/5" : ""
                          }`}
                        >
                          <img
                            src={story.thumbnail}
                            alt={story.title}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium">{story.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {story.scenes.length} scenes
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="p-4 text-center text-sm text-muted-foreground">
                      No stories pending review
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Review Panel */}
        <div className="lg:col-span-2 space-y-6">
          {selectedItem ? (
            <>
              {/* Preview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedItem.title}</CardTitle>
                    <StatusBadge status={selectedItem.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video overflow-hidden rounded-xl bg-muted mb-4">
                    <img
                      src={selectedItem.thumbnail}
                      alt={selectedItem.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {selectedItem.description && (
                    <p className="text-muted-foreground">{selectedItem.description}</p>
                  )}
                  {selectedItem.scenes && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Scenes ({selectedItem.scenes.length})</h4>
                      <div className="space-y-2">
                        {selectedItem.scenes.slice(0, 3).map((scene: any) => (
                          <div key={scene.id} className="rounded-lg bg-muted/50 p-3">
                            <p className="text-sm font-medium">
                              Scene {scene.number}: {scene.title}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {scene.script}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Review Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Add feedback or notes for the creator..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-3">
                    <Button variant="hero" className="flex-1">
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <XCircle className="h-4 w-4" />
                      Request Changes
                    </Button>
                    {feedback && (
                      <Button variant="secondary">
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ShieldCheck className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No items to review</h3>
                <p className="text-muted-foreground">
                  All content has been reviewed.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminReview;
