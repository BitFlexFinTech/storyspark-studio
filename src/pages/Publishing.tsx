import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Upload, 
  Youtube, 
  Calendar, 
  Clock, 
  Globe,
  Tag,
  CheckCircle
} from "lucide-react";
import { mockVideos } from "@/data/mockData";

const Publishing = () => {
  const [selectedVideo, setSelectedVideo] = useState(mockVideos[0]);

  const approvedVideos = mockVideos.filter((v) => v.status === "approved");

  return (
    <AppLayout>
      <PageHeader
        title="Publishing"
        description="Preview and schedule your content for YouTube."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Video Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ready to Publish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {approvedVideos.length > 0 ? (
                approvedVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                      selectedVideo.id === video.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
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
                    {selectedVideo.id === video.id && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No approved videos ready for publishing.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Publishing Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-destructive" />
                YouTube Upload Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Video Preview */}
              <div className="aspect-video overflow-hidden rounded-xl bg-muted">
                <img
                  src={selectedVideo.thumbnail}
                  alt={selectedVideo.title}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Title</label>
                <Input defaultValue={selectedVideo.title} />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea
                  rows={4}
                  defaultValue={`Join ${selectedVideo.title.split(" ")[0]} on an exciting adventure! 

🌟 Subscribe for more magical stories!
💫 New episodes every week!

#KidsContent #Animation #Stories`}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {["kids", "animation", "stories", "bedtime", "educational"].map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer">
                      {tag}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="cursor-pointer">
                    + Add tag
                  </Badge>
                </div>
              </div>

              {/* Schedule */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Publish Date
                  </label>
                  <Input type="date" defaultValue="2024-02-01" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Publish Time
                  </label>
                  <Input type="time" defaultValue="10:00" />
                </div>
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Visibility
                </label>
                <Select defaultValue="public">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="unlisted">Unlisted</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button variant="hero" className="flex-1">
                  <Upload className="h-4 w-4" />
                  Schedule Publish
                </Button>
                <Button variant="outline">Save Draft</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Publishing;
