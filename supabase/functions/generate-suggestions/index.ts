import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { type, videoId, currentValue, context } = await req.json();

    if (!type || !videoId) {
      throw new Error('Type and videoId are required');
    }

    console.log(`Generating ${type} suggestions for video ${videoId}`);

    let suggestions: string[] = [];
    let prompt = '';

    if (type === 'title') {
      prompt = `You are a YouTube title optimization expert. Generate 5 alternative video titles based on the current title and context.

Current title: "${currentValue}"
${context ? `Additional context: ${context}` : ''}

Requirements:
- More engaging and click-worthy
- Under 60 characters each
- Include emotional triggers or curiosity gaps
- Optimized for search and discovery
- Maintain the core topic/message

Return ONLY a JSON array of 5 title strings, no other text or explanation.`;
    } else if (type === 'thumbnail') {
      prompt = `You are a YouTube thumbnail design expert. Generate 3 detailed thumbnail concepts for a video.

Video title: "${currentValue}"
${context ? `Additional context: ${context}` : ''}

Requirements:
- Eye-catching and high-contrast designs
- Clear visual hierarchy
- Include expressive faces or compelling imagery suggestions
- Minimal text overlay (2-4 words max)
- Describe colors, composition, and mood

Return ONLY a JSON array of 3 detailed concept descriptions, no other text.`;
    } else if (type === 'description') {
      prompt = `You are a YouTube SEO expert. Generate 3 optimized video descriptions.

Video title: "${currentValue}"
${context ? `Current description: ${context}` : ''}

Requirements:
- First 150 characters should be compelling and include main keyword
- Include relevant hashtags (3-5)
- Add call-to-action for likes/subscribe
- Structure with line breaks for readability
- 300-500 words each

Return ONLY a JSON array of 3 description strings, no other text.`;
    } else if (type === 'tags') {
      prompt = `You are a YouTube SEO expert. Generate optimal video tags.

Video title: "${currentValue}"
${context ? `Description: ${context}` : ''}

Requirements:
- 15-20 relevant tags
- Mix of broad and specific keywords
- Include variations and related terms
- Prioritize searchable terms

Return ONLY a JSON array of tag strings, no other text.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error('Failed to generate suggestions');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    
    // Parse JSON array from response
    const match = content.match(/\[[\s\S]*\]/);
    if (match) {
      suggestions = JSON.parse(match[0]);
    }

    console.log(`Generated ${suggestions.length} ${type} suggestions`);

    return new Response(JSON.stringify({ 
      success: true,
      type,
      suggestions 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Generate suggestions error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
