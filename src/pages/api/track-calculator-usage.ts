import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

// Ensure this endpoint is server-side rendered
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('📊 API: Received tracking request');
    console.log('📊 API: Content-Type:', request.headers.get('content-type'));
    
    // Handle both regular fetch and sendBeacon requests
    let body;
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      console.log('📊 API: Parsing as JSON');
      body = await request.json();
    } else {
      console.log('📊 API: Parsing as text');
      // Handle sendBeacon blob data
      const text = await request.text();
      console.log('📊 API: Raw text:', text);
      
      if (!text || text.trim() === '') {
        console.error('📊 API: Empty request body');
        return new Response(JSON.stringify({ error: 'Empty request body' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      try {
        body = JSON.parse(text);
      } catch (e) {
        console.error('📊 API: Failed to parse request body:', text);
        return new Response(JSON.stringify({ error: 'Invalid JSON', received: text }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    console.log('📊 API: Parsed body:', body);
    
    const {
      calculatorType,
      sessionId,
      calculationResult,
      timeSpentSeconds,
      utmSource,
      utmMedium,
      utmCampaign,
      deviceType,
      conversionEvent
    } = body;
    
    // Validate calculator type
    const validTypes = ['crs', 'fsw', 'master_assessment', 'clb_navigator', 'noc_navigator', 'pricing_calculator'];
    if (!validTypes.includes(calculatorType)) {
      return new Response(JSON.stringify({ error: 'Invalid calculator type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extract client information from request headers
    const rawIP = request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  request.headers.get('cf-connecting-ip'); // Cloudflare
    
    // Handle IP address properly for PostgreSQL inet type
    let clientIP = null;
    if (rawIP && rawIP !== 'unknown') {
      // Take first IP if there are multiple (x-forwarded-for can have multiple IPs)
      const firstIP = rawIP.split(',')[0].trim();
      // Basic IP validation
      if (firstIP.match(/^(\d{1,3}\.){3}\d{1,3}$/) || firstIP.includes(':')) {
        clientIP = firstIP;
      }
    }
    
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referrerUrl = request.headers.get('referer') || request.headers.get('referrer') || null;
    
    // Extract page URL from request
    const url = new URL(request.url);
    const pageUrl = url.origin + url.pathname;

    // Simple device type detection from user agent
    let detectedDeviceType = 'desktop';
    if (userAgent.toLowerCase().includes('mobile')) {
      detectedDeviceType = 'mobile';
    } else if (userAgent.toLowerCase().includes('tablet')) {
      detectedDeviceType = 'tablet';
    }

    // Use provided device type or fall back to detected
    const finalDeviceType = deviceType || detectedDeviceType;

    // Simple country detection (you could enhance this with a GeoIP service later)
    let countryCode = null;
    // For now, we'll leave this null and can add GeoIP lookup later if needed

    // Prepare the data for insertion
    const insertData = {
      calculator_type: calculatorType,
      user_session: sessionId,
      ip_address: clientIP,
      user_agent: userAgent,
      referrer_url: referrerUrl,
      page_url: pageUrl,
      utm_source: utmSource || null,
      utm_medium: utmMedium || null,
      utm_campaign: utmCampaign || null,
      device_type: finalDeviceType,
      country_code: countryCode,
      calculation_result: calculationResult || null,
      time_spent_seconds: timeSpentSeconds || null,
      conversion_event: conversionEvent || null
    };

    console.log('📊 Tracking calculator usage:', {
      type: calculatorType,
      session: sessionId?.substring(0, 10) + '...',
      device: finalDeviceType,
      utm: utmSource || 'direct'
    });

    // Insert usage record into Supabase
    const { data, error } = await supabase
      .from('calculator_usage')
      .insert([insertData]);

    if (error) {
      console.error('❌ Error tracking calculator usage:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to track usage',
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Successfully tracked calculator usage');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Usage tracked successfully'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('❌ Error in track-calculator-usage API:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Optional: Add GET endpoint for basic health check
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ 
    status: 'Calculator usage tracking API is running',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
