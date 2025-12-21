import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, Lock, Sparkles } from "lucide-react";
import { mockCharacters } from "@/data/mockData";

const Characters = () => {
  const [selectedCharacter, setSelectedCharacter] = useState<typeof mockCharacters[0] | null>(null);

  return (
    <AppLayout>
      <PageHeader
        title="Characters"
        description="Meet your story characters and their unique DNA."
      >
        <Button variant="hero">
          <Sparkles className="h-4 w-4" />
          Create Character
        </Button>
      </PageHeader>

      {/* Characters Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {mockCharacters.map((character) => (
          <Card
            key={character.id}
            className="group cursor-pointer overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
            onClick={() => setSelectedCharacter(character)}
          >
            <div className="relative">
              <img
                src={character.avatar}
                alt={character.name}
                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </div>
            <CardContent className="relative -mt-12 p-4">
              <h3 className="font-display text-xl font-bold text-foreground">
                {character.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {character.personality}
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
                  <img
                    src={selectedCharacter.avatar}
                    alt={selectedCharacter.name}
                    className="h-24 w-24 rounded-2xl object-cover shadow-lg"
                  />
                  <div>
                    <h3 className="font-display text-xl font-bold">{selectedCharacter.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedCharacter.voiceStyle}</p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">Personality</h4>
                  <p className="text-foreground">{selectedCharacter.personality}</p>
                </div>

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

                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                    Appears in {selectedCharacter.stories.length} stories
                  </h4>
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
