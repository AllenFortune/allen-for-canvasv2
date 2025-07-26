import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { gpt_id, message, conversation_history = [] } = await req.json();

    // Extract JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');

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

    // Get the custom GPT configuration
    const { data: gpt, error: gptError } = await supabaseClient
      .from('custom_gpts')
      .select('*')
      .eq('id', gpt_id)
      .single();

    if (gptError) {
      console.error('Error fetching GPT:', gptError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch GPT configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Detect if this is the start of a new conversation
    const isFirstInteraction = conversation_history.length === 0 || 
      (conversation_history.length === 1 && conversation_history[0].role === 'user');

    let knowledgeContext = '';
    let systemPrompt = '';

    if (isFirstInteraction) {
      // For first interactions, focus only on engaging questions
      const socraticConfig = gpt.socratic_config || {};
      systemPrompt = `You are a ${gpt.subject_area || 'subject'} teaching assistant for ${gpt.grade_level || 'students'}. 

COURSE CONTEXT:
${gpt.description || ''}

CRITICAL INSTRUCTION: This is the student's first question on this topic. Your response should ONLY be an engaging question that activates their prior knowledge or experience related to the topic they asked about. Do NOT explain the concept yet.

TEACHING APPROACH:
- Ask ONE engaging question that connects to their everyday experience
- Use ${socraticConfig.questioning_style || 'guided'} questioning style
- Keep it ${socraticConfig.response_length || 'short'} and focused
- Use an ${socraticConfig.encouragement_style || 'supportive'} tone

Examples of good engaging questions:
- "Have you ever noticed how a baby reacts when you play peek-a-boo?"
- "Think about when you lose your keys - how do you feel when you can't see them?"
- "What happens when you put a toy under a blanket in front of a young child?"

Do NOT provide explanations or definitions yet. Just ask the engaging question and wait for their response.`;
    } else {
      // For follow-up interactions, use knowledge base to guide understanding
      const knowledgeResponse = await supabaseClient.functions.invoke('process-knowledge-base', {
        body: {
          gpt_id: gpt_id,
          query: message,
          limit: 3
        }
      });

      if (knowledgeResponse.data?.relevant_content?.length > 0) {
        knowledgeContext = '\n\nRELEVANT COURSE MATERIALS:\n';
        knowledgeResponse.data.relevant_content.forEach((content: any, index: number) => {
          knowledgeContext += `\nFrom "${content.filename}":\n`;
          content.excerpts.forEach((excerpt: string) => {
            knowledgeContext += `- ${excerpt.trim()}\n`;
          });
        });
        knowledgeContext += '\nPlease reference these materials when relevant to help guide the student to specific resources.\n';
      }

      const socraticConfig = gpt.socratic_config || {};
      systemPrompt = `You are a ${gpt.subject_area || 'subject'} teaching assistant for ${gpt.grade_level || 'students'}. 

TEACHING APPROACH:
- Use ${socraticConfig.questioning_style || 'guided'} questioning to help students discover answers
- Provide ${socraticConfig.guidance_level || 'moderate'} guidance
- Keep responses ${socraticConfig.response_length || 'medium'} in length
- Use an ${socraticConfig.encouragement_style || 'supportive'} and encouraging tone

COURSE CONTEXT:
${gpt.description || ''}

INSTRUCTIONS:
${socraticConfig.custom_instructions || 'Help students learn through guided questioning and discovery.'}

Now that the student has engaged with your initial question, guide them through understanding the concept using the course materials. Reference specific resources when available and continue with Socratic questioning to deepen their understanding.${knowledgeContext}`;
    }

    // Prepare conversation for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversation_history,
      { role: 'user', content: message }
    ];

    // Call OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: gpt.openai_config?.model || 'gpt-4o-mini',
        messages: messages,
        temperature: gpt.openai_config?.temperature || 0.7,
        max_tokens: gpt.openai_config?.max_tokens || 500,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const assistantMessage = openAIData.choices[0].message.content;

    // Update usage stats
    const updatedUsageStats = {
      ...gpt.usage_stats,
      total_conversations: (gpt.usage_stats?.total_conversations || 0) + 1,
      last_used: new Date().toISOString()
    };

    await supabaseClient
      .from('custom_gpts')
      .update({ usage_stats: updatedUsageStats })
      .eq('id', gpt_id);

    // Prepare response data
    let knowledgeContextUsed = false;
    let referencedFiles = [];
    
    if (!isFirstInteraction) {
      const knowledgeResponse = await supabaseClient.functions.invoke('process-knowledge-base', {
        body: {
          gpt_id: gpt_id,
          query: message,
          limit: 3
        }
      });
      knowledgeContextUsed = knowledgeResponse.data?.relevant_content?.length > 0;
      referencedFiles = knowledgeResponse.data?.relevant_content?.map((c: any) => c.filename) || [];
    }

    return new Response(
      JSON.stringify({ 
        response: assistantMessage,
        knowledge_context_used: knowledgeContextUsed,
        referenced_files: referencedFiles
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-with-custom-gpt function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});