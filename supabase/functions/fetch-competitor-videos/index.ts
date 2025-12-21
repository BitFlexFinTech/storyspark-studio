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

    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
    if (!YOUTUBE_API_KEY) {
      throw new Error("YouTube API key not configured");
    }

    // Fetch user's competitors
    const { data: competitors, error: competitorsError } = await supabaseClient
      .from("competitors")
      .select("*")
      .eq("user_id", user.id);

    if (competitorsError) {
      throw new Error("Failed to fetch competitors");
    }

    // Fetch user's video analytics for comparison
    const { data: userAnalytics, error: analyticsError } = await supabaseClient
      .from("video_analytics")
      .select("*, videos!inner(user_id, title)")
      .order("date", { ascending: false })
      .limit(100);

    // Filter to only user's analytics
    const userVideoAnalytics = userAnalytics?.filter(
      (a: any) => a.videos?.user_id === user.id
    ) || [];

    // Calculate user's average metrics
    let userAvgViews = 0;
    let userAvgWatchTime = 0;
    let userAvgEngagement = 0;

    if (userVideoAnalytics.length > 0) {
      userAvgViews = Math.round(
        userVideoAnalytics.reduce((sum, a: any) => sum + (a.views || 0), 0) / userVideoAnalytics.length
      );
      userAvgWatchTime = parseFloat(
        (userVideoAnalytics.reduce((sum, a: any) => sum + (a.watch_time_hours || 0), 0) / userVideoAnalytics.length).toFixed(2)
      );
      const totalEngagement = userVideoAnalytics.reduce((sum, a: any) => {
        const views = a.views || 1;
        const likes = a.likes || 0;
        const comments = a.comments || 0;
        return sum + ((likes + comments) / views) * 100;
      }, 0);
      userAvgEngagement = parseFloat((totalEngagement / userVideoAnalytics.length).toFixed(2));
    }

    // Fetch video performance for each competitor
    const competitorPerformance = [];

    for (const competitor of competitors || []) {
      try {
        // Fetch recent videos
        const videosUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${competitor.channel_id}&type=video&order=date&maxResults=10&key=${YOUTUBE_API_KEY}`;
        const videosResponse = await fetch(videosUrl);
        const videosData = await videosResponse.json();

        if (videosData.items && videosData.items.length > 0) {
          const videoIds = videosData.items.map((v: any) => v.id.videoId).join(",");
          
          // Fetch video statistics
          const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
          const statsResponse = await fetch(statsUrl);
          const statsData = await statsResponse.json();

          if (statsData.items) {
            const videos = statsData.items.map((v: any, index: number) => {
              const duration = v.contentDetails?.duration || "PT0M";
              // Parse ISO 8601 duration
              const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
              const hours = parseInt(match?.[1] || "0", 10);
              const minutes = parseInt(match?.[2] || "0", 10);
              const seconds = parseInt(match?.[3] || "0", 10);
              const durationMinutes = hours * 60 + minutes + seconds / 60;

              return {
                videoId: v.id,
                title: videosData.items[index]?.snippet?.title || "Unknown",
                publishedAt: videosData.items[index]?.snippet?.publishedAt,
                views: parseInt(v.statistics?.viewCount || "0", 10),
                likes: parseInt(v.statistics?.likeCount || "0", 10),
                comments: parseInt(v.statistics?.commentCount || "0", 10),
                durationMinutes: parseFloat(durationMinutes.toFixed(1)),
              };
            });

            const avgViews = Math.round(
              videos.reduce((sum: number, v: any) => sum + v.views, 0) / videos.length
            );
            const avgLikes = Math.round(
              videos.reduce((sum: number, v: any) => sum + v.likes, 0) / videos.length
            );
            const avgEngagement = parseFloat(
              (videos.reduce((sum: number, v: any) => {
                const views = v.views || 1;
                return sum + ((v.likes + v.comments) / views) * 100;
              }, 0) / videos.length).toFixed(2)
            );
            const avgDuration = parseFloat(
              (videos.reduce((sum: number, v: any) => sum + v.durationMinutes, 0) / videos.length).toFixed(1)
            );

            competitorPerformance.push({
              channelId: competitor.channel_id,
              channelName: competitor.channel_name,
              subscriberCount: competitor.subscriber_count,
              videos,
              metrics: {
                avgViews,
                avgLikes,
                avgEngagement,
                avgDuration,
                videoCount: videos.length,
              },
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching videos for ${competitor.channel_name}:`, error);
      }
    }

    // Calculate overall competitor averages
    let competitorAvgViews = 0;
    let competitorAvgEngagement = 0;
    let topCompetitor = null;

    if (competitorPerformance.length > 0) {
      competitorAvgViews = Math.round(
        competitorPerformance.reduce((sum, c) => sum + c.metrics.avgViews, 0) / competitorPerformance.length
      );
      competitorAvgEngagement = parseFloat(
        (competitorPerformance.reduce((sum, c) => sum + c.metrics.avgEngagement, 0) / competitorPerformance.length).toFixed(2)
      );
      
      // Find top performer
      topCompetitor = competitorPerformance.reduce((top, c) => 
        c.metrics.avgViews > (top?.metrics.avgViews || 0) ? c : top
      , competitorPerformance[0]);
    }

    const comparisonData = {
      userMetrics: {
        avgViews: userAvgViews,
        avgWatchTimeHours: userAvgWatchTime,
        avgEngagement: userAvgEngagement,
        videoCount: userVideoAnalytics.length,
      },
      competitorAvg: {
        avgViews: competitorAvgViews,
        avgEngagement: competitorAvgEngagement,
      },
      topCompetitor: topCompetitor ? {
        name: topCompetitor.channelName,
        avgViews: topCompetitor.metrics.avgViews,
        avgEngagement: topCompetitor.metrics.avgEngagement,
      } : null,
      competitors: competitorPerformance,
    };

    console.log("Fetched competitor videos successfully");

    return new Response(JSON.stringify(comparisonData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching competitor videos:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
