import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

// Create service role client for server-side operations
const supabaseUrl = 'https://fneodphdhnnogfuxcpxn.supabase.co';
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Use service role if available, otherwise fall back to anon key
const supabaseKey = supabaseServiceKey || supabaseAnonKey;
console.log('💾 Quote API: Using', supabaseServiceKey ? 'service role' : 'anon key', 'for database operations');

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Slack webhook function
async function sendSlackNotification(quoteDetails: any) {
  const slackWebhookUrl = import.meta.env.SLACK_WEBHOOK_URL;
  
  if (!slackWebhookUrl) {
    console.log('🔔 Slack webhook URL not configured, skipping notification');
    return;
  }

  try {
    const { name, email, quoteData, quoteId, leadScore, priority } = quoteDetails;
    
    // Format the application type for display
    const formatApplicationType = (type: string) => {
      const types = {
        'work_permit': 'Work Permit',
        'study_permit': 'Study Permit', 
        'visitor_visa': 'Visitor Visa',
        'express_entry': 'Express Entry (PR)',
        'family_sponsorship': 'Family Sponsorship (PR)',
        'oinp_ee_bundle': 'OINP + Express Entry Bundle'
      };
      return types[type] || type;
    };

    // Format location
    const location = quoteData.location === 'inland' ? 'Inland' : 'Outland';
    
    // Build family details
    let familyDetails = 'Single applicant';
    if (quoteData.hasSpouse && quoteData.dependentsCount > 0) {
      familyDetails = `Couple + ${quoteData.dependentsCount} dependent(s)`;
    } else if (quoteData.hasSpouse) {
      familyDetails = 'Couple';
    } else if (quoteData.dependentsCount > 0) {
      familyDetails = `Single + ${quoteData.dependentsCount} dependent(s)`;
    }

    // Priority emoji
    const priorityEmoji = priority === 'high' ? '🔥' : priority === 'medium' ? '⚡' : '📝';
    
    const slackMessage = {
      text: `New Immigration Quote Request! ${priorityEmoji}`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `🎯 New Quote Request - ${formatApplicationType(quoteData.applicationType)}`
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*👤 Name:*\n${name}`
            },
            {
              type: "mrkdwn", 
              text: `*📧 Email:*\n${email}`
            },
            {
              type: "mrkdwn",
              text: `*💰 Total Price:*\n$${quoteData.totalPrice.toLocaleString()} CAD`
            },
            {
              type: "mrkdwn",
              text: `*📊 Lead Score:*\n${leadScore}/100 (${priority})`
            }
          ]
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*🏠 Processing:*\n${location}`
            },
            {
              type: "mrkdwn",
              text: `*👨‍👩‍👧‍👦 Family:*\n${familyDetails}`
            },
            {
              type: "mrkdwn",
              text: `*❌ Prior Refusal:*\n${quoteData.priorRefusal ? 'Yes' : 'No'}`
            },
            {
              type: "mrkdwn",
              text: `*🆔 Quote ID:*\n${quoteId.substring(0, 8)}...`
            }
          ]
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "📧 Send Email"
              },
              style: "primary",
              url: `mailto:${email}?subject=Re: Your Immigration Quote Request&body=Hi ${name},%0A%0AThank you for your interest in our immigration services...`
            },
            {
              type: "button", 
              text: {
                type: "plain_text",
                text: "📞 Schedule Call"
              },
              url: "https://calendly.com/immigratic"
            }
          ]
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `⏰ Received: <!date^${Math.floor(Date.now() / 1000)}^{date_short_pretty} at {time}|just now>`
            }
          ]
        }
      ]
    };

    console.log('🔔 Sending Slack notification...');
    
    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage)
    });

    if (response.ok) {
      console.log('🔔 Slack notification sent successfully');
    } else {
      console.error('🔔 Failed to send Slack notification:', response.status, response.statusText);
    }

  } catch (error) {
    console.error('🔔 Error sending Slack notification:', error);
    // Don't throw - we don't want Slack failures to break quote saving
  }
}

