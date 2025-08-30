import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('=== SIMPLE TEST API ===');
    console.log('Request method:', request.method);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Try different ways to get the body
    const rawText = await request.text();
    console.log('Raw text body length:', rawText.length);
    console.log('Raw text body:', rawText);
    
    if (rawText) {
      try {
        const parsed = JSON.parse(rawText);
        console.log('Successfully parsed JSON:', parsed);
        return new Response(JSON.stringify({ 
          success: true, 
          received: parsed,
          bodyLength: rawText.length
        }), { status: 200 });
      } catch (e) {
        console.log('JSON parse failed:', e);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'JSON parse failed',
          bodyLength: rawText.length,
          body: rawText
        }), { status: 400 });
      }
    } else {
      console.log('Empty body received');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Empty body',
        bodyLength: 0
      }), { status: 400 });
    }
    
  } catch (error) {
    console.error('Test API error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal error',
      message: error.message
    }), { status: 500 });
  }
};
