import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Save,
  Upload,
  Plus,
  X,
  Lock,
  Unlock,
  Volume2,
  Play,
  User,
  Sparkles,
} from "lucide-react";
import { mockCharacters, mockStories, Character } from "@/data/mockData";
import { toast } from "sonner";

const CharacterEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const originalCharacter = mockCharacters.find((c) => c.id === id);

  const [character, setCharacter] = useState<Character | null>(originalCharacter || null);
  const [newTrait, setNewTrait] = useState("");
  const [newLockedTrait, setNewLockedTrait] = useState("");
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  if (!character) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center p-12">
          <h2 className="text-xl font-semibold">Character not found</h2>
          <Button variant="ghost" onClick={() => navigate("/characters")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Characters
          </Button>
        </div>
      </AppLayout>
    );
  }

  const addTrait = () => {
    if (!newTrait.trim()) return;
    setCharacter((prev) =>
      prev ? { ...prev, traits: [...prev.traits, newTrait.trim()] } : prev
    );
    setNewTrait("");
  };

  const removeTrait = (trait: string) => {
    setCharacter((prev) =>
      prev ? { ...prev, traits: prev.traits.filter((t) => t !== trait) } : prev
    );
  };

  const addLockedTrait = () => {
    if (!newLockedTrait.trim()) return;
    setCharacter((prev) =>
      prev ? { ...prev, lockedTraits: [...prev.lockedTraits, newLockedTrait.trim()] } : prev
    );
    setNewLockedTrait("");
  };

  const removeLockedTrait = (trait: string) => {
    if (!confirm("Removing locked traits may affect character consistency across content. Continue?")) return;
    setCharacter((prev) =>
      prev ? { ...prev, lockedTraits: prev.lockedTraits.filter((t) => t !== trait) } : prev
    );
    toast.warning("Locked trait removed - regeneration may vary");
  };

  const handleTestVoice = () => {
    setIsTestingVoice(true);
    setTimeout(() => {
      setIsTestingVoice(false);
      toast.success("Voice sample played");
    }, 2000);
  };

  const handleSave = () => {
    toast.success("Character saved successfully!");
  };

  const characterStories = mockStories.filter((s) => character.stories.includes(s.id));

  return (
    <AppLayout>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/characters")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Characters
        </Button>
        <PageHeader title={`Edit: ${character.name}`} description="Customize character DNA, voice, and visual traits">
          <Button variant="hero" onClick={handleSave}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </PageHeader>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Avatar & Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-6">
                <div className="relative">
                  <img
                    src={character.avatar}
                    alt={character.name}
                    className="h-32 w-32 rounded-2xl object-cover shadow-lg"
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={character.name}
                      onChange={(e) =>
                        setCharacter((prev) => (prev ? { ...prev, name: e.target.value } : prev))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Personality</label>
                    <Textarea
                      value={character.personality}
                      onChange={(e) =>
                        setCharacter((prev) =>
                          prev ? { ...prev, personality: e.target.value } : prev
                        )
                      }
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voice Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-secondary" />
                Voice Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Voice Type</label>
                  <Select
                    value={character.voiceType}
                    onValueChange={(value: any) =>
                      setCharacter((prev) => (prev ? { ...prev, voiceType: value } : prev))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="energetic">Energetic</SelectItem>
                      <SelectItem value="calm">Calm</SelectItem>
                      <SelectItem value="playful">Playful</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Accent</label>
                  <Select
                    value={character.voiceAccent}
                    onValueChange={(value) =>
                      setCharacter((prev) => (prev ? { ...prev, voiceAccent: value } : prev))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="American">American</SelectItem>
                      <SelectItem value="British">British</SelectItem>
                      <SelectItem value="Australian">Australian</SelectItem>
                      <SelectItem value="Neutral">Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Voice Age: {character.voiceAge} years</label>
                <Slider
                  value={[character.voiceAge]}
                  min={5}
                  max={60}
                  step={1}
                  onValueChange={([value]) =>
                    setCharacter((prev) => (prev ? { ...prev, voiceAge: value } : prev))
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Voice Style Description</label>
                <Input
                  value={character.voiceStyle}
                  onChange={(e) =>
                    setCharacter((prev) => (prev ? { ...prev, voiceStyle: e.target.value } : prev))
                  }
                  className="mt-1"
                />
              </div>

              <Button
                variant="outline"
                onClick={handleTestVoice}
                disabled={isTestingVoice}
                className="w-full"
              >
                {isTestingVoice ? (
                  <>
                    <Volume2 className="h-4 w-4 animate-pulse" />
                    Playing Sample...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Test Voice
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Personality Traits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent-foreground" />
                Personality Traits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {character.traits.map((trait) => (
                  <Badge key={trait} variant="soft" className="gap-1 pr-1">
                    {trait}
                    <button
                      onClick={() => removeTrait(trait)}
                      className="ml-1 rounded-full p-0.5 hover:bg-primary/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add new trait..."
                  value={newTrait}
                  onChange={(e) => setNewTrait(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTrait()}
                />
                <Button variant="secondary" onClick={addTrait}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Locked Visual Traits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-status-review" />
                Locked Visual Traits
                <Badge variant="outline" className="ml-2 text-xs">
                  Consistent across all content
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                These traits remain consistent in every generated scene. Unlocking may cause visual inconsistencies.
              </p>
              <div className="flex flex-wrap gap-2">
                {character.lockedTraits.map((trait) => (
                  <Badge key={trait} variant="secondary" className="gap-1 border border-border">
                    <Lock className="h-3 w-3" />
                    {trait}
                    <button
                      onClick={() => removeLockedTrait(trait)}
                      className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                    >
                      <Unlock className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add locked trait..."
                  value={newLockedTrait}
                  onChange={(e) => setNewLockedTrait(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addLockedTrait()}
                />
                <Button variant="secondary" onClick={addLockedTrait}>
                  <Lock className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Sidebar */}
        <div className="space-y-6">
          {/* Live Preview */}
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-base">Character Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="mx-auto h-40 w-40 rounded-2xl object-cover shadow-lg"
                />
                <h3 className="mt-4 font-display text-xl font-bold">{character.name}</h3>
                <p className="text-sm text-muted-foreground">{character.voiceStyle}</p>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground mb-1">Personality</p>
                <p className="text-sm">{character.personality}</p>
              </div>

              <div className="flex flex-wrap gap-1">
                {character.traits.slice(0, 3).map((trait) => (
                  <Badge key={trait} variant="soft" className="text-xs">
                    {trait}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Story Appearances */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appears In</CardTitle>
            </CardHeader>
            <CardContent>
              {characterStories.length > 0 ? (
                <div className="space-y-2">
                  {characterStories.map((story) => (
                    <div
                      key={story.id}
                      className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/stories/${story.id}`)}
                    >
                      <img
                        src={story.thumbnail}
                        alt={story.title}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">{story.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{story.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-4">
                  Not used in any stories yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default CharacterEditor;
