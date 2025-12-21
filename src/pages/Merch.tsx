import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shirt, Sparkles, ShoppingCart } from "lucide-react";
import { mockMerch } from "@/data/mockData";
import { useState } from "react";

const Merch = () => {
  const [activeTab, setActiveTab] = useState("all");
  const categories = ["all", ...new Set(mockMerch.map((item) => item.type))];

  const filteredMerch = mockMerch.filter((item) => {
    if (activeTab === "all") return true;
    return item.type === activeTab;
  });

  return (
    <AppLayout>
      <PageHeader
        title="Merchandise"
        description="Design and manage merchandise for your characters."
      >
        <Button variant="hero">
          <Sparkles className="h-4 w-4" />
          Design Merch
        </Button>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredMerch.map((item) => (
              <Card
                key={item.id}
                className="group cursor-pointer overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="hero" size="sm">
                      <ShoppingCart className="h-4 w-4" />
                      View Product
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <Badge variant="soft" className="mb-2">
                    {item.type}
                  </Badge>
                  <h3 className="font-display font-bold text-foreground">
                    {item.name}
                  </h3>
                  {item.character && (
                    <p className="text-sm text-muted-foreground">{item.character}</p>
                  )}
                  <p className="mt-2 text-lg font-bold text-primary">
                    ${item.price.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Merch;
