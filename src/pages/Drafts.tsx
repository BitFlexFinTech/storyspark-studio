import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Search, Filter, ArrowRight, ChevronRight } from "lucide-react";
import { mockDrafts, Draft } from "@/data/mockData";
import { Link } from "react-router-dom";

const typeIcons: Record<string, string> = {
  story: "📖",
  video: "🎬",
  thumbnail: "🖼️",
  character: "👤",
  merch: "👕",
};

const Drafts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredDrafts = mockDrafts.filter((draft) => {
    const matchesSearch = draft.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || draft.status === statusFilter;
    const matchesType = typeFilter === "all" || draft.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getDetailLink = (draft: Draft) => {
    switch (draft.type) {
      case "story":
        return `/stories/${draft.id}`;
      case "video":
        return `/videos`;
      case "thumbnail":
        return `/thumbnails`;
      case "character":
        return `/characters`;
      case "merch":
        return `/merch`;
      default:
        return `/drafts`;
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Drafts"
        description="Manage all your content in various stages of completion."
      />

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search drafts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="review">In Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="story">Story</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="thumbnail">Thumbnail</SelectItem>
              <SelectItem value="character">Character</SelectItem>
              <SelectItem value="merch">Merch</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Drafts List */}
      <div className="space-y-3">
        {filteredDrafts.map((draft) => (
          <Link key={draft.id} to={getDetailLink(draft)}>
            <Card className="group transition-all duration-200 hover:border-primary/30 hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                <img
                  src={draft.thumbnail}
                  alt={draft.title}
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{typeIcons[draft.type]}</span>
                    <h3 className="truncate font-display font-bold text-foreground group-hover:text-primary transition-colors">
                      {draft.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Badge variant="outline" className="capitalize">
                      {draft.type}
                    </Badge>
                    <span>Updated {new Date(draft.updatedAt).toLocaleDateString()}</span>
                    {draft.assignee && <span>• {draft.assignee}</span>}
                  </div>
                </div>
                <StatusBadge status={draft.status} />
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredDrafts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">No drafts found</h3>
          <p className="max-w-sm text-muted-foreground">
            Try adjusting your filters or start creating new content.
          </p>
        </div>
      )}
    </AppLayout>
  );
};

export default Drafts;
