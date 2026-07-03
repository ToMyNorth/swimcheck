import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
  }
  
  try {
    // Use the EXACT same configuration as @auth/supabase-adapter
    const supabase = createClient(supabaseUrl, supabaseKey, {
      db: { schema: "next_auth" },
      global: { headers: { "X-Client-Info": "@auth/supabase-adapter" } },
      auth: { persistSession: false },
    });
    
    let result: any = {};
    
    // Test sessions table structure
    try {
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .limit(1);
      
      if (sessionsError) {
        result.sessionsTable = { 
          success: false, 
          error: sessionsError.message, 
          code: sessionsError.code,
          details: sessionsError.details,
          hint: sessionsError.hint
        };
      } else {
        result.sessionsTable = { 
          success: true, 
          count: sessions?.length || 0,
          sample: sessions?.[0] || null,
          columns: Object.keys(sessions?.[0] || {})
        };
      }
    } catch (err: any) {
      result.sessionsTable = { success: false, error: err.message };
    }
    
    // Test createSession (what Adapter does)
    const testSessionToken = crypto.randomUUID();
    const testUserId = crypto.randomUUID();
    const testExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    try {
      // First create a user
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert([{
          id: testUserId,
          email: `test-session-${Date.now()}@example.com`,
          name: 'Test Session User',
          email_verified: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();
      
      if (createUserError) {
        result.createUser = { 
          success: false, 
          error: createUserError.message, 
          code: createUserError.code,
          details: createUserError.details,
          hint: createUserError.hint
        };
      } else {
        result.createUser = { success: true, userId: newUser.id };
        
        // Now create session (using camelCase like Adapter does)
        const { data: newSession, error: createSessionError } = await supabase
          .from('sessions')
          .insert([{
            sessionToken: testSessionToken,
            userId: testUserId,
            expires: testExpires.toISOString(),
          }])
          .select()
          .single();
        
        if (createSessionError) {
          result.createSession = { 
            success: false, 
            error: createSessionError.message, 
            code: createSessionError.code,
            details: createSessionError.details,
            hint: createSessionError.hint
          };
        } else {
          result.createSession = { 
            success: true, 
            session: newSession,
            columns: Object.keys(newSession || {})
          };
          
          // Cleanup
          await supabase.from('sessions').delete().eq('sessionToken', testSessionToken);
          await supabase.from('users').delete().eq('id', testUserId);
          result.cleanup = { success: true };
        }
      }
    } catch (err: any) {
      result.sessionFlow = { 
        success: false, 
        error: err.message, 
        stack: err.stack 
      };
    }
    
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: err.message, 
      stack: err.stack 
    }, { status: 500 });
  }
}
