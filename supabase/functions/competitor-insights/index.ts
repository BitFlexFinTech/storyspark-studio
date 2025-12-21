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

    // Fetch user's competitors
    const { data: competitors, error: competitorsError } = await supabaseClient
      .from("competitors")
      .select("*")
      .eq("user_id", user.id);

    if (competitorsError) {
      throw new Error("Failed to fetch competitors");
    }

    // Fetch user's videos for comparison
    const { data: userVideos, error: videosError } = await supabaseClient
      .from("videos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (videosError) {
      console.error("Failed to fetch user videos:", videosError);
    }

    // Prepare prompt for AI analysis
    const competitorSummary = competitors?.map((c) => ({
      name: c.channel_name,
      subscribers: c.subscriber_count,
      videos: c.video_count,
      avgViews: c.avg_views,
      lastVideo: c.last_video_date,
    })) || [];

    const userVideoSummary = userVideos?.map((v) => ({
      title: v.title,
      status: v.status,
    })) || [];

    const prompt = `You are a YouTube growth strategist analyzing a creator's channel against their competitors.

## Competitor Data:
${JSON.stringify(competitorSummary, null, 2)}

## User's Recent Videos:
${JSON.stringify(userVideoSummary, null, 2)}

Based on this data, provide a comprehensive analysis in the following JSON format:
{
  "contentGaps": [
    {
      "topic": "string - topic or content type the user should explore",
      "reason": "string - why this gap exists and why it's an opportunity",
      "priority": "high" | "medium" | "low",
      "estimatedImpact": "string - potential view/subscriber impact"
    }
  ],
  "strategyRecommendations": [
    {
      "title": "string - actionable recommendation",
      "description": "string - detailed explanation",
      "category": "content" | "seo" | "engagement" | "branding" | "schedule",
      "effort": "low" | "medium" | "high",
      "impact": "low" | "medium" | "high"
    }
  ],
  "competitorStrengths": [
    {
      "competitor": "string - channel name",
      "strength": "string - what they do well",
      "howToLearn": "string - actionable insight to apply"
    }
  ],
  "opportunityScore": {
    "score": number (0-100),
    "explanation": "string - what this score means"
  },
  "uploadFrequencyAdvice": {
    "currentAverage": "string - based on competitor data",
    "recommended": "string - suggested upload frequency",
    "reasoning": "string - why this frequency"
  }
}

Analyze the data and provide specific, actionable insights. If competitor data is limited, make reasonable assumptions and note them.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert YouTube growth strategist. Always respond with valid JSON only, no markdown formatting." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI request failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let insights = aiData.choices?.[0]?.message?.content;

    // Parse the JSON response (handle potential markdown code blocks)
    if (insights) {
      insights = insights.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      try {
        insights = JSON.parse(insights);
      } catch (e) {
        console.error("Failed to parse AI response:", e);
        insights = {
          contentGaps: [],
          strategyRecommendations: [],
          competitorStrengths: [],
          opportunityScore: { score: 50, explanation: "Unable to analyze" },
          uploadFrequencyAdvice: { currentAverage: "Unknown", recommended: "2-3 per week", reasoning: "Industry standard" },
        };
      }
    }

    console.log("Generated insights successfully");

    return new Response(JSON.stringify({ insights, competitors: competitorSummary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating insights:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
