import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, CheckCircle, BarChart3, Sparkles } from "lucide-react";
import { mockThumbnails, mockStories } from "@/data/mockData";

const Thumbnails = () => {
  return (
    <AppLayout>
      <PageHeader
        title="Thumbnails"
        description="A/B test and manage thumbnails for your videos."
      >
        <Button variant="hero">
          <Sparkles className="h-4 w-4" />
          Generate Thumbnails
        </Button>
      </PageHeader>

      <div className="space-y-8">
        {mockThumbnails.map((thumbnail) => {
          const story = mockStories.find((s) => s.id === thumbnail.storyId);
          return (
            <Card key={thumbnail.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  {story?.title || "Untitled Story"} - Thumbnail Variants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {thumbnail.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className={`group relative overflow-hidden rounded-xl border-2 transition-all ${
                        variant.isRecommended
                          ? "border-status-approved shadow-lg"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      {variant.isRecommended && (
                        <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-status-approved px-2 py-1 text-xs font-medium text-primary-foreground">
                          <CheckCircle className="h-3 w-3" />
                          Recommended
                        </div>
                      )}
                      <img
                        src={variant.image}
                        alt={variant.label}
                        className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="border-t border-border bg-card p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{variant.label}</span>
                          {variant.clickRate && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <BarChart3 className="h-4 w-4" />
                              {variant.clickRate}% CTR
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default Thumbnails;
