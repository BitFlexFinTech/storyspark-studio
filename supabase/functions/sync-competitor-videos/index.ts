import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    thumbnails: {
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
    publishedAt: string;
  };
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
  contentDetails?: {
    duration?: string;
  };
}

function parseDuration(duration: string): number {
  // Parse ISO 8601 duration (PT1H2M3S)
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');

    if (!YOUTUBE_API_KEY) {
      throw new Error('YOUTUBE_API_KEY not configured');
    }

    // Use anon key for auth check
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Use service role for writes
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Syncing competitor videos for user:', user.id);

    // Get user's competitors
    const { data: competitors, error: compError } = await supabaseAnon
      .from('competitors')
      .select('id, channel_id, channel_name')
      .eq('user_id', user.id);

    if (compError) {
      throw new Error(`Failed to fetch competitors: ${compError.message}`);
    }

    if (!competitors || competitors.length === 0) {
      return new Response(JSON.stringify({
        message: 'No competitors to sync',
        synced: 0,
        competitors: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const syncResults: { channelName: string; videosAdded: number; videosUpdated: number }[] = [];

    for (const competitor of competitors) {
      try {
        console.log(`Syncing videos for competitor: ${competitor.channel_name}`);

        // Get channel's uploads playlist
        const channelResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${competitor.channel_id}&key=${YOUTUBE_API_KEY}`
        );

        if (!channelResponse.ok) {
          console.error(`Failed to fetch channel ${competitor.channel_id}`);
          continue;
        }

        const channelData = await channelResponse.json();
        const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

        if (!uploadsPlaylistId) {
          console.error(`No uploads playlist for ${competitor.channel_name}`);
          continue;
        }

        // Fetch videos from uploads playlist
        const playlistResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=25&key=${YOUTUBE_API_KEY}`
        );

        if (!playlistResponse.ok) {
          console.error(`Failed to fetch playlist for ${competitor.channel_name}`);
          continue;
        }

        const playlistData = await playlistResponse.json();
        const videoIds = playlistData.items?.map((item: any) => item.contentDetails.videoId) || [];

        if (videoIds.length === 0) {
          continue;
        }

        // Get detailed video stats
        const videosResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`
        );

        if (!videosResponse.ok) {
          console.error(`Failed to fetch video details for ${competitor.channel_name}`);
          continue;
        }

        const videosData = await videosResponse.json();
        const videos: YouTubeVideo[] = videosData.items || [];

        let videosAdded = 0;
        let videosUpdated = 0;

        for (const video of videos) {
          const thumbnailUrl = video.snippet.thumbnails.high?.url ||
            video.snippet.thumbnails.medium?.url ||
            video.snippet.thumbnails.default?.url;

          const videoData = {
            competitor_id: competitor.id,
            youtube_video_id: video.id,
            title: video.snippet.title,
            thumbnail_url: thumbnailUrl,
            published_at: video.snippet.publishedAt,
            views: parseInt(video.statistics?.viewCount || '0'),
            likes: parseInt(video.statistics?.likeCount || '0'),
            comments: parseInt(video.statistics?.commentCount || '0'),
            duration_seconds: video.contentDetails?.duration 
              ? parseDuration(video.contentDetails.duration) 
              : null,
            last_updated_at: new Date().toISOString()
          };

          // Upsert video
          const { error: upsertError } = await supabase
            .from('competitor_videos')
            .upsert(videoData, {
              onConflict: 'competitor_id,youtube_video_id',
              ignoreDuplicates: false
            });

          if (upsertError) {
            console.error(`Failed to upsert video ${video.id}:`, upsertError);
            continue;
          }

          // Check if it was an insert or update
          const { data: existingVideo } = await supabase
            .from('competitor_videos')
            .select('first_seen_at')
            .eq('competitor_id', competitor.id)
            .eq('youtube_video_id', video.id)
            .single();

          if (existingVideo?.first_seen_at === videoData.last_updated_at) {
            videosAdded++;
          } else {
            videosUpdated++;
          }
        }

        syncResults.push({
          channelName: competitor.channel_name || competitor.channel_id,
          videosAdded,
          videosUpdated
        });

        console.log(`Synced ${competitor.channel_name}: +${videosAdded} videos, updated ${videosUpdated}`);

      } catch (err) {
        console.error(`Error syncing competitor ${competitor.channel_name}:`, err);
        syncResults.push({
          channelName: competitor.channel_name || competitor.channel_id,
          videosAdded: 0,
          videosUpdated: 0
        });
      }
    }

    const totalAdded = syncResults.reduce((sum, r) => sum + r.videosAdded, 0);
    const totalUpdated = syncResults.reduce((sum, r) => sum + r.videosUpdated, 0);

    console.log(`Sync complete: ${totalAdded} added, ${totalUpdated} updated`);

    return new Response(JSON.stringify({
      message: 'Sync complete',
      synced: totalAdded + totalUpdated,
      added: totalAdded,
      updated: totalUpdated,
      competitors: syncResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in sync-competitor-videos:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      synced: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
