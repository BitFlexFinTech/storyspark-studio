import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Settings,
  Trash2,
  RefreshCw
} from "lucide-react";
import { LucideIcon } from "lucide-react";

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  hasOAuth: boolean;
  onConnect: () => void;
  onManage?: () => void;
  onDisconnect?: () => void;
  metadata?: {
    lastSync?: string;
    accountName?: string;
  };
}

export function IntegrationCard({
  name,
  description,
  icon: Icon,
  status,
  hasOAuth,
  onConnect,
  onManage,
  onDisconnect,
  metadata,
}: IntegrationCardProps) {
  const isConnected = status === 'connected';
  const isError = status === 'error';
  const isPending = status === 'pending';

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="approved" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Connected
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Error
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Connecting...
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <XCircle className="h-3 w-3" />
            Not Connected
          </Badge>
        );
    }
  };

  return (
    <Card className={`transition-all duration-200 ${isConnected ? "border-status-approved/30" : isError ? "border-destructive/30" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-xl p-3 ${isConnected ? "bg-status-approved/10" : isError ? "bg-destructive/10" : "bg-muted"}`}>
              <Icon className={`h-6 w-6 ${isConnected ? "text-status-approved" : isError ? "text-destructive" : "text-muted-foreground"}`} />
            </div>
            <div>
              <CardTitle className="text-base font-bold">{name}</CardTitle>
              {metadata?.accountName && (
                <p className="text-xs text-muted-foreground">{metadata.accountName}</p>
              )}
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <CardDescription>{description}</CardDescription>
        
        {metadata?.lastSync && (
          <p className="text-xs text-muted-foreground">
            Last synced: {new Date(metadata.lastSync).toLocaleDateString()}
          </p>
        )}
        
        <div className="flex gap-2">
          {isConnected ? (
            <>
              {onManage && (
                <Button variant="outline" className="flex-1" onClick={onManage}>
                  <Settings className="mr-2 h-4 w-4" />
                  Manage
                </Button>
              )}
              {onDisconnect && (
                <Button variant="ghost" size="icon" onClick={onDisconnect} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </>
          ) : (
            <Button className="w-full" onClick={onConnect} disabled={isPending}>
              {hasOAuth ? "Connect with OAuth" : "Connect"}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
