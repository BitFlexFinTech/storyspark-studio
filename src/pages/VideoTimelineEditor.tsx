import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  GripVertical,
  Play,
  Pause,
  Clock,
  Volume2,
  ZoomIn,
  ZoomOut,
  Save,
  Undo,
} from "lucide-react";
import { mockStories, Scene } from "@/data/mockData";
import { toast } from "sonner";

const VideoTimelineEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const story = mockStories.find((s) => s.id === id);

  const [scenes, setScenes] = useState<Scene[]>(story?.scenes || []);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(scenes[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [playheadPosition, setPlayheadPosition] = useState(0);

  const parseDuration = (duration: string): number => {
    const [mins, secs] = duration.split(":").map(Number);
    return mins * 60 + secs;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const totalDuration = scenes.reduce((acc, scene) => acc + parseDuration(scene.duration), 0);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newScenes = [...scenes];
    const draggedScene = newScenes[draggedIndex];
    newScenes.splice(draggedIndex, 1);
    newScenes.splice(index, 0, draggedScene);

    // Update scene numbers
    newScenes.forEach((scene, i) => {
      scene.number = i + 1;
    });

    setScenes(newScenes);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    toast.success("Scene order updated");
  };

  const updateSceneDuration = (sceneId: string, newDuration: number) => {
    setScenes((prev) =>
      prev.map((scene) =>
        scene.id === sceneId ? { ...scene, duration: formatDuration(newDuration) } : scene
      )
    );
  };

  const handleSave = () => {
    toast.success("Timeline saved successfully!");
  };

  if (!story) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center p-12">
          <h2 className="text-xl font-semibold">Story not found</h2>
          <Button variant="ghost" onClick={() => navigate("/videos")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Videos
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/videos")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Videos
        </Button>
        <PageHeader title={`Edit: ${story.title}`} description="Drag scenes to reorder, adjust durations and audio">
          <Button variant="ghost" size="icon">
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="hero" onClick={handleSave}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </PageHeader>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timeline */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant={isPlaying ? "secondary" : "hero"}
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <div className="text-sm">
                    <span className="font-mono font-medium">{formatDuration(playheadPosition)}</span>
                    <span className="text-muted-foreground"> / {formatDuration(totalDuration)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(50, zoom - 25))}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground w-12 text-center">{zoom}%</span>
                  <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(200, zoom + 25))}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Playhead Scrubber */}
          <Card>
            <CardContent className="p-4">
              <Slider
                value={[playheadPosition]}
                max={totalDuration}
                step={1}
                onValueChange={([value]) => setPlayheadPosition(value)}
                className="w-full"
              />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>0:00</span>
                <span>{formatDuration(totalDuration)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Scene Timeline */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Scenes Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {scenes.map((scene, index) => {
                const duration = parseDuration(scene.duration);
                const widthPercent = (duration / totalDuration) * 100 * (zoom / 100);

                return (
                  <div
                    key={scene.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedScene(scene)}
                    className={`group relative flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${
                      selectedScene?.id === scene.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    } ${draggedIndex === index ? "opacity-50" : ""}`}
                  >
                    <div className="cursor-grab text-muted-foreground hover:text-foreground">
                      <GripVertical className="h-5 w-5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="soft">Scene {scene.number}</Badge>
                        <span className="font-medium">{scene.title}</span>
                      </div>

                      {/* Waveform visualization */}
                      <div className="h-12 rounded-lg bg-muted/50 overflow-hidden flex items-center px-2 gap-px">
                        {(scene.audioWaveform || Array(20).fill(0.5)).map((height, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-primary/60 rounded-full min-w-[2px]"
                            style={{ height: `${height * 100}%` }}
                          />
                        ))}
                      </div>

                      <div className="mt-2 flex items-center gap-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {scene.duration}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Volume2 className="h-3 w-3" />
                          Audio
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Scene Inspector */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-base">Scene Inspector</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedScene ? (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Scene Title</p>
                    <p className="font-medium">{selectedScene.title}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Script</p>
                    <p className="text-sm text-foreground">{selectedScene.script}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Visual Description</p>
                    <p className="text-sm text-muted-foreground">{selectedScene.visualDescription}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Duration</p>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[parseDuration(selectedScene.duration)]}
                        min={30}
                        max={300}
                        step={15}
                        onValueChange={([value]) => updateSceneDuration(selectedScene.id, value)}
                        className="flex-1"
                      />
                      <span className="text-sm font-mono w-12">{selectedScene.duration}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Audio Level</p>
                    <Slider defaultValue={[75]} max={100} step={1} className="w-full" />
                  </div>

                  <Button variant="outline" className="w-full">
                    Edit Scene Details
                  </Button>
                </>
              ) : (
                <p className="text-center text-muted-foreground">Select a scene to inspect</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default VideoTimelineEditor;
