import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Square,
} from "lucide-react";
import { useCharacter, useUpdateCharacter } from "@/hooks/useCharacters";
import { toast } from "sonner";

interface CharacterState {
  name: string;
  personality: string;
  voiceStyle: string;
  voiceType: 'warm' | 'energetic' | 'calm' | 'playful';
  voiceAccent: string;
  voiceAge: number;
  traits: string[];
  lockedTraits: string[];
  appearance: string;
  backstory: string;
}

const CharacterEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: dbCharacter, isLoading } = useCharacter(id || "");
  const updateCharacter = useUpdateCharacter();

  const [character, setCharacter] = useState<CharacterState>({
    name: "",
    personality: "",
    voiceStyle: "",
    voiceType: "warm",
    voiceAccent: "American",
    voiceAge: 25,
    traits: [],
    lockedTraits: [],
    appearance: "",
    backstory: "",
  });
  const [newTrait, setNewTrait] = useState("");
  const [newLockedTrait, setNewLockedTrait] = useState("");
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize state from database character
  useEffect(() => {
    if (dbCharacter) {
      setCharacter({
        name: dbCharacter.name || "",
        personality: dbCharacter.personality || "",
        voiceStyle: dbCharacter.voice_type || "warm",
        voiceType: (dbCharacter.voice_type as 'warm' | 'energetic' | 'calm' | 'playful') || "warm",
        voiceAccent: dbCharacter.voice_accent || "American",
        voiceAge: parseInt(dbCharacter.voice_age || "25") || 25,
        traits: dbCharacter.role ? [dbCharacter.role] : [],
        lockedTraits: (dbCharacter.locked_traits as string[]) || [],
        appearance: dbCharacter.appearance || "",
        backstory: dbCharacter.backstory || "",
      });
    }
  }, [dbCharacter]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!dbCharacter && !isLoading) {
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
    setCharacter((prev) => ({ ...prev, traits: [...prev.traits, newTrait.trim()] }));
    setNewTrait("");
  };

  const removeTrait = (trait: string) => {
    setCharacter((prev) => ({ ...prev, traits: prev.traits.filter((t) => t !== trait) }));
  };

  const addLockedTrait = () => {
    if (!newLockedTrait.trim()) return;
    setCharacter((prev) => ({ ...prev, lockedTraits: [...prev.lockedTraits, newLockedTrait.trim()] }));
    setNewLockedTrait("");
  };

  const removeLockedTrait = (trait: string) => {
    if (!confirm("Removing locked traits may affect character consistency across content. Continue?")) return;
    setCharacter((prev) => ({ ...prev, lockedTraits: prev.lockedTraits.filter((t) => t !== trait) }));
    toast.warning("Locked trait removed - regeneration may vary");
  };

  // Real voice testing using Web Speech API
  const handleTestVoice = () => {
    if (!('speechSynthesis' in window)) {
      toast.error("Voice synthesis is not supported in your browser");
      return;
    }

    setIsTestingVoice(true);

    const sampleText = character.personality 
      ? `Hello, I am ${character.name}. ${character.personality.split('.')[0]}.`
      : `Hello, I am ${character.name}. Nice to meet you!`;

    const utterance = new SpeechSynthesisUtterance(sampleText);
    
    // Map voice settings to Web Speech API
    utterance.rate = character.voiceType === 'energetic' ? 1.2 : 
                     character.voiceType === 'calm' ? 0.9 : 1.0;
    utterance.pitch = character.voiceType === 'playful' ? 1.3 : 
                      character.voiceType === 'calm' ? 0.8 : 1.0;
    
    // Try to find a voice matching the accent
    const voices = speechSynthesis.getVoices();
    const accentMap: Record<string, string> = {
      'British': 'en-GB',
      'Australian': 'en-AU',
      'American': 'en-US',
      'Neutral': 'en-US',
    };
    
    const preferredVoice = voices.find(v => 
      v.lang.includes(accentMap[character.voiceAccent] || 'en-US')
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => {
      setIsTestingVoice(false);
      toast.success("Voice sample played");
    };

    utterance.onerror = () => {
      setIsTestingVoice(false);
      toast.error("Voice playback failed");
    };

    speechSynthesis.speak(utterance);
  };

  const handleStopVoice = () => {
    speechSynthesis.cancel();
    setIsTestingVoice(false);
  };

  const handleSave = async () => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      await updateCharacter.mutateAsync({
        id,
        name: character.name,
        personality: character.personality,
        voice_type: character.voiceType,
        voice_accent: character.voiceAccent,
        voice_age: character.voiceAge.toString(),
        role: character.traits[0] || null,
        locked_traits: character.lockedTraits,
        appearance: character.appearance,
        backstory: character.backstory,
      });
      toast.success("Character saved successfully!");
    } catch (error) {
      toast.error("Failed to save character");
    } finally {
      setIsSaving(false);
    }
  };

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.name || 'default'}`;

  return (
    <AppLayout>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/characters")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Characters
        </Button>
        <PageHeader title={`Edit: ${character.name || 'Character'}`} description="Customize character DNA, voice, and visual traits">
          <Button variant="hero" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
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
                  <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-lg">
                    <img
                      src={avatarUrl}
                      alt={character.name}
                      className="h-24 w-24"
                    />
                  </div>
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
                      onChange={(e) => setCharacter((prev) => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Personality</label>
                    <Textarea
                      value={character.personality}
                      onChange={(e) => setCharacter((prev) => ({ ...prev, personality: e.target.value }))}
                      className="mt-1"
                      rows={2}
                      placeholder="Describe the character's personality..."
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
                    onValueChange={(value: 'warm' | 'energetic' | 'calm' | 'playful') =>
                      setCharacter((prev) => ({ ...prev, voiceType: value }))
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
                    onValueChange={(value) => setCharacter((prev) => ({ ...prev, voiceAccent: value }))}
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
                  onValueChange={([value]) => setCharacter((prev) => ({ ...prev, voiceAge: value }))}
                  className="mt-2"
                />
              </div>

              <Button
                variant="outline"
                onClick={isTestingVoice ? handleStopVoice : handleTestVoice}
                className="w-full"
              >
                {isTestingVoice ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Stop Playing
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Test Voice (Web Speech API)
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Uses your browser's built-in voice synthesis. For premium voices, connect ElevenLabs in Integrations.
              </p>
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
                <div className="mx-auto h-40 w-40 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-lg">
                  <img
                    src={avatarUrl}
                    alt={character.name}
                    className="h-28 w-28"
                  />
                </div>
                <h3 className="mt-4 font-display text-xl font-bold">{character.name || "Unnamed"}</h3>
                <p className="text-sm text-muted-foreground capitalize">{character.voiceType} voice</p>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground mb-1">Personality</p>
                <p className="text-sm">{character.personality || "Not defined"}</p>
              </div>

              {character.traits.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {character.traits.slice(0, 3).map((trait) => (
                    <Badge key={trait} variant="soft" className="text-xs">
                      {trait}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default CharacterEditor;
