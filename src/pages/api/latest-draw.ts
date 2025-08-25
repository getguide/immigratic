import type { APIRoute } from 'astro';
import { getLatestExpressEntryDraw } from '../../lib/immiwatch-data';

export const GET: APIRoute = async ({ request }) => {
  try {
    const latestDraw = await getLatestExpressEntryDraw();
    
    if (!latestDraw) {
      return new Response(JSON.stringify({ error: 'No draw data available' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(latestDraw), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('Error fetching latest draw:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
