import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('=== MINIMAL TEST ===');
    
    // Get raw text
    const rawText = await request.text();
    console.log('Raw text length:', rawText.length);
    console.log('Raw text:', rawText);
    console.log('Raw text bytes:', Array.from(rawText).map(c => c.charCodeAt(0)));
    
    // Try to parse
    if (rawText) {
      try {
        const parsed = JSON.parse(rawText);
        console.log('✅ Successfully parsed:', parsed);
        return new Response(JSON.stringify({ 
          success: true, 
          received: parsed,
          bodyLength: rawText.length
        }), { status: 200 });
      } catch (e) {
        console.log('❌ JSON parse failed:', e.message);
        return new Response(JSON.stringify({ 
          success: false, 
          error: e.message,
          bodyLength: rawText.length,
          body: rawText
        }), { status: 400 });
      }
    } else {
      console.log('❌ Empty body received');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Empty body received',
        bodyLength: 0
      }), { status: 400 });
    }
    
  } catch (error) {
    console.error('Test API error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { status: 500 });
  }
};
