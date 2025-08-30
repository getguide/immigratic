import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    // API Key Authentication - TEMPORARILY DISABLED FOR TESTING
    console.log('🔑 API Key check temporarily disabled for testing');
    console.log('Headers received:', Object.fromEntries(request.headers.entries()));
    
    // Debug: Log request details
    console.log('Request method:', request.method);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Try to get the raw text first
    const rawText = await request.text();
    console.log('Raw request body:', rawText);
    
    let body;
    try {
      body = JSON.parse(rawText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid JSON in request body' 
      }), { status: 400 });
    }
    
    console.log('Parsed body:', body);
    const { email, name } = body;

    // Basic validation
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Valid email is required' 
      }), { status: 400 });
    }

    // Generate unique user ID
    const userId = `newsletter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare Customer.io payload - only send fields that exist in your schema
    const customerIoPayload = {
      userId: userId,
      traits: {
        name: name || 'Newsletter Subscriber',
        email: email
      }
    };

    // Send to Customer.io using node:https
    const https = await import('node:https');
    
    // Get API key from environment variables (fallback to hardcoded for now)
    const customerIoApiKey = process.env.CUSTOMER_IO_API_KEY || 'NmU3YTFlZWZmNmVhOWE2ODRmNmM6';
    
    const responseData = await new Promise((resolve, reject) => {
      const req = https.request('https://cdp.customer.io/v1/identify', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${customerIoApiKey}`,
          'Content-Type': 'application/json'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });
      req.on('error', reject);
      req.write(JSON.stringify(customerIoPayload));
      req.end();
    });
    
    if (responseData.status !== 200) {
      console.error('Customer.io API error:', responseData);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to subscribe. Please try again.' 
      }), { status: 500 });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Successfully subscribed to newsletter!',
      userId: userId
    }), { status: 200 });

  } catch (error) {
    console.error('Newsletter signup error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error. Please try again.' 
    }), { status: 500 });
  }
};
