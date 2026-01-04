import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, Lock, Sparkles, User } from "lucide-react";
import { useCharacters } from "@/hooks/useCharacters";

interface CharacterDisplay {
  id: string;
  name: string;
  avatar: string;
  personality: string | null;
  voiceStyle: string;
  traits: string[];
  lockedTraits: string[];
  stories: string[];
}

const Characters = () => {
  const { data: characters = [], isLoading } = useCharacters();
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterDisplay | null>(null);

  // Transform database characters to display format
  const displayCharacters: CharacterDisplay[] = characters.map(char => ({
    id: char.id,
    name: char.name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${char.name}`, // Generate avatar from name
    personality: char.personality,
    voiceStyle: char.voice_type || 'warm',
    traits: char.role ? [char.role] : [],
    lockedTraits: (char.locked_traits as string[]) || [],
    stories: [],
  }));

  return (
    <AppLayout>
      <PageHeader
        title="Characters"
        description="Meet your story characters and their unique DNA."
      >
        <Button variant="hero" asChild>
          <Link to="/characters/new">
            <Sparkles className="h-4 w-4" />
            Create Character
          </Link>
        </Button>
      </PageHeader>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Characters Grid */}
      {!isLoading && displayCharacters.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayCharacters.map((character) => (
            <Card
              key={character.id}
              className="group cursor-pointer overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
              onClick={() => setSelectedCharacter(character)}
            >
              <div className="relative">
                <div className="aspect-square w-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <img
                    src={character.avatar}
                    alt={character.name}
                    className="h-32 w-32 transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              </div>
              <CardContent className="relative -mt-12 p-4">
                <h3 className="font-display text-xl font-bold text-foreground">
                  {character.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {character.personality || "No personality defined"}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {character.traits.slice(0, 2).map((trait) => (
                    <Badge key={trait} variant="soft" className="text-xs">
                      {trait}
                    </Badge>
                  ))}
                  {character.traits.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{character.traits.length - 2}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && displayCharacters.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            No characters yet
          </h3>
          <p className="max-w-sm text-muted-foreground">
            Create your first character to bring your stories to life.
          </p>
          <Button variant="hero" className="mt-4" asChild>
            <Link to="/characters/new">
              <Sparkles className="h-4 w-4" />
              Create Character
            </Link>
          </Button>
        </div>
      )}

      {/* Character DNA Dialog */}
      <Dialog open={!!selectedCharacter} onOpenChange={() => setSelectedCharacter(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedCharacter && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Character DNA: {selectedCharacter.name}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-lg">
                    <img
                      src={selectedCharacter.avatar}
                      alt={selectedCharacter.name}
                      className="h-16 w-16"
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold">{selectedCharacter.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{selectedCharacter.voiceStyle} voice</p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">Personality</h4>
                  <p className="text-foreground">{selectedCharacter.personality || "Not defined"}</p>
                </div>

                {selectedCharacter.traits.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">Traits</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCharacter.traits.map((trait) => (
                        <Badge key={trait} variant="soft">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCharacter.lockedTraits.length > 0 && (
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      Locked Traits (Consistent across all content)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCharacter.lockedTraits.map((trait) => (
                        <Badge key={trait} variant="secondary" className="border border-border">
                          <Lock className="mr-1 h-3 w-3" />
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to={`/characters/${selectedCharacter.id}`}>Edit Character</Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Characters;
