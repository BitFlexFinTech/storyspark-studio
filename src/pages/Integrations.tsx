import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plug, 
  Youtube, 
  Shirt, 
  Music, 
  Video, 
  Instagram, 
  ShoppingBag,
  CheckCircle,
  XCircle,
  ExternalLink
} from "lucide-react";
import { mockIntegrations } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";

const iconMap: Record<string, any> = {
  Youtube,
  Shirt,
  Music,
  Video,
  Instagram,
  ShoppingBag,
};

const Integrations = () => {
  const { role } = useAuth();
  const isAdmin = role === "admin";

  return (
    <AppLayout>
      <PageHeader
        title="Integrations"
        description={isAdmin ? "Manage all platform integrations." : "View connected integrations."}
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockIntegrations.map((integration) => {
          const Icon = iconMap[integration.icon] || Plug;
          const isConnected = integration.status === "connected";

          return (
            <Card
              key={integration.id}
              className={`transition-all duration-200 ${
                isConnected ? "border-status-approved/30" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-xl p-3 ${
                        isConnected ? "bg-status-approved/10" : "bg-muted"
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 ${
                          isConnected ? "text-status-approved" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-foreground">
                        {integration.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm">
                        {isConnected ? (
                          <>
                            <CheckCircle className="h-3 w-3 text-status-approved" />
                            <span className="text-status-approved">Connected</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Not connected</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  {integration.description}
                </p>
                {isAdmin ? (
                  <Button
                    variant={isConnected ? "outline" : "hero"}
                    className="w-full"
                  >
                    {isConnected ? (
                      <>
                        Manage
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      "Connect"
                    )}
                  </Button>
                ) : (
                  <Badge variant={isConnected ? "approved" : "secondary"} className="w-full justify-center py-2">
                    {isConnected ? "Active" : "Not Available"}
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default Integrations;
