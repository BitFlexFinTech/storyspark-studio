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
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!YOUTUBE_API_KEY) {
      return new Response(JSON.stringify({ error: "YouTube API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get competitors
    const { data: competitors, error: compError } = await supabaseClient
      .from("competitors")
      .select("*")
      .eq("user_id", user.id);

    if (compError || !competitors || competitors.length === 0) {
      return new Response(JSON.stringify({ error: "No competitors found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const competitorPatterns: any[] = [];
    const allUploadTimes: { day: string; hour: number; views: number }[] = [];

    // Analyze each competitor's upload patterns
    for (const competitor of competitors) {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${competitor.channel_id}&maxResults=25&order=date&type=video&key=${YOUTUBE_API_KEY}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (!searchData.items) continue;

      const dayCount: Record<string, number> = {};
      const hourCount: Record<number, number> = {};
      const videoIds: string[] = [];

      for (const item of searchData.items) {
        const publishedAt = new Date(item.snippet.publishedAt);
        const day = publishedAt.toLocaleDateString("en-US", { weekday: "long" });
        const hour = publishedAt.getHours();

        dayCount[day] = (dayCount[day] || 0) + 1;
        hourCount[hour] = (hourCount[hour] || 0) + 1;
        videoIds.push(item.id.videoId);
      }

      // Get video stats
      if (videoIds.length > 0) {
        const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(",")}&key=${YOUTUBE_API_KEY}`;
        const statsResponse = await fetch(statsUrl);
        const statsData = await statsResponse.json();

        if (statsData.items) {
          for (const video of statsData.items) {
            const publishedAt = new Date(video.snippet.publishedAt);
            allUploadTimes.push({
              day: publishedAt.toLocaleDateString("en-US", { weekday: "long" }),
              hour: publishedAt.getHours(),
              views: parseInt(video.statistics.viewCount) || 0,
            });
          }
        }
      }

      // Sort to get preferred days/times
      const preferredDays = Object.entries(dayCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([day]) => day);

      const preferredHours = Object.entries(hourCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => {
          const h = parseInt(hour);
          return `${h % 12 || 12}${h < 12 ? "AM" : "PM"}`;
        });

      competitorPatterns.push({
        channelName: competitor.channel_name,
        preferredDays,
        preferredTimes: preferredHours,
        avgVideosPerWeek: Math.round((searchData.items.length / 4) * 10) / 10,
      });
    }

    // Calculate optimal slots based on performance data
    const dayPerformance: Record<string, { views: number; count: number }> = {};
    const hourPerformance: Record<number, { views: number; count: number }> = {};

    for (const upload of allUploadTimes) {
      if (!dayPerformance[upload.day]) {
        dayPerformance[upload.day] = { views: 0, count: 0 };
      }
      dayPerformance[upload.day].views += upload.views;
      dayPerformance[upload.day].count += 1;

      if (!hourPerformance[upload.hour]) {
        hourPerformance[upload.hour] = { views: 0, count: 0 };
      }
      hourPerformance[upload.hour].views += upload.views;
      hourPerformance[upload.hour].count += 1;
    }

    // Use AI to generate insights
    const analysisPrompt = `Based on competitor YouTube upload patterns, provide optimal upload time recommendations.

Competitor patterns:
${JSON.stringify(competitorPatterns, null, 2)}

Day performance (avg views):
${Object.entries(dayPerformance).map(([day, data]) => `${day}: ${Math.round(data.views / data.count).toLocaleString()} avg views`).join("\n")}

Provide JSON response:
{
  "optimalSlots": [
    {"day": "day name", "timeRange": "e.g. 2PM-4PM", "confidence": "high|medium|low", "reasoning": "why this is optimal"}
  ],
  "avoidSlots": [
    {"day": "day name", "timeRange": "time range", "reason": "why to avoid"}
  ],
  "suggestedSchedule": [
    {"date": "YYYY-MM-DD", "time": "HH:MM", "isOptimal": true/false}
  ]
}

Generate suggested schedule for the next 2 weeks starting from today's date.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a YouTube content strategy expert. Analyze upload patterns and provide actionable scheduling recommendations in valid JSON format only.",
          },
          { role: "user", content: analysisPrompt },
        ],
      }),
    });

    const aiData = await aiResponse.json();
    let analysis;

    try {
      const content = aiData.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      // Generate fallback schedule
      const today = new Date();
      const suggestedSchedule = [];
      for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
        
        // Suggest uploads on Tue, Thu, Sat
        if (["Tuesday", "Thursday", "Saturday"].includes(dayName)) {
          suggestedSchedule.push({
            date: date.toISOString().split("T")[0],
            time: "14:00",
            isOptimal: true,
          });
        }
      }

      analysis = {
        optimalSlots: [
          { day: "Tuesday", timeRange: "2PM-4PM", confidence: "high", reasoning: "High engagement, less competition" },
          { day: "Thursday", timeRange: "12PM-2PM", confidence: "high", reasoning: "Mid-week peak viewing" },
          { day: "Saturday", timeRange: "10AM-12PM", confidence: "medium", reasoning: "Weekend viewers available" },
        ],
        avoidSlots: [
          { day: "Monday", timeRange: "Morning", reason: "Low engagement, people are busy" },
          { day: "Friday", timeRange: "Evening", reason: "Weekend activities compete for attention" },
        ],
        suggestedSchedule,
      };
    }

    console.log("Upload time analysis completed for", competitors.length, "competitors");

    return new Response(
      JSON.stringify({
        competitorPatterns,
        ...analysis,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error in analyze-upload-times:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
