import type { APIRoute } from 'astro';

export const prerender = false;

// Function to send Slack notification
async function sendSlackNotification(leadDetails: any) {
  const slackWebhookUrl = import.meta.env.SLACK_WEBHOOK_URL;
  
  if (!slackWebhookUrl) {
    console.warn('💾 Quote API: Slack webhook URL not configured. Skipping notification.');
    return;
  }

  const { name, email, application_type, total_price, location } = leadDetails;

  const slackMessage = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '✨ New Quote Request! ✨',
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Name:*\n${name}`,
          },
          {
            type: 'mrkdwn',
            text: `*Email:*\n${email}`,
          },
          {
            type: 'mrkdwn',
            text: `*Application Type:*\n${application_type.replace(/_/g, ' ').split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`,
          },
          {
            type: 'mrkdwn',
            text: `*Location:*\n${location.charAt(0).toUpperCase() + location.slice(1)}`,
          },
          {
            type: 'mrkdwn',
            text: `*Total Price:*\n$${total_price.toLocaleString()}`,
          },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View in Admin Dashboard',
              emoji: true,
            },
            style: 'primary',
            url: `https://www.immigratic.com/admin/login`,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage),
    });

    if (!response.ok) {
      console.error('💾 Quote API: Failed to send Slack notification:', response.status, response.statusText);
    } else {
      console.log('💾 Quote API: Slack notification sent successfully!');
    }
  } catch (error) {
    console.error('💾 Quote API: Error sending Slack notification:', error);
  }
}

export const POST: APIRoute = async ({ request }) => {
  console.log('💾 Quote API: Processing quote request...');
  
  try {
    const body = await request.json();
    console.log('💾 Quote API: Full body received:', JSON.stringify(body, null, 2));
    console.log('💾 Quote API: Received data for:', body.email);

    // ADD MARKETING/SESSION TRACKING - CUSTOMER INTELLIGENCE
    const quoteRecord = {
      name: body.name || 'Unknown',
      email: body.email || 'unknown@example.com',
      application_type: body.quoteData?.applicationType || 'work_permit',
      location: body.quoteData?.location || 'inland',
      has_spouse: body.quoteData?.hasSpouse || false,
      dependents_count: body.quoteData?.dependentsCount || 0,
      
      // Financial breakdown
      service_fees_subtotal: body.quoteData?.serviceFeesBreakdown?.subtotal || 0,
      hst_amount: body.quoteData?.serviceFeesBreakdown?.hstAmount || 0,
      service_fees_total: body.quoteData?.serviceFeesBreakdown?.total || 0,
      government_fees_total: body.quoteData?.governmentFeesBreakdown?.total || 0,
      
      total_price: body.quoteData?.grandTotal || body.quoteData?.totalPrice || 0,
      
      // Marketing & session tracking
      session_id: body.sessionData?.sessionId || 'unknown',
      time_spent_seconds: body.sessionData?.timeSpentSeconds || 0,
      utm_source: body.sessionData?.utmSource || 'direct',
      utm_medium: body.sessionData?.utmMedium || 'website',
      utm_campaign: body.sessionData?.utmCampaign || 'pricing_calculator',
      device_type: body.sessionData?.deviceType || 'unknown',
      referrer_url: body.sessionData?.referrer || '',
      landing_page: body.sessionData?.landingPage || '/tools/pricing-calculator'
    };

    console.log('💾 Quote API: Inserting record for:', quoteRecord.email);

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
      body: JSON.stringify(quoteRecord)
    });

    console.log('💾 Quote API: Supabase response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('💾 Quote API: Supabase error:', errorText);
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
    console.log('💾 Quote API: Successfully saved quote');

    // Send Slack notification
    await sendSlackNotification({
      name: body.name,
      email: body.email,
      application_type: body.quoteData?.applicationType || 'work_permit',
      location: body.quoteData?.location || 'inland',
      total_price: body.quoteData?.grandTotal || body.quoteData?.totalPrice || 0
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Quote saved successfully',
      data: result
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💾 Quote API: Unexpected error:', error);
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