import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateUser, getCanvasCredentials } from '../_shared/canvas-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function htmlToText(html: string): string {
  try {
    // Normalize line breaks for common tags
    let text = html
      .replace(/<\s*br\s*\/?\s*>/gi, '\n')
      .replace(/<\/(p|div|li)>/gi, '\n')
      .replace(/<li>/gi, '• ');

    // Remove all remaining tags
    text = text.replace(/<[^>]+>/g, '');

    // Decode a few common entities
    const entities: Record<string, string> = {
      '&nbsp;': ' ',
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
    };
    Object.entries(entities).forEach(([k, v]) => {
      text = text.split(k).join(v);
    });

    // Collapse excessive blank lines
    text = text.replace(/\n{3,}/g, '\n\n').trim();

    return text;
  } catch (_) {
    return html;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { supabase, user } = await authenticateUser(req);

    const body = await req.json();
    const { courseId, discussionId } = body || {};

    if (!courseId || !discussionId) {
      return new Response(JSON.stringify({ error: 'courseId and discussionId are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const credentials = await getCanvasCredentials(supabase, user.id);
    const { canvas_instance_url, canvas_access_token } = credentials;

    const canvasUrl = `${canvas_instance_url}/api/v1/courses/${courseId}/discussion_topics/${discussionId}`;
    console.log(`Fetching discussion ${discussionId} for course ${courseId} from Canvas: ${canvasUrl}`);

    const response = await fetch(`${canvasUrl}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${canvas_access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Canvas API error: ${response.status} - ${errorText}`);
      return new Response(JSON.stringify({ error: `Canvas API returned ${response.status}` }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const discussionData = await response.json();

    const html = discussionData?.message || '';
    const cleaned = htmlToText(html);

    const result = {
      id: discussionData?.id,
      title: discussionData?.title || '',
      message: cleaned,
      html_message: html || null,
      points_possible: discussionData?.assignment?.points_possible ?? null,
      due_at: discussionData?.assignment?.due_at ?? null,
      assignment_id: discussionData?.assignment_id ?? null,
      course_id: courseId,
    };

    return new Response(JSON.stringify({ success: true, discussion: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in import-canvas-discussion function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
