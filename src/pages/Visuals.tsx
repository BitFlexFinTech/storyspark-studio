import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, BookOpen, Shirt, Sparkles } from "lucide-react";

const visualCategories = [
  {
    id: "scenes",
    title: "Scene Art",
    images: [
      "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=300&fit=crop",
    ],
  },
  {
    id: "covers",
    title: "Book Covers",
    images: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop",
    ],
  },
  {
    id: "apparel",
    title: "Apparel Designs",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=300&fit=crop",
    ],
  },
];

const Visuals = () => {
  const [activeTab, setActiveTab] = useState("scenes");

  return (
    <AppLayout>
      <PageHeader
        title="Visuals"
        description="Browse and manage AI-generated visual assets for your stories."
      >
        <Button variant="hero">
          <Sparkles className="h-4 w-4" />
          Generate Visuals
        </Button>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="scenes" className="gap-2">
            <Image className="h-4 w-4" />
            Scene Art
          </TabsTrigger>
          <TabsTrigger value="covers" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Book Covers
          </TabsTrigger>
          <TabsTrigger value="apparel" className="gap-2">
            <Shirt className="h-4 w-4" />
            Apparel
          </TabsTrigger>
        </TabsList>

        {visualCategories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {category.images.map((image, i) => (
                <Card
                  key={i}
                  className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={image}
                      alt={`${category.title} ${i + 1}`}
                      className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="hero" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </AppLayout>
  );
};

export default Visuals;
