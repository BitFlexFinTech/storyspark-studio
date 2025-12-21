import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client with user's token
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the user from the JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('User error:', userError);
      throw new Error('Unable to get user');
    }

    console.log('Processing onboarding for user:', user.id);

    // Get the provider token (Google OAuth access token) from user's identities
    const googleIdentity = user.identities?.find(i => i.provider === 'google');
    
    // Get the session to access the provider token
    const { data: sessionData } = await supabaseClient.auth.getSession();
    const providerToken = sessionData?.session?.provider_token;

    if (!providerToken) {
      console.log('No provider token found, user may need to re-authenticate');
      return new Response(
        JSON.stringify({ 
          error: 'No YouTube access token found. Please sign out and sign in again.',
          needsReauth: true 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching YouTube channel info...');

    // Fetch the user's YouTube channel
    const channelResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true',
      {
        headers: {
          'Authorization': `Bearer ${providerToken}`,
        },
      }
    );

    if (!channelResponse.ok) {
      const errorText = await channelResponse.text();
      console.error('YouTube API error:', errorText);
      throw new Error(`YouTube API error: ${channelResponse.status}`);
    }

    const channelData = await channelResponse.json();
    
    if (!channelData.items || channelData.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No YouTube channel found for this account' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const channel = channelData.items[0];
    console.log('Found channel:', channel.snippet.title);

    // Check if channel already exists for this user
    const { data: existingChannel } = await supabaseClient
      .from('youtube_channels')
      .select('id')
      .eq('user_id', user.id)
      .eq('channel_id', channel.id)
      .maybeSingle();

    let channelRecord;

    if (existingChannel) {
      // Update existing channel
      const { data, error } = await supabaseClient
        .from('youtube_channels')
        .update({
          channel_name: channel.snippet.title,
          thumbnail_url: channel.snippet.thumbnails?.default?.url,
          channel_url: `https://www.youtube.com/channel/${channel.id}`,
          subscriber_count: parseInt(channel.statistics.subscriberCount) || 0,
          video_count: parseInt(channel.statistics.videoCount) || 0,
          access_token: providerToken,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingChannel.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating channel:', error);
        throw error;
      }
      channelRecord = data;
    } else {
      // Insert new channel
      const { data, error } = await supabaseClient
        .from('youtube_channels')
        .insert({
          user_id: user.id,
          channel_id: channel.id,
          channel_name: channel.snippet.title,
          thumbnail_url: channel.snippet.thumbnails?.default?.url,
          channel_url: `https://www.youtube.com/channel/${channel.id}`,
          subscriber_count: parseInt(channel.statistics.subscriberCount) || 0,
          video_count: parseInt(channel.statistics.videoCount) || 0,
          access_token: providerToken,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting channel:', error);
        throw error;
      }
      channelRecord = data;
    }

    console.log('Channel saved, fetching videos...');

    // Fetch recent videos from the channel
    const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
    let videos: any[] = [];

    if (uploadsPlaylistId) {
      const videosResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50`,
        {
          headers: {
            'Authorization': `Bearer ${providerToken}`,
          },
        }
      );

      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        videos = videosData.items || [];

        console.log(`Found ${videos.length} videos`);

        // Store videos in the database
        for (const video of videos) {
          const videoId = video.contentDetails.videoId;
          const snippet = video.snippet;

          // Check if video already exists
          const { data: existingVideo } = await supabaseClient
            .from('videos')
            .select('id')
            .eq('user_id', user.id)
            .eq('video_url', `https://www.youtube.com/watch?v=${videoId}`)
            .maybeSingle();

          if (!existingVideo) {
            await supabaseClient
              .from('videos')
              .insert({
                user_id: user.id,
                title: snippet.title,
                thumbnail_url: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url,
                video_url: `https://www.youtube.com/watch?v=${videoId}`,
                published_at: snippet.publishedAt,
                status: 'published',
              });
          }
        }
      }
    }

    console.log('Onboarding complete!');

    return new Response(
      JSON.stringify({
        success: true,
        channel: {
          id: channelRecord.id,
          channelId: channel.id,
          name: channel.snippet.title,
          thumbnailUrl: channel.snippet.thumbnails?.default?.url,
          subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
          videoCount: parseInt(channel.statistics.videoCount) || 0,
        },
        videosImported: videos.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in onboard-youtube-channel:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
