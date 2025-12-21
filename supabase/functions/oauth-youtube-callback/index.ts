import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { code, state } = await req.json();
    
    if (!code || !state) {
      throw new Error('Missing authorization code or state');
    }

    // Verify state and get stored credentials
    const { data: integration, error: fetchError } = await supabaseClient
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'youtube')
      .eq('oauth_state', state)
      .single();

    if (fetchError || !integration) {
      console.error('State validation failed:', fetchError);
      throw new Error('Invalid OAuth state - possible CSRF attack');
    }

    const { client_id, client_secret, redirect_uri } = integration.metadata as {
      client_id: string;
      client_secret: string;
      redirect_uri: string;
    };

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id,
        client_secret,
        redirect_uri,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Token exchange error:', tokenData);
      throw new Error(tokenData.error_description || 'Failed to exchange code for tokens');
    }

    const { access_token, refresh_token, expires_in } = tokenData;
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

    // Fetch channel information
    const channelResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
      {
        headers: { Authorization: `Bearer ${access_token}` }
      }
    );

    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      throw new Error('No YouTube channel found for this account');
    }

    const channel = channelData.items[0];
    const channelInfo = {
      channel_id: channel.id,
      channel_name: channel.snippet.title,
      channel_url: `https://www.youtube.com/channel/${channel.id}`,
      thumbnail_url: channel.snippet.thumbnails?.default?.url || null,
      subscriber_count: parseInt(channel.statistics.subscriberCount) || 0,
      video_count: parseInt(channel.statistics.videoCount) || 0
    };

    // Update integration with tokens
    const { error: updateError } = await supabaseClient
      .from('integrations')
      .update({
        access_token,
        refresh_token,
        token_expires_at: tokenExpiresAt,
        status: 'connected',
        oauth_state: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', integration.id);

    if (updateError) {
      console.error('Failed to update integration:', updateError);
      throw new Error('Failed to store tokens');
    }

    // Create or update YouTube channel record
    const { error: channelError } = await supabaseClient
      .from('youtube_channels')
      .upsert({
        user_id: user.id,
        ...channelInfo,
        access_token,
        refresh_token,
        token_expires_at: tokenExpiresAt,
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,channel_id',
        ignoreDuplicates: false
      });

    if (channelError) {
      console.error('Failed to create channel:', channelError);
      // Don't throw - integration is still connected
    }

    console.log(`YouTube OAuth completed for user ${user.id}, channel: ${channelInfo.channel_name}`);

    return new Response(JSON.stringify({ 
      success: true,
      channel: channelInfo
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
