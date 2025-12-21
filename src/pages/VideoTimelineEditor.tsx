import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
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
import { useScenes, useReorderScenes, useUpdateScene, Scene } from "@/hooks/useScenes";
import { useStory } from "@/hooks/useStories";
import { useAuth } from "@/contexts/AuthContext";
import { SortableScene } from "@/components/timeline/SortableScene";
import { toast } from "sonner";

const VideoTimelineEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDemoMode } = useAuth();
  
  const { data: story, isLoading: storyLoading } = useStory(id || '');
  const { data: dbScenes, isLoading: scenesLoading } = useScenes(id || '');
  const reorderScenes = useReorderScenes();
  const updateScene = useUpdateScene();

  const [localScenes, setLocalScenes] = useState<Scene[]>([]);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sync local scenes with DB scenes
  const scenes = localScenes.length > 0 ? localScenes : (dbScenes || []);

  // Initialize local scenes when DB data loads
  if (dbScenes && dbScenes.length > 0 && localScenes.length === 0) {
    setLocalScenes(dbScenes);
    if (!selectedScene) {
      setSelectedScene(dbScenes[0]);
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const parseDuration = (duration: string | null): number => {
    if (!duration) return 60;
    const [mins, secs] = duration.split(":").map(Number);
    return mins * 60 + secs;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const totalDuration = scenes.reduce((acc, scene) => acc + parseDuration(scene.duration), 0);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = scenes.findIndex((s) => s.id === active.id);
      const newIndex = scenes.findIndex((s) => s.id === over.id);

      const newScenes = arrayMove(scenes, oldIndex, newIndex).map((scene, index) => ({
        ...scene,
        number: index + 1,
      }));

      setLocalScenes(newScenes);

      // Persist to database if not in demo mode
      if (!isDemoMode && id) {
        reorderScenes.mutate({
          storyId: id,
          scenes: newScenes.map((s) => ({ id: s.id, number: s.number })),
        });
      }

      toast.success("Scene order updated");
    }
  };

  const updateSceneDuration = (sceneId: string, newDuration: number) => {
    const updatedScenes = scenes.map((scene) =>
      scene.id === sceneId ? { ...scene, duration: formatDuration(newDuration) } : scene
    );
    setLocalScenes(updatedScenes);

    const updatedScene = updatedScenes.find((s) => s.id === sceneId);
    if (updatedScene) {
      setSelectedScene(updatedScene);
    }
  };

  const handleSave = () => {
    if (!isDemoMode && id) {
      // Save all scene updates
      scenes.forEach((scene) => {
        updateScene.mutate({
          id: scene.id,
          story_id: id,
          duration: scene.duration,
          number: scene.number,
        });
      });
    }
    toast.success("Timeline saved successfully!");
  };

  const activeScene = activeId ? scenes.find((s) => s.id === activeId) : null;

  if (storyLoading || scenesLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

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
        <PageHeader 
          title={`Edit: ${story.title}`} 
          description="Drag scenes to reorder, adjust durations and audio"
        >
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

          {/* Scene Timeline with DnD */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Scenes Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={scenes.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {scenes.map((scene) => (
                    <SortableScene
                      key={scene.id}
                      scene={scene}
                      isSelected={selectedScene?.id === scene.id}
                      onClick={() => setSelectedScene(scene)}
                    />
                  ))}
                </SortableContext>

                <DragOverlay>
                  {activeScene ? (
                    <div className="flex items-center gap-3 rounded-xl border border-primary bg-card p-4 shadow-xl">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="soft">Scene {activeScene.number}</Badge>
                          <span className="font-medium">{activeScene.title}</span>
                        </div>
                        <div className="h-12 rounded-lg bg-muted/50 overflow-hidden flex items-center px-2 gap-px">
                          {(activeScene.audio_waveform || Array(20).fill(0.5)).map((height, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-primary/60 rounded-full min-w-[2px]"
                              style={{ height: `${(typeof height === 'number' ? height : 0.5) * 100}%` }}
                            />
                          ))}
                        </div>
                        <div className="mt-2 flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {activeScene.duration}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Volume2 className="h-3 w-3" />
                            Audio
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
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
                    <p className="text-sm text-muted-foreground">{selectedScene.visual_description}</p>
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
