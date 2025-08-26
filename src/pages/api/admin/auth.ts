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

export const POST: APIRoute = async ({ request }) => {
  console.log('🔐 Admin Auth API: Received request');
  
  try {
    const body = await request.json();
    const { action, email, password } = body;

    console.log('🔐 Admin Auth API: Action:', action);

    if (action === 'login') {
      // Handle login
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('🔐 Admin Auth API: Login error:', error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: error.message 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log('🔐 Admin Auth API: Login successful');
      return new Response(JSON.stringify({ 
        success: true, 
        user: data.user,
        session: data.session
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (action === 'create_admin') {
      // Handle admin user creation (for initial setup)
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role: 'admin'
        }
      });

      if (error) {
        console.error('🔐 Admin Auth API: Create admin error:', error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: error.message 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log('🔐 Admin Auth API: Admin user created');
      return new Response(JSON.stringify({ 
        success: true, 
        user: data.user
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Invalid action' 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('🔐 Admin Auth API: Unexpected error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
