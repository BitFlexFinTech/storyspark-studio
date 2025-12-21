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

    const { currentTitle, videoId, niche } = await req.json();
    console.log("Optimizing title:", { currentTitle, videoId, niche });

    // Fetch competitor videos for inspiration
    const { data: competitors } = await supabaseClient
      .from("competitors")
      .select("id, channel_name")
      .eq("user_id", user.id)
      .limit(5);

    let competitorTitles: string[] = [];
    if (competitors && competitors.length > 0) {
      const { data: videos } = await supabaseClient
        .from("competitor_videos")
        .select("title, views")
        .in("competitor_id", competitors.map(c => c.id))
        .order("views", { ascending: false })
        .limit(10);
      
      competitorTitles = videos?.map(v => v.title) || [];
    }

    // Fetch user's saved keywords
    const { data: keywords } = await supabaseClient
      .from("keywords")
      .select("keyword, search_volume")
      .eq("user_id", user.id)
      .order("search_volume", { ascending: false })
      .limit(10);

    const keywordList = keywords?.map(k => k.keyword) || [];

    // Call Lovable AI for title optimization
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const prompt = `You are a YouTube title optimization expert. Analyze the current title and generate 5 optimized alternatives.

Current Title: "${currentTitle}"
${niche ? `Niche: ${niche}` : ""}

Top Performing Competitor Titles (for inspiration):
${competitorTitles.slice(0, 5).map((t, i) => `${i + 1}. ${t}`).join("\n")}

User's Saved Keywords to consider:
${keywordList.slice(0, 5).join(", ")}

Generate 5 optimized title variations. For each:
1. Apply proven YouTube title formulas (curiosity gaps, power words, numbers, emotional triggers)
2. Include relevant keywords naturally
3. Keep under 60 characters
4. Predict CTR improvement potential

Respond with a JSON object in this format:
{
  "originalAnalysis": {
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "estimatedCTR": 3.5
  },
  "suggestions": [
    {
      "title": "Optimized title here",
      "reasoning": "Why this title works",
      "formula": "Formula used (e.g., 'Curiosity Gap + Number')",
      "estimatedCTR": 5.2,
      "keywordsUsed": ["keyword1", "keyword2"]
    }
  ]
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
          { role: "system", content: "You are a YouTube SEO expert. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (e) {
      console.error("JSON parse error:", e, content);
      // Fallback response
      analysis = {
        originalAnalysis: {
          strengths: ["Clear topic indication"],
          weaknesses: ["Could use more emotional hooks"],
          estimatedCTR: 3.0,
        },
        suggestions: [
          {
            title: `${currentTitle} (You Won't Believe #3!)`,
            reasoning: "Added curiosity hook",
            formula: "Original + Curiosity Gap",
            estimatedCTR: 4.5,
            keywordsUsed: [],
          },
          {
            title: `The Truth About ${currentTitle.split(" ").slice(0, 3).join(" ")}`,
            reasoning: "Authority positioning",
            formula: "Authority + Topic",
            estimatedCTR: 4.2,
            keywordsUsed: [],
          },
          {
            title: `I Tried ${currentTitle.split(" ").slice(0, 3).join(" ")} for 30 Days`,
            reasoning: "Personal challenge format",
            formula: "Personal Experience + Timeframe",
            estimatedCTR: 5.0,
            keywordsUsed: [],
          },
        ],
      };
    }

    return new Response(
      JSON.stringify({
        ...analysis,
        competitorTitles: competitorTitles.slice(0, 5),
        availableKeywords: keywordList,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in optimize-title:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
