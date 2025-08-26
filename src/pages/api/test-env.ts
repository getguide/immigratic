import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const envVars = {
      hasSupabaseUrl: !!import.meta.env.PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
      hasSupabaseServiceKey: !!import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
      hasSlackWebhook: !!import.meta.env.SLACK_WEBHOOK_URL,
      nodeEnv: import.meta.env.NODE_ENV || 'unknown',
      mode: import.meta.env.MODE || 'unknown',
      availableEnvVars: Object.keys(import.meta.env).filter(key => 
        key.includes('SUPABASE') || key.includes('SLACK') || key.includes('NODE') || key.includes('MODE')
      )
    };

    return new Response(JSON.stringify(envVars, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to check environment variables',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
