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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, userId } = await req.json();

    console.log(`Optimization bot started: action=${action}, userId=${userId || 'all'}`);

    // Get users with enabled optimization settings
    let query = supabaseAdmin
      .from('optimization_bot_settings')
      .select('*')
      .eq('is_enabled', true);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: settings, error: settingsError } = await query;

    if (settingsError) {
      console.error('Failed to fetch settings:', settingsError);
      throw new Error('Failed to fetch optimization settings');
    }

    if (!settings || settings.length === 0) {
      console.log('No users with enabled optimization bot');
      return new Response(JSON.stringify({ 
        message: 'No users with enabled optimization bot',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = [];

    for (const userSettings of settings) {
      try {
        console.log(`Processing user: ${userSettings.user_id}`);

        // Get user's YouTube channels
        const { data: channels, error: channelsError } = await supabaseAdmin
          .from('youtube_channels')
          .select('*')
          .eq('user_id', userSettings.user_id)
          .eq('is_active', true);

        if (channelsError || !channels || channels.length === 0) {
          console.log(`No active channels for user ${userSettings.user_id}`);
          continue;
        }

        // Get user's videos
        const { data: videos, error: videosError } = await supabaseAdmin
          .from('videos')
          .select('*')
          .eq('user_id', userSettings.user_id)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(20);

        if (videosError || !videos || videos.length === 0) {
          console.log(`No published videos for user ${userSettings.user_id}`);
          continue;
        }

        // Analyze each video and generate suggestions
        for (const video of videos) {
          // Check if already in queue
          const { data: existingQueue } = await supabaseAdmin
            .from('optimization_queue')
            .select('id')
            .eq('video_id', video.id)
            .eq('status', 'pending')
            .single();

          if (existingQueue) {
            console.log(`Video ${video.id} already in queue`);
            continue;
          }

          // Generate AI suggestions for titles
          if (userSettings.optimization_types?.includes('title')) {
            const titleSuggestions = await generateTitleSuggestions(video.title);
            
            if (titleSuggestions.length > 0) {
              await supabaseAdmin.from('optimization_queue').insert({
                user_id: userSettings.user_id,
                video_id: video.id,
                optimization_type: 'title',
                current_value: video.title,
                suggested_values: titleSuggestions,
                status: 'pending',
                performance_data: { 
                  analyzed_at: new Date().toISOString(),
                  reason: 'Daily optimization scan'
                }
              });
            }
          }

          // Generate AI suggestions for thumbnails
          if (userSettings.optimization_types?.includes('thumbnail')) {
            const thumbnailSuggestions = await generateThumbnailConcepts(video.title);
            
            if (thumbnailSuggestions.length > 0) {
              await supabaseAdmin.from('optimization_queue').insert({
                user_id: userSettings.user_id,
                video_id: video.id,
                optimization_type: 'thumbnail',
                current_value: video.thumbnail_url,
                suggested_values: thumbnailSuggestions,
                status: 'pending',
                performance_data: { 
                  analyzed_at: new Date().toISOString(),
                  reason: 'Daily optimization scan'
                }
              });
            }
          }

          results.push({
            user_id: userSettings.user_id,
            video_id: video.id,
            video_title: video.title
          });
        }
      } catch (userError) {
        console.error(`Error processing user ${userSettings.user_id}:`, userError);
      }
    }

    console.log(`Optimization bot completed. Processed ${results.length} videos.`);

    return new Response(JSON.stringify({ 
      success: true,
      processed: results.length,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Optimization bot error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateTitleSuggestions(currentTitle: string): Promise<string[]> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a YouTube title optimization expert. Generate 5 alternative video titles that are:
- More engaging and click-worthy
- Under 60 characters
- Include emotional triggers or curiosity gaps
- Optimized for search and discovery
Return ONLY a JSON array of 5 title strings, no other text.`
          },
          {
            role: 'user',
            content: `Current title: "${currentTitle}"\n\nGenerate 5 optimized alternatives.`
          }
        ],
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    
    // Parse JSON array from response
    const match = content.match(/\[[\s\S]*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
    return [];
  } catch (error) {
    console.error('Error generating title suggestions:', error);
    return [];
  }
}

async function generateThumbnailConcepts(videoTitle: string): Promise<string[]> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a YouTube thumbnail design expert. Generate 3 thumbnail concepts that are:
- Eye-catching and high-contrast
- Include clear visual hierarchy
- Feature expressive faces or compelling imagery
- Use minimal text (2-4 words max)
Return ONLY a JSON array of 3 concept descriptions, no other text.`
          },
          {
            role: 'user',
            content: `Video title: "${videoTitle}"\n\nGenerate 3 thumbnail concepts.`
          }
        ],
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    
    const match = content.match(/\[[\s\S]*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
    return [];
  } catch (error) {
    console.error('Error generating thumbnail concepts:', error);
    return [];
  }
}