export const POST: APIRoute = async ({ request }) => {
  console.log('💾 Quote API: Received save request');
  console.log('💾 Quote API: Request method:', request.method);
  console.log('💾 Quote API: Request URL:', request.url);
  console.log('💾 Quote API: Service key available:', !!supabaseServiceKey);
  console.log('💾 Quote API: Anon key available:', !!supabaseAnonKey);
  
  try {
    // Log all headers for debugging
    const headers = Object.fromEntries(request.headers.entries());
    console.log('💾 Quote API: All headers:', headers);
    
    const contentType = request.headers.get('content-type') || '';
    console.log('💾 Quote API: Content-Type:', contentType);
    
    let body;
    try {
      const rawBody = await request.text();
      console.log('💾 Quote API: Raw body:', rawBody);
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('💾 Quote API: JSON parse error:', parseError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid JSON in request body' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    console.log('💾 Quote API: Parsed body:', JSON.stringify(body, null, 2));

    // Validate required fields
    const { name, email, quoteData, sessionData } = body;
    
    if (!name || !email || !quoteData) {
      console.log('💾 Quote API: Missing required fields');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: name, email, quoteData' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extract quote data
    const {
      totalPrice,
      serviceFees,
      serviceFeesBeforeTax,
      hstAmount,
      governmentFees,
      applicationType,
      location,
      familySize,
      hasSpouse,
      dependentsCount,
      priorRefusal,
      biometricsRequired,
      oinpScenario,
      governmentFeesBreakdown,
      addOns
    } = quoteData;

    // Extract session data
    const {
      sessionId,
      timeSpentSeconds,
      utmSource,
      utmMedium,
      utmCampaign,
      deviceType,
      userAgent,
      referrer,
      landingPage
    } = sessionData || {};

    // Prepare the database record
    const quoteRecord = {
      // Contact Information
      name: name.trim(),
      email: email.trim().toLowerCase(),
      
      // Application Details
      application_type: applicationType,
      location: location,
      has_spouse: hasSpouse || false,
      dependents_count: dependentsCount || 0,
      prior_refusal: priorRefusal || false,
      biometrics_required: biometricsRequired !== false, // Default to true
      oinp_scenario: oinpScenario || null,
      
      // Detailed Pricing Breakdown
      service_fees_subtotal: parseFloat(serviceFeesBeforeTax) || 0,
      hst_rate: location === 'inland' ? 0.13 : 0,
      hst_amount: parseFloat(hstAmount) || 0,
      service_fees_total: parseFloat(serviceFees) || 0,
      government_fees_principal: parseFloat(governmentFeesBreakdown?.principal) || 0,
      government_fees_spouse: parseFloat(governmentFeesBreakdown?.spouse) || 0,
      government_fees_dependents: parseFloat(governmentFeesBreakdown?.dependents) || 0,
      government_fees_oinp: parseFloat(governmentFeesBreakdown?.oinp) || 0,
      government_fees_biometrics: parseFloat(governmentFeesBreakdown?.biometrics) || 0,
      government_fees_total: parseFloat(governmentFees) || 0,
      total_price: parseFloat(totalPrice) || 0,
      
      // User Journey Analytics
      session_id: sessionId,
      time_spent_seconds: parseInt(timeSpentSeconds) || 0,
      calculations_performed: 1, // At least one calculation to generate quote
      
      // Attribution & Marketing
      utm_source: utmSource || 'direct',
      utm_medium: utmMedium || 'website',
      utm_campaign: utmCampaign || 'pricing_calculator',
      referrer_url: referrer,
      landing_page: landingPage,
      
      // Device & Technical Info
      device_type: deviceType || 'unknown',
      user_agent: userAgent,
      
      // Lead Management defaults
      status: 'new',
      marketing_consent: false, // Can be updated later
      newsletter_consent: false, // Can be updated later
      preferred_contact_method: 'email'
    };

    console.log('💾 Quote API: Inserting record:', JSON.stringify(quoteRecord, null, 2));

    // Insert into Supabase using service role
    const { data, error } = await supabaseAdmin
      .from('pricing_quotes')
      .insert([quoteRecord])
      .select('id, lead_score, priority')
      .single();

    if (error) {
      console.error('💾 Quote API: Supabase error:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Database error: ' + error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('💾 Quote API: Successfully saved quote:', data);

    // Send Slack notification
    await sendSlackNotification({
      name,
      email,
      quoteData,
      quoteId: data.id,
      leadScore: data.lead_score,
      priority: data.priority
    });

    return new Response(JSON.stringify({ 
      success: true, 
      quoteId: data.id,
      leadScore: data.lead_score,
      priority: data.priority,
      message: 'Quote saved successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💾 Quote API: Unexpected error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};