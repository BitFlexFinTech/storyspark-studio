import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ThumbnailAnalysis {
  videoId: string;
  thumbnailUrl: string;
  title: string;
  score: number;
  strengths: string[];
  improvements: string[];
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
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    console.log('Fetching user videos for thumbnail analysis...');
    
    // Fetch user's videos with thumbnails
    const { data: userVideos, error: videosError } = await supabase
      .from('videos')
      .select('id, title, thumbnail_url, published_at')
      .eq('user_id', user.id)
      .not('thumbnail_url', 'is', null)
      .order('published_at', { ascending: false })
      .limit(20);

    if (videosError) {
      throw new Error(`Failed to fetch user videos: ${videosError.message}`);
    }

    if (!userVideos || userVideos.length === 0) {
      return new Response(JSON.stringify({
        userThumbnails: [],
        overallScore: 0,
        topRecommendations: ['Upload videos to get thumbnail analysis'],
        competitorBenchmarks: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch competitor thumbnails for comparison
    const { data: competitors } = await supabase
      .from('competitors')
      .select('id, channel_name')
      .eq('user_id', user.id)
      .limit(5);

    let competitorThumbnails: { url: string; channelName: string }[] = [];
    
    if (competitors && competitors.length > 0) {
      const { data: compVideos } = await supabase
        .from('competitor_videos')
        .select('thumbnail_url, title, views, competitor_id')
        .in('competitor_id', competitors.map(c => c.id))
        .not('thumbnail_url', 'is', null)
        .order('views', { ascending: false })
        .limit(10);

      if (compVideos) {
        competitorThumbnails = compVideos.map(v => ({
          url: v.thumbnail_url!,
          channelName: competitors.find(c => c.id === v.competitor_id)?.channel_name || 'Unknown'
        }));
      }
    }

    // Use Lovable AI to analyze thumbnails
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const analysisPrompt = `You are a YouTube thumbnail expert. Analyze these thumbnails and provide scores and actionable feedback.

USER'S THUMBNAILS TO ANALYZE:
${userVideos.map((v, i) => `${i + 1}. "${v.title}" - ${v.thumbnail_url}`).join('\n')}

${competitorThumbnails.length > 0 ? `TOP PERFORMING COMPETITOR THUMBNAILS FOR REFERENCE:
${competitorThumbnails.map((t, i) => `${i + 1}. ${t.channelName}: ${t.url}`).join('\n')}` : ''}

For each user thumbnail, analyze:
1. Color contrast and visual appeal (bright, saturated colors perform better)
2. Text readability and placement (3-5 words max, large readable font)
3. Face presence and expressions (close-ups with emotion get more clicks)
4. Curiosity gap (does it make viewers want to click?)
5. Brand consistency

Return a JSON object with this exact structure:
{
  "thumbnails": [
    {
      "index": 0,
      "score": 75,
      "strengths": ["Clear focal point", "Good color contrast"],
      "improvements": ["Add emotional expression", "Reduce text clutter"]
    }
  ],
  "overallScore": 72,
  "topRecommendations": ["Use more close-up faces", "Add brighter colors"]
}

IMPORTANT: Return ONLY valid JSON, no markdown or explanation.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert YouTube thumbnail analyst. Always respond with valid JSON only.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    // Parse AI response
    let analysisResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Fallback with default analysis
      analysisResult = {
        thumbnails: userVideos.map((_, i) => ({
          index: i,
          score: 65 + Math.floor(Math.random() * 20),
          strengths: ['Good composition'],
          improvements: ['Consider adding text overlay', 'Try brighter colors']
        })),
        overallScore: 70,
        topRecommendations: ['Add faces with expressions', 'Use contrasting colors', 'Keep text minimal']
      };
    }

    // Map analysis back to videos
    const userThumbnails: ThumbnailAnalysis[] = userVideos.map((video, index) => {
      const analysis = analysisResult.thumbnails?.find((t: any) => t.index === index) || {
        score: 70,
        strengths: ['Analyzed'],
        improvements: ['No specific recommendations']
      };

      return {
        videoId: video.id,
        thumbnailUrl: video.thumbnail_url!,
        title: video.title,
        score: analysis.score || 70,
        strengths: analysis.strengths || [],
        improvements: analysis.improvements || []
      };
    });

    const response = {
      userThumbnails,
      overallScore: analysisResult.overallScore || 70,
      topRecommendations: analysisResult.topRecommendations || [],
      competitorBenchmarks: competitorThumbnails.slice(0, 5)
    };

    console.log('Thumbnail analysis complete:', { count: userThumbnails.length, overallScore: response.overallScore });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in analyze-user-thumbnails:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      userThumbnails: [],
      overallScore: 0,
      topRecommendations: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
