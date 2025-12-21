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
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Analyzing Shorts for user:", user.id);

    // Fetch user's videos (filter shorts by duration <= 60 seconds)
    const { data: userVideos } = await supabaseClient
      .from("videos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Filter to shorts (assuming duration format is "M:SS" or seconds)
    const userShorts = (userVideos || []).filter(v => {
      if (!v.duration) return false;
      const duration = parseDuration(v.duration);
      return duration <= 60;
    });

    // Fetch competitor videos (shorts)
    const { data: competitors } = await supabaseClient
      .from("competitors")
      .select("id, channel_name")
      .eq("user_id", user.id);

    let competitorShorts: any[] = [];
    if (competitors && competitors.length > 0) {
      const { data: videos } = await supabaseClient
        .from("competitor_videos")
        .select("*, competitors(channel_name)")
        .in("competitor_id", competitors.map(c => c.id))
        .lte("duration_seconds", 60)
        .order("views", { ascending: false })
        .limit(50);

      competitorShorts = videos || [];
    }

    // Calculate metrics
    const userShortsMetrics = calculateMetrics(userShorts);
    const competitorShortsMetrics = calculateMetrics(competitorShorts);

    // Get top performing competitor shorts
    const topCompetitorShorts = competitorShorts
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10)
      .map(v => ({
        title: v.title,
        thumbnail_url: v.thumbnail_url,
        views: v.views,
        likes: v.likes,
        channel_name: v.competitors?.channel_name || "Unknown",
        duration_seconds: v.duration_seconds,
        published_at: v.published_at,
        engagement_rate: v.views > 0 ? ((v.likes || 0) / v.views * 100).toFixed(2) : 0,
      }));

    // Generate AI insights
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let aiInsights = {
      trends: ["Consistent posting schedule", "Eye-catching first frame", "Clear hook in first 3 seconds"],
      recommendations: ["Post during peak hours (6-9 PM)", "Use trending audio", "Add text overlays"],
      topFormats: ["Tutorial snippets", "Behind-the-scenes", "Quick tips"],
    };

    if (LOVABLE_API_KEY && topCompetitorShorts.length > 0) {
      try {
        const prompt = `Analyze these top-performing YouTube Shorts titles and provide insights:

${topCompetitorShorts.slice(0, 5).map(s => `- "${s.title}" (${s.views?.toLocaleString()} views)`).join("\n")}

Provide insights in JSON format:
{
  "trends": ["trend1", "trend2", "trend3"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "topFormats": ["format1", "format2", "format3"],
  "hookPatterns": ["hook1", "hook2", "hook3"]
}`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "Analyze YouTube Shorts. Respond with JSON only." },
              { role: "user", content: prompt },
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || "";
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            aiInsights = { ...aiInsights, ...JSON.parse(jsonMatch[0]) };
          }
        }
      } catch (e) {
        console.error("AI analysis error:", e);
      }
    }

    return new Response(
      JSON.stringify({
        userShorts: {
          count: userShorts.length,
          metrics: userShortsMetrics,
          videos: userShorts.slice(0, 10).map(v => ({
            id: v.id,
            title: v.title,
            thumbnail_url: v.thumbnail_url,
            duration: v.duration,
            status: v.status,
            created_at: v.created_at,
          })),
        },
        competitorShorts: {
          count: competitorShorts.length,
          metrics: competitorShortsMetrics,
          topPerformers: topCompetitorShorts,
        },
        comparison: {
          userAvgViews: userShortsMetrics.avgViews,
          competitorAvgViews: competitorShortsMetrics.avgViews,
          viewsGap: competitorShortsMetrics.avgViews - userShortsMetrics.avgViews,
          userAvgEngagement: userShortsMetrics.avgEngagement,
          competitorAvgEngagement: competitorShortsMetrics.avgEngagement,
        },
        insights: aiInsights,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in analyze-shorts:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function parseDuration(duration: string): number {
  if (!duration) return 0;
  
  // Handle "M:SS" format
  if (duration.includes(":")) {
    const parts = duration.split(":");
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    if (parts.length === 3) {
      return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    }
  }
  
  // Handle numeric seconds
  const num = parseInt(duration);
  return isNaN(num) ? 0 : num;
}

function calculateMetrics(videos: any[]) {
  if (videos.length === 0) {
    return {
      avgViews: 0,
      avgLikes: 0,
      avgEngagement: 0,
      totalViews: 0,
      totalLikes: 0,
    };
  }

  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
  const totalLikes = videos.reduce((sum, v) => sum + (v.likes || 0), 0);
  const avgViews = Math.round(totalViews / videos.length);
  const avgLikes = Math.round(totalLikes / videos.length);
  const avgEngagement = totalViews > 0 ? (totalLikes / totalViews * 100) : 0;

  return {
    avgViews,
    avgLikes,
    avgEngagement: parseFloat(avgEngagement.toFixed(2)),
    totalViews,
    totalLikes,
  };
}
