import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { channelInput } = await req.json();
    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");

    if (!YOUTUBE_API_KEY) {
      throw new Error("YouTube API key not configured");
    }

    // Extract channel ID from various input formats
    let channelId = channelInput.trim();
    
    // Handle different YouTube URL formats
    if (channelInput.includes("youtube.com")) {
      if (channelInput.includes("/channel/")) {
        channelId = channelInput.split("/channel/")[1].split(/[?/]/)[0];
      } else if (channelInput.includes("/@")) {
        // Handle handle-based URLs - need to resolve to channel ID
        const handle = channelInput.split("/@")[1].split(/[?/]/)[0];
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&key=${YOUTUBE_API_KEY}`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        
        if (searchData.items && searchData.items.length > 0) {
          channelId = searchData.items[0].snippet.channelId;
        } else {
          throw new Error("Could not find channel with that handle");
        }
      } else if (channelInput.includes("/c/") || channelInput.includes("/user/")) {
        // Legacy custom URL or username - search for it
        const customName = channelInput.split(/\/c\/|\/user\//)[1].split(/[?/]/)[0];
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(customName)}&key=${YOUTUBE_API_KEY}`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        
        if (searchData.items && searchData.items.length > 0) {
          channelId = searchData.items[0].snippet.channelId;
        } else {
          throw new Error("Could not find channel");
        }
      }
    }

    console.log(`Fetching channel data for: ${channelId}`);

    // Fetch channel details
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    const channelResponse = await fetch(channelUrl);
    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      // Try searching by channel ID as a handle
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelId)}&key=${YOUTUBE_API_KEY}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (searchData.items && searchData.items.length > 0) {
        channelId = searchData.items[0].snippet.channelId;
        // Re-fetch with proper channel ID
        const retryUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
        const retryResponse = await fetch(retryUrl);
        const retryData = await retryResponse.json();
        
        if (!retryData.items || retryData.items.length === 0) {
          throw new Error("Channel not found");
        }
        
        channelData.items = retryData.items;
      } else {
        throw new Error("Channel not found");
      }
    }

    const channel = channelData.items[0];
    const snippet = channel.snippet;
    const statistics = channel.statistics;

    // Fetch latest video to get last video date
    const videosUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=10&key=${YOUTUBE_API_KEY}`;
    const videosResponse = await fetch(videosUrl);
    const videosData = await videosResponse.json();

    let lastVideoDate = null;
    let avgViews = 0;

    if (videosData.items && videosData.items.length > 0) {
      lastVideoDate = videosData.items[0].snippet.publishedAt.split("T")[0];
      
      // Get video IDs to fetch view counts
      const videoIds = videosData.items.map((v: any) => v.id.videoId).join(",");
      const videoStatsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
      const videoStatsResponse = await fetch(videoStatsUrl);
      const videoStatsData = await videoStatsResponse.json();
      
      if (videoStatsData.items && videoStatsData.items.length > 0) {
        const totalViews = videoStatsData.items.reduce(
          (sum: number, v: any) => sum + parseInt(v.statistics.viewCount || "0", 10),
          0
        );
        avgViews = Math.round(totalViews / videoStatsData.items.length);
      }
    }

    const competitorData = {
      channel_id: channelId,
      channel_name: snippet.title,
      subscriber_count: parseInt(statistics.subscriberCount || "0", 10),
      video_count: parseInt(statistics.videoCount || "0", 10),
      avg_views: avgViews,
      last_video_date: lastVideoDate,
      user_id: user.id,
    };

    console.log("Fetched competitor data:", competitorData);

    return new Response(JSON.stringify(competitorData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching YouTube channel:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
