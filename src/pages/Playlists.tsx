import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListMusic, Video, Plus } from "lucide-react";
import { mockPlaylists } from "@/data/mockData";

const Playlists = () => {
  return (
    <AppLayout>
      <PageHeader
        title="Playlists"
        description="Auto-generated playlists for your YouTube channel."
      >
        <Button variant="hero">
          <Plus className="h-4 w-4" />
          Create Playlist
        </Button>
      </PageHeader>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockPlaylists.map((playlist) => (
          <Card
            key={playlist.id}
            className="group cursor-pointer overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
          >
            <div className="relative aspect-video overflow-hidden">
              <img
                src={playlist.thumbnail}
                alt={playlist.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/20 p-2 backdrop-blur-sm">
                    <ListMusic className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <Badge variant="secondary" className="bg-background/50 backdrop-blur-sm">
                    <Video className="mr-1 h-3 w-3" />
                    {playlist.videoCount} videos
                  </Badge>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="mb-2 font-display font-bold text-foreground">
                {playlist.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {playlist.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
};

export default Playlists;
