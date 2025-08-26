import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  console.log('🚀 Quote API V2: Starting request processing - Updated Secret Key...');
  
  try {
    // Parse request body
    let body;
    try {
      const rawBody = await request.text();
      console.log('🚀 Quote API V2: Raw body received:', rawBody.substring(0, 200) + '...');
      body = JSON.parse(rawBody);
      console.log('🚀 Quote API V2: Successfully parsed JSON');
    } catch (parseError) {
      console.error('🚀 Quote API V2: JSON parse error:', parseError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid JSON format' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate required fields
    if (!body.name || !body.email || !body.quoteData) {
      console.error('🚀 Quote API V2: Missing required fields');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: name, email, or quoteData' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('🚀 Quote API V2: Processing quote for:', body.email);

    // Create the record object - MINIMAL VERSION TO BYPASS TRIGGER ISSUES
    const quoteRecord = {
      name: body.name,
      email: body.email,
      application_type: body.quoteData.applicationType || 'work_permit',
      location: body.quoteData.location || 'inland',
      has_spouse: body.quoteData.hasSpouse || false,
      dependents_count: body.quoteData.dependentsCount || 0,
      prior_refusal: body.quoteData.priorRefusal || false,
      biometrics_required: body.quoteData.biometricsRequired || true,
      oinp_scenario: body.quoteData.oinpScenario || null,
      service_fees_subtotal: body.quoteData.serviceFeesSubtotal || 0,
      hst_rate: body.quoteData.hstRate || 0,
      hst_amount: body.quoteData.hstAmount || 0,
      service_fees_total: body.quoteData.serviceFees || 0,
      government_fees_principal: body.quoteData.governmentFees?.principal || 0,
      government_fees_spouse: body.quoteData.governmentFees?.spouse || 0,
      government_fees_dependents: body.quoteData.governmentFees?.dependents || 0,
      government_fees_oinp: body.quoteData.governmentFees?.oinp || 0,
      government_fees_biometrics: body.quoteData.governmentFees?.biometrics || 0,
      government_fees_total: body.quoteData.governmentFeesTotal || 0,
      total_price: body.quoteData.totalPrice || 0,
      session_id: body.sessionData?.sessionId || 'unknown',
      time_spent_seconds: body.sessionData?.timeSpentSeconds || 0,
      calculations_performed: 1,
      utm_source: body.sessionData?.utmSource || 'direct',
      utm_medium: body.sessionData?.utmMedium || 'website',
      utm_campaign: body.sessionData?.utmCampaign || 'pricing_calculator',
      referrer_url: body.sessionData?.referrer || '',
      landing_page: body.sessionData?.landingPage || '/tools/pricing-calculator',
      device_type: body.sessionData?.deviceType || 'unknown',
      user_agent: body.sessionData?.userAgent || '',
      status: 'new',
      marketing_consent: body.marketingConsent || false,
      newsletter_consent: body.newsletterConsent || false,
      preferred_contact_method: 'email',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('🚀 Quote API V2: Record prepared:', {
      id: quoteRecord.id,
      email: quoteRecord.email,
      total_price: quoteRecord.total_price
    });

    // Use direct SQL insert via Supabase REST API
    const supabaseUrl = 'https://fneodphdhnnogfuxcpxn.supabase.co';
    const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceKey) {
      console.error('🚀 Quote API V2: No service key available');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Server configuration error' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('🚀 Quote API V2: Making direct REST API call to Supabase...');

    // Direct REST API call to Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/pricing_quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Prefer': 'return=representation',
        'Accept': 'application/json'
      },
      body: JSON.stringify(quoteRecord)
    });

    console.log('🚀 Quote API V2: Supabase response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🚀 Quote API V2: Supabase error response:', errorText);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Database insertion failed',
        details: errorText
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const insertedData = await response.json();
    console.log('🚀 Quote API V2: Successfully inserted:', insertedData[0]?.id);

    // Send Slack notification (optional - don't fail if this fails)
    try {
      const slackWebhookUrl = import.meta.env.SLACK_WEBHOOK_URL;
      if (slackWebhookUrl) {
        console.log('🚀 Quote API V2: Sending Slack notification...');
        await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🎯 New Quote Request!\n**${body.name}** (${body.email})\n💰 Total: $${body.quoteData.totalPrice}\n📋 Service: ${body.quoteData.applicationType}\n📍 Location: ${body.quoteData.location}`
          })
        });
        console.log('🚀 Quote API V2: Slack notification sent');
      }
    } catch (slackError) {
      console.log('🚀 Quote API V2: Slack notification failed (non-critical):', slackError);
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Quote saved successfully',
      id: insertedData[0]?.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('🚀 Quote API V2: Unexpected error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
