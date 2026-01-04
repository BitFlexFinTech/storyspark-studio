import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { IntegrationCard, PricingTier } from "@/components/integrations/IntegrationCard";
import { YouTubeSetupWizard } from "@/components/integrations/YouTubeSetupWizard";
import { TikTokSetupWizard } from "@/components/integrations/TikTokSetupWizard";
import { InstagramSetupWizard } from "@/components/integrations/InstagramSetupWizard";
import { StripeSetupWizard } from "@/components/integrations/StripeSetupWizard";
import { ShopifySetupWizard } from "@/components/integrations/ShopifySetupWizard";
import { ElevenLabsSetupWizard } from "@/components/integrations/ElevenLabsSetupWizard";
import { FirecrawlSetupWizard } from "@/components/integrations/FirecrawlSetupWizard";
import { PerplexitySetupWizard } from "@/components/integrations/PerplexitySetupWizard";
import { LovableAIInfo } from "@/components/integrations/LovableAIInfo";
import { WebSpeechInfo } from "@/components/integrations/WebSpeechInfo";
import { useIntegrations, useDeleteIntegration } from "@/hooks/useIntegrations";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Youtube, 
  Instagram, 
  Video,
  CreditCard,
  ShoppingBag,
  Mic,
  Search,
  Globe,
  Sparkles,
  Volume2,
  LucideIcon
} from "lucide-react";

interface IntegrationConfig {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  hasOAuth: boolean;
  category: 'social' | 'ai' | 'commerce';
  pricingTier: PricingTier;
  freeAlternative?: string;
  isBuiltIn?: boolean;
}

const AVAILABLE_INTEGRATIONS: IntegrationConfig[] = [
  // Social Platforms
  { 
    id: 'youtube', 
    name: 'YouTube', 
    icon: Youtube, 
    description: 'Multi-channel management, video publishing, and analytics', 
    hasOAuth: true, 
    category: 'social',
    pricingTier: 'free'
  },
  { 
    id: 'tiktok', 
    name: 'TikTok', 
    icon: Video, 
    description: 'Short-form content creation and publishing', 
    hasOAuth: true, 
    category: 'social',
    pricingTier: 'free'
  },
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: Instagram, 
    description: 'Share visual content and stories', 
    hasOAuth: true, 
    category: 'social',
    pricingTier: 'free'
  },
  
  // AI Services
  { 
    id: 'lovable-ai', 
    name: 'Lovable AI', 
    icon: Sparkles, 
    description: 'Built-in AI (Gemini, GPT) - No API key needed', 
    hasOAuth: false, 
    category: 'ai',
    pricingTier: 'free',
    isBuiltIn: true
  },
  { 
    id: 'web-speech', 
    name: 'Web Speech API', 
    icon: Volume2, 
    description: 'Browser-native voice synthesis for voice testing', 
    hasOAuth: false, 
    category: 'ai',
    pricingTier: 'free',
    isBuiltIn: true
  },
  { 
    id: 'elevenlabs', 
    name: 'ElevenLabs', 
    icon: Mic, 
    description: 'AI voice generation for characters and narration', 
    hasOAuth: false, 
    category: 'ai',
    pricingTier: 'paid',
    freeAlternative: 'Web Speech API'
  },
  { 
    id: 'firecrawl', 
    name: 'Firecrawl', 
    icon: Globe, 
    description: 'Web scraping for competitor analysis', 
    hasOAuth: false, 
    category: 'ai',
    pricingTier: 'paid',
    freeAlternative: 'Lovable AI'
  },
  { 
    id: 'perplexity', 
    name: 'Perplexity', 
    icon: Search, 
    description: 'AI-powered research and insights', 
    hasOAuth: false, 
    category: 'ai',
    pricingTier: 'paid',
    freeAlternative: 'Lovable AI'
  },
  
  // Commerce & Payments
  { 
    id: 'stripe', 
    name: 'Stripe', 
    icon: CreditCard, 
    description: 'Payment processing for subscriptions and purchases', 
    hasOAuth: false, 
    category: 'commerce',
    pricingTier: 'freemium'
  },
  { 
    id: 'shopify', 
    name: 'Shopify', 
    icon: ShoppingBag, 
    description: 'E-commerce and merchandise store', 
    hasOAuth: false, 
    category: 'commerce',
    pricingTier: 'paid'
  },
];

const Integrations = () => {
  const { data: integrations = [], refetch } = useIntegrations();
  const deleteIntegration = useDeleteIntegration();
  
  const [activeWizard, setActiveWizard] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

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

  const filteredIntegrations = activeTab === "all" 
    ? AVAILABLE_INTEGRATIONS 
    : AVAILABLE_INTEGRATIONS.filter(i => i.category === activeTab);

  return (
    <AppLayout>
      <PageHeader
        title="Integrations"
        description="Connect and manage third-party services to power your content workflow."
      />

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="social">Social Platforms</TabsTrigger>
          <TabsTrigger value="ai">AI Services</TabsTrigger>
          <TabsTrigger value="commerce">Commerce</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredIntegrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            name={integration.name}
            description={integration.description}
            icon={integration.icon}
            status={getIntegrationStatus(integration.id)}
            hasOAuth={integration.hasOAuth}
            pricingTier={integration.pricingTier}
            freeAlternative={integration.freeAlternative}
            isBuiltIn={integration.isBuiltIn}
            onConnect={() => handleConnect(integration.id)}
            onDisconnect={() => handleDisconnect(integration.id)}
          />
        ))}
      </div>

      {/* Social Platform Wizards */}
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

      {/* AI Service Wizards */}
      <ElevenLabsSetupWizard
        open={activeWizard === 'elevenlabs'}
        onOpenChange={(open) => !open && setActiveWizard(null)}
        onComplete={handleComplete}
      />

      <FirecrawlSetupWizard
        open={activeWizard === 'firecrawl'}
        onOpenChange={(open) => !open && setActiveWizard(null)}
        onComplete={handleComplete}
      />

      <PerplexitySetupWizard
        open={activeWizard === 'perplexity'}
        onOpenChange={(open) => !open && setActiveWizard(null)}
        onComplete={handleComplete}
      />

      {/* Built-in Info Dialogs */}
      <LovableAIInfo
        open={activeWizard === 'lovable-ai'}
        onOpenChange={(open) => !open && setActiveWizard(null)}
      />

      <WebSpeechInfo
        open={activeWizard === 'web-speech'}
        onOpenChange={(open) => !open && setActiveWizard(null)}
      />

      {/* Commerce Wizards */}
      <StripeSetupWizard
        open={activeWizard === 'stripe'}
        onOpenChange={(open) => !open && setActiveWizard(null)}
        onComplete={handleComplete}
      />

      <ShopifySetupWizard
        open={activeWizard === 'shopify'}
        onOpenChange={(open) => !open && setActiveWizard(null)}
        onComplete={handleComplete}
      />
    </AppLayout>
  );
};

export default Integrations;
