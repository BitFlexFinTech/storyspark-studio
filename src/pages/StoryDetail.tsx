import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Edit3, 
  Clock, 
  Image, 
  Loader2,
  History,
  Send
} from "lucide-react";
import { mockStories } from "@/data/mockData";

const StoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [modifyText, setModifyText] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  const story = mockStories.find((s) => s.id === id);

  if (!story) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center p-12">
          <h2 className="text-xl font-semibold">Story not found</h2>
          <Button variant="ghost" onClick={() => navigate("/stories")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Stories
          </Button>
        </div>
      </AppLayout>
    );
  }

  const handleModify = () => {
    if (!modifyText.trim()) return;
    setIsRefining(true);
    setTimeout(() => {
      setIsRefining(false);
      setIsModifyOpen(false);
      setModifyText("");
    }, 2500);
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/stories")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Stories
        </Button>
        <PageHeader title={story.title} description={story.description}>
          <StatusBadge status={story.status} />
          <Button variant="hero" onClick={() => setIsModifyOpen(true)}>
            <Edit3 className="h-4 w-4" />
            Modify
          </Button>
        </PageHeader>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Scenes */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-display text-lg font-bold">Scenes</h3>
          {story.scenes.map((scene) => (
            <Card key={scene.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Scene {scene.number}: {scene.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {scene.duration}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                    Script
                  </p>
                  <p className="text-foreground">{scene.script}</p>
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
                  <Image className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Visual Description
                    </p>
                    <p className="text-sm text-foreground">{scene.visualDescription}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Version History Sidebar */}
        <div>
          <h3 className="mb-4 font-display text-lg font-bold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Version History
          </h3>
          <Card>
            <CardContent className="p-0">
              {story.versions.map((version, i) => (
                <div
                  key={version.id}
                  className={`flex items-start gap-3 p-4 ${
                    i < story.versions.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    v{version.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {version.changes}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(version.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Story Stats */}
          <Card className="mt-4">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Replication Score</span>
                <span className="font-medium text-secondary">{story.replicationScore}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Scenes</span>
                <span className="font-medium">{story.scenes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="font-medium">{new Date(story.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modify Dialog */}
      <Dialog open={isModifyOpen} onOpenChange={setIsModifyOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modify Story</DialogTitle>
            <DialogDescription>
              Describe the changes you'd like to make. Our AI will refine the story based on your feedback.
            </DialogDescription>
          </DialogHeader>
          {isRefining ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-4 text-lg font-medium">Refining instructions...</p>
              <p className="text-sm text-muted-foreground">
                Generating updated story based on your feedback
              </p>
            </div>
          ) : (
            <>
              <Textarea
                placeholder="e.g., Make Luna more adventurous in scene 2, add more dialogue between characters..."
                value={modifyText}
                onChange={(e) => setModifyText(e.target.value)}
                className="min-h-[120px]"
              />
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsModifyOpen(false)}>
                  Cancel
                </Button>
                <Button variant="hero" onClick={handleModify} disabled={!modifyText.trim()}>
                  <Send className="h-4 w-4" />
                  Apply Changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default StoryDetail;
