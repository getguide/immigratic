import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  console.log('🚀 Quote API V3: MINIMAL TEST VERSION');
  
  try {
    const body = await request.json();
    console.log('🚀 Quote API V3: Received data for:', body.email);

    // SUPER MINIMAL RECORD - ONLY REQUIRED FIELDS
    const minimalRecord = {
      name: body.name || 'Test User',
      email: body.email || 'test@test.com',
      application_type: 'work_permit',
      location: 'inland',
      total_price: 1000
    };

    console.log('🚀 Quote API V3: Inserting minimal record:', minimalRecord);

    // Direct Supabase REST API call
    const supabaseUrl = 'https://fneodphdhnnogfuxcpxn.supabase.co';
    const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await fetch(`${supabaseUrl}/rest/v1/pricing_quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(minimalRecord)
    });

    console.log('🚀 Quote API V3: Supabase response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🚀 Quote API V3: Supabase error:', errorText);
      return new Response(JSON.stringify({
        success: false,
        error: 'Database error',
        details: errorText
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await response.json();
    console.log('🚀 Quote API V3: Success!', result);

    return new Response(JSON.stringify({
      success: true,
      message: 'Minimal quote saved',
      data: result
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('🚀 Quote API V3: Unexpected error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Server error',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
