import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Settings,
  Trash2,
  RefreshCw,
  Sparkles,
  Info
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type PricingTier = 'free' | 'freemium' | 'paid';

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  hasOAuth: boolean;
  pricingTier: PricingTier;
  freeAlternative?: string;
  onConnect: () => void;
  onManage?: () => void;
  onDisconnect?: () => void;
  metadata?: {
    lastSync?: string;
    accountName?: string;
  };
  isBuiltIn?: boolean;
}

const PRICING_CONFIG: Record<PricingTier, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; tooltip: string }> = {
  free: { 
    label: "FREE", 
    variant: "default",
    tooltip: "Completely free to use, no payment required"
  },
  freemium: { 
    label: "FREEMIUM", 
    variant: "secondary",
    tooltip: "Free tier available with optional paid features"
  },
  paid: { 
    label: "PAID", 
    variant: "destructive",
    tooltip: "Requires a paid subscription or API credits"
  },
};

export function IntegrationCard({
  name,
  description,
  icon: Icon,
  status,
  hasOAuth,
  pricingTier,
  freeAlternative,
  onConnect,
  onManage,
  onDisconnect,
  metadata,
  isBuiltIn = false,
}: IntegrationCardProps) {
  const isConnected = status === 'connected' || isBuiltIn;
  const isError = status === 'error';
  const isPending = status === 'pending';
  const pricingConfig = PRICING_CONFIG[pricingTier];

  const getStatusBadge = () => {
    if (isBuiltIn) {
      return (
        <Badge variant="approved" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Built-in
        </Badge>
      );
    }
    
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
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold">{name}</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge 
                        variant={pricingConfig.variant}
                        className={`text-[10px] px-1.5 py-0 ${
                          pricingTier === 'free' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''
                        }`}
                      >
                        {pricingConfig.label}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{pricingConfig.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
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
        
        {/* Free Alternative Suggestion */}
        {freeAlternative && !isConnected && pricingTier === 'paid' && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Sparkles className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-xs text-emerald-600 dark:text-emerald-400">
              Free alternative: <span className="font-medium">{freeAlternative}</span>
            </span>
          </div>
        )}
        
        {metadata?.lastSync && (
          <p className="text-xs text-muted-foreground">
            Last synced: {new Date(metadata.lastSync).toLocaleDateString()}
          </p>
        )}
        
        <div className="flex gap-2">
          {isBuiltIn ? (
            <Button variant="outline" className="w-full" onClick={onConnect}>
              <Info className="mr-2 h-4 w-4" />
              View Details
            </Button>
          ) : isConnected ? (
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
