import type { APIRoute } from 'astro';
import { createClient } from '@sanity/client';

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('Newsletter endpoint hit');
    console.log('Token exists:', !!process.env.SANITY_TOKEN);
    
    // Create Sanity client with token
    const client = createClient({
      projectId: 'kxqfasm6',
      dataset: 'production',
      apiVersion: '2024-01-01',
      useCdn: false,
      token: process.env.SANITY_TOKEN,
    });
    
    // Get request body
    const body = await request.json();
    console.log('Request body:', body);
    
    const { firstName, email, interests, source, status } = body;

    // Basic validation
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Valid email is required'
      }), { status: 400 });
    }

    if (!firstName || firstName.trim().length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'First name is required'
      }), { status: 400 });
    }

    // Check if email already exists
    console.log('Checking for existing subscriber...');
    const existingSubscriber = await client.fetch(
      `*[_type == "newsletter" && email == $email][0]`,
      { email }
    );
    console.log('Existing subscriber check result:', existingSubscriber);

    if (existingSubscriber) {
      return new Response(JSON.stringify({
        success: false,
        error: 'This email is already subscribed to our newsletter'
      }), { status: 409 });
    }

    // Create newsletter subscriber document
    const newsletterDoc = {
      _type: 'newsletter',
      email: email,
      firstName: firstName.trim(),
      lastName: '', // Optional field
      subscribedAt: new Date().toISOString(),
      status: status || 'active',
      source: source || 'website_newsletter',
      interests: interests || ['general']
    };

    console.log('Creating newsletter subscriber:', newsletterDoc);

    // Insert into Sanity
    const result = await client.create(newsletterDoc);

    console.log('Newsletter subscriber created successfully:', result._id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Successfully subscribed to newsletter!',
      subscriberId: result._id
    }), { status: 200 });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      tokenExists: !!process.env.SANITY_TOKEN
    });
    
    // Check if it's a Sanity error
    if (error instanceof Error && error.message.includes('SANITY_')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Database error. Please try again later.'
      }), { status: 500 });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500 });
  }
};
