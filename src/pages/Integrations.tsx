import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { IntegrationCard } from "@/components/integrations/IntegrationCard";
import { YouTubeSetupWizard } from "@/components/integrations/YouTubeSetupWizard";
import { TikTokSetupWizard } from "@/components/integrations/TikTokSetupWizard";
import { InstagramSetupWizard } from "@/components/integrations/InstagramSetupWizard";
import { useIntegrations, useDeleteIntegration } from "@/hooks/useIntegrations";
import { toast } from "sonner";
import { 
  Youtube, 
  Instagram, 
  Video,
  CreditCard,
  ShoppingBag,
  Mic,
  Search,
  Globe
} from "lucide-react";

const AVAILABLE_INTEGRATIONS = [
  { id: 'youtube', name: 'YouTube', icon: Youtube, description: 'Multi-channel management, video publishing, and analytics', hasOAuth: true, category: 'Social' },
  { id: 'tiktok', name: 'TikTok', icon: Video, description: 'Short-form content creation and publishing', hasOAuth: true, category: 'Social' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, description: 'Share visual content and stories', hasOAuth: true, category: 'Social' },
  { id: 'stripe', name: 'Stripe', icon: CreditCard, description: 'Payment processing for subscriptions and purchases', hasOAuth: true, category: 'Payments' },
  { id: 'shopify', name: 'Shopify', icon: ShoppingBag, description: 'E-commerce and merchandise store', hasOAuth: true, category: 'Commerce' },
  { id: 'elevenlabs', name: 'ElevenLabs', icon: Mic, description: 'AI voice generation for characters', hasOAuth: false, category: 'AI' },
  { id: 'firecrawl', name: 'Firecrawl', icon: Globe, description: 'Web scraping for competitor analysis', hasOAuth: false, category: 'AI' },
  { id: 'perplexity', name: 'Perplexity', icon: Search, description: 'AI-powered research and insights', hasOAuth: false, category: 'AI' },
];

const Integrations = () => {
  const { data: integrations = [], refetch } = useIntegrations();
  const deleteIntegration = useDeleteIntegration();
  
  const [activeWizard, setActiveWizard] = useState<string | null>(null);

  const getIntegrationStatus = (platformId: string) => {
    const integration = integrations.find(i => i.platform === platformId);
    return integration?.status as 'connected' | 'disconnected' | 'error' | undefined ?? 'disconnected';
  };

  const handleDisconnect = async (platformId: string) => {
    const integration = integrations.find(i => i.platform === platformId);
    if (integration) {
      try {
        await deleteIntegration.mutateAsync(integration.id);
        toast.success('Integration disconnected');
      } catch {
        toast.error('Failed to disconnect');
      }
    }
  };

  const handleComplete = () => {
    refetch();
    setActiveWizard(null);
  };

  const handleConnect = (platformId: string) => {
    setActiveWizard(platformId);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Integrations"
        description="Connect and manage third-party services to power your content workflow."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {AVAILABLE_INTEGRATIONS.map((integration) => (
          <IntegrationCard
            key={integration.id}
            name={integration.name}
            description={integration.description}
            icon={integration.icon}
            status={getIntegrationStatus(integration.id)}
            hasOAuth={integration.hasOAuth}
            onConnect={() => handleConnect(integration.id)}
            onDisconnect={() => handleDisconnect(integration.id)}
          />
        ))}
      </div>

      <YouTubeSetupWizard
        open={activeWizard === 'youtube'}
        onOpenChange={(open) => !open && setActiveWizard(null)}
        onComplete={handleComplete}
      />
      
      <TikTokSetupWizard
        open={activeWizard === 'tiktok'}
        onOpenChange={(open) => !open && setActiveWizard(null)}
        onComplete={handleComplete}
      />
      
      <InstagramSetupWizard
        open={activeWizard === 'instagram'}
        onOpenChange={(open) => !open && setActiveWizard(null)}
        onComplete={handleComplete}
      />
    </AppLayout>
  );
};

export default Integrations;
