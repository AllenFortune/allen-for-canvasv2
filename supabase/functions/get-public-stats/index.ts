import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get total submissions from usage_tracking table
    const { data: usageData, error: usageError } = await supabase
      .from('usage_tracking')
      .select('submissions_used')

    if (usageError) {
      console.error('Error fetching usage data:', usageError)
      throw usageError
    }

    // Calculate total submissions
    const totalSubmissions = (usageData || []).reduce((sum, record) => sum + record.submissions_used, 0)
    
    // Add 750 to account for deleted account submissions and add "+" suffix
    const displayTotal = `${totalSubmissions + 750}+`

    return new Response(
      JSON.stringify({ 
        totalSubmissions: displayTotal,
        rawTotal: totalSubmissions + 750
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in get-public-stats:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch public stats' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})