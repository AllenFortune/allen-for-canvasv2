
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const OPENAI_CONFIG = {
  model: 'gpt-4o',
  temperature: 0.7,
  max_tokens: 1500,
};

export const getOpenAIApiKey = () => Deno.env.get('OPENAI_API_KEY');
