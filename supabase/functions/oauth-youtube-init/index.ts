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

    const { clientId, clientSecret, redirectUri } = await req.json();
    
    if (!clientId || !clientSecret) {
      throw new Error('Client ID and Client Secret are required');
    }

    // Generate secure state token
    const state = crypto.randomUUID();
    
    // Store credentials and state in integrations table
    const { error: upsertError } = await supabaseClient
      .from('integrations')
      .upsert({
        user_id: user.id,
        platform: 'youtube',
        oauth_state: state,
        metadata: { 
          client_id: clientId, 
          client_secret: clientSecret,
          redirect_uri: redirectUri 
        },
        status: 'pending'
      }, { 
        onConflict: 'user_id,platform',
        ignoreDuplicates: false 
      });

    if (upsertError) {
      console.error('Error storing OAuth state:', upsertError);
      throw new Error('Failed to initialize OAuth');
    }

    // Build Google OAuth URL
    const scopes = [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/yt-analytics.readonly'
    ].join(' ');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent',
      state: state
    });

    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    console.log(`OAuth initiated for user ${user.id}`);

    return new Response(JSON.stringify({ 
      oauthUrl,
      state 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('OAuth init error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
