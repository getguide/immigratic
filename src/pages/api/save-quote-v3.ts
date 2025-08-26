import type { APIRoute } from 'astro';

export const prerender = false;

// Function to send Slack notification
async function sendSlackNotification(leadDetails: any) {
  const slackWebhookUrl = import.meta.env.SLACK_WEBHOOK_URL;
  
  if (!slackWebhookUrl) {
    console.warn('🚀 Quote API V3: Slack webhook URL not configured. Skipping notification.');
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
            url: `https://immigratic.vercel.app/admin/dashboard`,
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
      console.error('🚀 Quote API V3: Failed to send Slack notification:', response.status, response.statusText);
    } else {
      console.log('🚀 Quote API V3: Slack notification sent successfully!');
    }
  } catch (error) {
    console.error('🚀 Quote API V3: Error sending Slack notification:', error);
  }
}

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

    // Send Slack notification
    await sendSlackNotification({
      name: body.name || 'Test User',
      email: body.email || 'test@test.com',
      application_type: body.quoteData?.applicationType || 'work_permit',
      location: body.quoteData?.location || 'inland',
      total_price: body.quoteData?.totalPrice || 1000
    });

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
