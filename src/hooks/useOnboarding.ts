import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ChannelData {
  id: string;
  channelId: string;
  name: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
}

interface OnboardingState {
  isOnboarding: boolean;
  isComplete: boolean;
  channel: ChannelData | null;
  videosImported: number;
  error: string | null;
  needsReauth: boolean;
}

export function useOnboarding() {
  const { user, session, isAuthenticated } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    isOnboarding: false,
    isComplete: false,
    channel: null,
    videosImported: 0,
    error: null,
    needsReauth: false,
  });

  const checkExistingChannel = async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('youtube_channels')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error checking existing channel:', error);
      return null;
    }

    return data;
  };

  const startOnboarding = async () => {
    if (!session) {
      setState(prev => ({ ...prev, error: 'Not authenticated' }));
      return;
    }

    setState(prev => ({ ...prev, isOnboarding: true, error: null }));

    try {
      const { data, error } = await supabase.functions.invoke('onboard-youtube-channel', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        setState(prev => ({
          ...prev,
          isOnboarding: false,
          error: data.error,
          needsReauth: data.needsReauth || false,
        }));
        return;
      }

      setState({
        isOnboarding: false,
        isComplete: true,
        channel: data.channel,
        videosImported: data.videosImported,
        error: null,
        needsReauth: false,
      });
    } catch (error) {
      console.error('Onboarding error:', error);
      setState(prev => ({
        ...prev,
        isOnboarding: false,
        error: error instanceof Error ? error.message : 'Failed to onboard channel',
      }));
    }
  };

  // Check if user already has a channel on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      checkExistingChannel().then(channel => {
        if (channel) {
          setState({
            isOnboarding: false,
            isComplete: true,
            channel: {
              id: channel.id,
              channelId: channel.channel_id,
              name: channel.channel_name,
              thumbnailUrl: channel.thumbnail_url || '',
              subscriberCount: channel.subscriber_count || 0,
              videoCount: channel.video_count || 0,
            },
            videosImported: channel.video_count || 0,
            error: null,
            needsReauth: false,
          });
        }
      });
    }
  }, [isAuthenticated, user]);

  return {
    ...state,
    startOnboarding,
    checkExistingChannel,
  };
}
