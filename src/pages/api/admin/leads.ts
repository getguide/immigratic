import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

// Create service role client for admin operations
const supabaseUrl = 'https://fneodphdhnnogfuxcpxn.supabase.co';
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

const supabaseKey = supabaseServiceKey || supabaseAnonKey;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const GET: APIRoute = async ({ request }) => {
  console.log('📊 Admin Leads API: Received request');
  
  try {
    // Verify authentication by checking the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('📊 Admin Leads API: No valid auth header');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Unauthorized' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch all leads from pricing_quotes table
    console.log('📊 Admin Leads API: Fetching leads from database...');
    const { data: leads, error } = await supabaseAdmin
      .from('pricing_quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('📊 Admin Leads API: Database error:', error);
      throw error;
    }

    console.log(`📊 Admin Leads API: Successfully fetched ${leads?.length || 0} leads`);

    return new Response(JSON.stringify({ 
      success: true, 
      leads: leads || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('📊 Admin Leads API: Unexpected error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  console.log('📊 Admin Leads API: Received update request');
  
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Unauthorized' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { leadId, status, notes } = body;

    if (!leadId || !status) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Lead ID and status are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update lead status
    const updateData: any = { 
      status,
      updated_at: new Date().toISOString()
    };

    if (notes) {
      updateData.notes = notes;
    }

    const { data, error } = await supabaseAdmin
      .from('pricing_quotes')
      .update(updateData)
      .eq('id', leadId)
      .select()
      .single();

    if (error) {
      console.error('📊 Admin Leads API: Update error:', error);
      throw error;
    }

    console.log('📊 Admin Leads API: Successfully updated lead:', leadId);

    return new Response(JSON.stringify({ 
      success: true, 
      lead: data
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('📊 Admin Leads API: Update error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to update lead' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
