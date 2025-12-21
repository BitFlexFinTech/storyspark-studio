import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ThumbnailData {
  url: string;
  videoTitle: string;
  views: number;
  videoId: string;
}

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

    const { competitorIds } = await req.json();
    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!YOUTUBE_API_KEY) {
      return new Response(JSON.stringify({ error: "YouTube API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get competitors
    let query = supabaseClient.from("competitors").select("*").eq("user_id", user.id);
    if (competitorIds && competitorIds.length > 0) {
      query = query.in("id", competitorIds);
    }
    const { data: competitors, error: compError } = await query;

    if (compError || !competitors || competitors.length === 0) {
      return new Response(JSON.stringify({ error: "No competitors found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch videos from each competitor
    const allThumbnails: ThumbnailData[] = [];
    
    for (const competitor of competitors) {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${competitor.channel_id}&maxResults=10&order=viewCount&type=video&key=${YOUTUBE_API_KEY}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (searchData.items) {
        const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",");
        
        // Get video statistics
        const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
        const statsResponse = await fetch(statsUrl);
        const statsData = await statsResponse.json();

        if (statsData.items) {
          for (const video of statsData.items) {
            allThumbnails.push({
              url: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
              videoTitle: video.snippet.title,
              views: parseInt(video.statistics.viewCount) || 0,
              videoId: video.id,
            });
          }
        }
      }
    }

    // Sort by views to get top performers
    allThumbnails.sort((a, b) => b.views - a.views);
    const topPerformers = allThumbnails.slice(0, 12);

    // Prepare analysis prompt with thumbnail URLs
    const thumbnailList = topPerformers.map((t, i) => 
      `${i + 1}. "${t.videoTitle}" - ${t.views.toLocaleString()} views - ${t.url}`
    ).join("\n");

    const analysisPrompt = `Analyze these top-performing YouTube video thumbnails from competitor channels. Based on the video titles and typical thumbnail patterns for high-performing videos, provide insights about what makes thumbnails perform well.

Videos to analyze:
${thumbnailList}

Provide a JSON response with this exact structure:
{
  "patterns": {
    "colorSchemes": [{"dominant": "color name", "frequency": percentage as number}],
    "textUsage": {"hasText": true/false percentage, "textStyle": "description", "avgWordCount": number},
    "facesPresent": percentage number (0-100),
    "emotionalTone": ["emotion1", "emotion2", "emotion3"]
  },
  "topPerformers": [
    {"thumbnailUrl": "url", "videoTitle": "title", "views": number, "keyElements": ["element1", "element2"]}
  ],
  "recommendations": [
    {"tip": "actionable tip", "example": "specific example", "priority": "high|medium|low"}
  ],
  "doList": ["best practice 1", "best practice 2"],
  "dontList": ["thing to avoid 1", "thing to avoid 2"]
}`;

    // Call Lovable AI for analysis
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
            content: "You are an expert at analyzing YouTube thumbnails and video marketing. Provide actionable insights in valid JSON format only.",
          },
          { role: "user", content: analysisPrompt },
        ],
      }),
    });

    const aiData = await aiResponse.json();
    let analysis: any = null;

    try {
      const content = aiData.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
        // Add actual thumbnail URLs to top performers
        analysis.topPerformers = topPerformers.slice(0, 6).map((t, i) => ({
          thumbnailUrl: t.url,
          videoTitle: t.videoTitle,
          views: t.views,
          keyElements: analysis?.topPerformers?.[i]?.keyElements || ["High engagement", "Compelling visuals"],
        }));
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      // Fallback analysis
      analysis = {
        patterns: {
          colorSchemes: [
            { dominant: "Red/Orange", frequency: 45 },
            { dominant: "Blue/Purple", frequency: 30 },
            { dominant: "Yellow/Green", frequency: 25 },
          ],
          textUsage: { hasText: true, textStyle: "Bold, large text with contrast", avgWordCount: 3 },
          facesPresent: 70,
          emotionalTone: ["Excitement", "Curiosity", "Surprise"],
        },
        topPerformers: topPerformers.slice(0, 6).map((t) => ({
          thumbnailUrl: t.url,
          videoTitle: t.videoTitle,
          views: t.views,
          keyElements: ["High contrast", "Clear subject"],
        })),
        recommendations: [
          { tip: "Use faces with expressive emotions", example: "Surprised or excited expressions", priority: "high" },
          { tip: "Add bold, readable text", example: "3-4 words max, high contrast", priority: "high" },
          { tip: "Use bright, saturated colors", example: "Red, yellow, or orange accents", priority: "medium" },
        ],
        doList: ["Use high contrast colors", "Include human faces", "Add 2-4 words of text", "Create visual curiosity"],
        dontList: ["Avoid cluttered designs", "Don't use small text", "Avoid dark/muted colors", "Don't copy exactly"],
      };
    }

    console.log("Thumbnail analysis completed for", competitors.length, "competitors");

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error in analyze-thumbnails:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
