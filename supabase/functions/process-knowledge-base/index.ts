import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { gpt_id, query, limit = 3 } = await req.json();

    // Extract JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Get the custom GPT and its knowledge base files
    const { data: gpt, error: gptError } = await supabaseClient
      .from('custom_gpts')
      .select('*, custom_gpt_files(*)')
      .eq('id', gpt_id)
      .single();

    if (gptError) {
      console.error('Error fetching GPT:', gptError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch GPT configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!gpt.custom_gpt_files || gpt.custom_gpt_files.length === 0) {
      return new Response(
        JSON.stringify({ 
          relevant_content: [],
          message: 'No knowledge base files available'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simple text search through processed content
    const relevantFiles = gpt.custom_gpt_files
      .filter((file: any) => file.processed_content && file.processed_content.length > 0)
      .map((file: any) => {
        const content = file.processed_content.toLowerCase();
        const queryLower = query.toLowerCase();
        
        // Simple keyword matching - can be enhanced with more sophisticated search
        const keywords = queryLower.split(' ').filter(word => word.length > 2);
        let relevanceScore = 0;
        
        keywords.forEach(keyword => {
          const matches = (content.match(new RegExp(keyword, 'g')) || []).length;
          relevanceScore += matches;
        });

        // Extract relevant excerpts
        const excerpts = [];
        keywords.forEach(keyword => {
          const regex = new RegExp(`.{0,100}${keyword}.{0,100}`, 'gi');
          const matches = content.match(regex);
          if (matches) {
            excerpts.push(...matches.slice(0, 2)); // Limit excerpts per keyword
          }
        });

        return {
          filename: file.filename,
          relevanceScore,
          excerpts: excerpts.slice(0, 3), // Limit total excerpts
          contentLength: file.processed_content.length
        };
      })
      .filter((file: any) => file.relevanceScore > 0)
      .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    return new Response(
      JSON.stringify({ 
        relevant_content: relevantFiles,
        total_files_searched: gpt.custom_gpt_files.length,
        query_processed: query
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-knowledge-base function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});