import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const supabaseUrl = 'https://fneodphdhnnogfuxcpxn.supabase.co';
    const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    console.log('🔑 Testing Supabase keys...');
    console.log('🔑 Service key length:', serviceKey?.length || 0);
    console.log('🔑 Anon key length:', anonKey?.length || 0);
    console.log('🔑 Service key starts with:', serviceKey?.substring(0, 20) + '...');
    console.log('🔑 Anon key starts with:', anonKey?.substring(0, 20) + '...');

    // Test service key
    const serviceResponse = await fetch(`${supabaseUrl}/rest/v1/pricing_quotes?limit=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Accept': 'application/json'
      }
    });

    console.log('🔑 Service key response status:', serviceResponse.status);
    
    if (!serviceResponse.ok) {
      const errorText = await serviceResponse.text();
      console.log('🔑 Service key error:', errorText);
    }

    // Test anon key
    const anonResponse = await fetch(`${supabaseUrl}/rest/v1/pricing_quotes?limit=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Accept': 'application/json'
      }
    });

    console.log('🔑 Anon key response status:', anonResponse.status);

    if (!anonResponse.ok) {
      const errorText = await anonResponse.text();
      console.log('🔑 Anon key error:', errorText);
    }

    return new Response(JSON.stringify({
      serviceKeyLength: serviceKey?.length || 0,
      anonKeyLength: anonKey?.length || 0,
      serviceKeyWorks: serviceResponse.ok,
      anonKeyWorks: anonResponse.ok,
      serviceKeyStatus: serviceResponse.status,
      anonKeyStatus: anonResponse.status
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('🔑 Key test error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
