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
    // Use service role for cron job / background processing
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");

    if (!YOUTUBE_API_KEY) {
      console.error("YouTube API key not configured");
      return new Response(JSON.stringify({ error: "YouTube API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all active competitor alerts with competitor data
    const { data: alerts, error: alertsError } = await supabaseClient
      .from("competitor_alerts")
      .select(`
        *,
        competitors (*)
      `)
      .eq("is_active", true);

    if (alertsError) {
      console.error("Error fetching alerts:", alertsError);
      return new Response(JSON.stringify({ error: alertsError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!alerts || alerts.length === 0) {
      console.log("No active alerts found");
      return new Response(JSON.stringify({ message: "No active alerts to check" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const notificationsToCreate: any[] = [];
    const competitorsToUpdate: Map<string, any> = new Map();

    // Group alerts by competitor to minimize API calls
    const alertsByCompetitor = new Map<string, any[]>();
    for (const alert of alerts) {
      if (alert.competitors) {
        const channelId = alert.competitors.channel_id;
        if (!alertsByCompetitor.has(channelId)) {
          alertsByCompetitor.set(channelId, []);
        }
        alertsByCompetitor.get(channelId)!.push(alert);
      }
    }

    // Check each competitor
    for (const [channelId, competitorAlerts] of alertsByCompetitor) {
      const competitor = competitorAlerts[0].competitors;
      
      try {
        // Fetch current channel data
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
        const channelResponse = await fetch(channelUrl);
        const channelData = await channelResponse.json();

        if (!channelData.items || channelData.items.length === 0) continue;

        const currentStats = channelData.items[0].statistics;
        const currentSubscribers = parseInt(currentStats.subscriberCount) || 0;
        const currentVideoCount = parseInt(currentStats.videoCount) || 0;

        // Fetch latest video
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=1&order=date&type=video&key=${YOUTUBE_API_KEY}`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        const latestVideo = searchData.items?.[0];
        const latestVideoDate = latestVideo ? new Date(latestVideo.snippet.publishedAt) : null;

        // Process each alert for this competitor
        for (const alert of competitorAlerts) {
          const userId = alert.user_id;

          switch (alert.alert_type) {
            case "new_video":
              // Check if there's a new video since last check
              if (latestVideo && competitor.video_count && currentVideoCount > competitor.video_count) {
                notificationsToCreate.push({
                  user_id: userId,
                  alert_id: alert.id,
                  competitor_id: competitor.id,
                  title: "New Video Uploaded",
                  message: `${competitor.channel_name} uploaded: "${latestVideo.snippet.title}"`,
                  notification_type: "new_video",
                  data: {
                    videoId: latestVideo.id.videoId,
                    videoTitle: latestVideo.snippet.title,
                    thumbnailUrl: latestVideo.snippet.thumbnails?.high?.url,
                  },
                });
              }
              break;

            case "milestone_subscribers":
              // Check if crossed subscriber threshold
              if (alert.threshold && currentSubscribers >= alert.threshold && 
                  (!competitor.subscriber_count || competitor.subscriber_count < alert.threshold)) {
                notificationsToCreate.push({
                  user_id: userId,
                  alert_id: alert.id,
                  competitor_id: competitor.id,
                  title: "Subscriber Milestone Reached",
                  message: `${competitor.channel_name} reached ${alert.threshold.toLocaleString()} subscribers!`,
                  notification_type: "milestone",
                  data: {
                    milestone: alert.threshold,
                    currentCount: currentSubscribers,
                  },
                });
              }
              break;

            case "milestone_views":
              // Fetch video stats to check for trending
              if (latestVideo && alert.threshold) {
                const videoStatsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${latestVideo.id.videoId}&key=${YOUTUBE_API_KEY}`;
                const videoStatsResponse = await fetch(videoStatsUrl);
                const videoStatsData = await videoStatsResponse.json();
                
                const videoViews = parseInt(videoStatsData.items?.[0]?.statistics?.viewCount) || 0;
                if (videoViews >= alert.threshold) {
                  notificationsToCreate.push({
                    user_id: userId,
                    alert_id: alert.id,
                    competitor_id: competitor.id,
                    title: "Video Views Milestone",
                    message: `"${latestVideo.snippet.title}" hit ${alert.threshold.toLocaleString()} views!`,
                    notification_type: "trending",
                    data: {
                      videoId: latestVideo.id.videoId,
                      views: videoViews,
                    },
                  });
                }
              }
              break;

            case "trending_video":
              // Check if any recent video is trending (>100k views in short time)
              if (latestVideo && latestVideoDate) {
                const hoursSinceUpload = (Date.now() - latestVideoDate.getTime()) / (1000 * 60 * 60);
                if (hoursSinceUpload <= 48) { // Within 48 hours
                  const videoStatsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${latestVideo.id.videoId}&key=${YOUTUBE_API_KEY}`;
                  const videoStatsResponse = await fetch(videoStatsUrl);
                  const videoStatsData = await videoStatsResponse.json();
                  
                  const videoViews = parseInt(videoStatsData.items?.[0]?.statistics?.viewCount) || 0;
                  const trendingThreshold = alert.threshold || 100000;
                  
                  if (videoViews >= trendingThreshold) {
                    notificationsToCreate.push({
                      user_id: userId,
                      alert_id: alert.id,
                      competitor_id: competitor.id,
                      title: "Trending Video Alert",
                      message: `${competitor.channel_name}'s video is trending with ${videoViews.toLocaleString()} views!`,
                      notification_type: "trending",
                      data: {
                        videoId: latestVideo.id.videoId,
                        videoTitle: latestVideo.snippet.title,
                        views: videoViews,
                        hoursSinceUpload: Math.round(hoursSinceUpload),
                      },
                    });
                  }
                }
              }
              break;
          }
        }

        // Store updated competitor data
        competitorsToUpdate.set(competitor.id, {
          subscriber_count: currentSubscribers,
          video_count: currentVideoCount,
          last_video_date: latestVideoDate?.toISOString().split("T")[0],
        });

      } catch (error) {
        console.error(`Error checking competitor ${channelId}:`, error);
      }
    }

    // Insert notifications
    if (notificationsToCreate.length > 0) {
      const { error: insertError } = await supabaseClient
        .from("notifications")
        .insert(notificationsToCreate);

      if (insertError) {
        console.error("Error inserting notifications:", insertError);
      } else {
        console.log(`Created ${notificationsToCreate.length} notifications`);
      }
    }

    // Update competitor data
    for (const [competitorId, updateData] of competitorsToUpdate) {
      const { error: updateError } = await supabaseClient
        .from("competitors")
        .update(updateData)
        .eq("id", competitorId);

      if (updateError) {
        console.error(`Error updating competitor ${competitorId}:`, updateError);
      }
    }

    console.log(`Checked ${alertsByCompetitor.size} competitors, created ${notificationsToCreate.length} notifications`);

    return new Response(
      JSON.stringify({
        checked: alertsByCompetitor.size,
        notifications: notificationsToCreate.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error in check-competitor-updates:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
