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
    
    // Test 1: Check if users table exists and has correct columns
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (usersError) {
        result.usersTable = { 
          success: false, 
          error: usersError.message, 
          code: usersError.code,
          details: usersError.details,
          hint: usersError.hint
        };
      } else {
        result.usersTable = { 
          success: true, 
          count: users?.length || 0,
          sample: users?.[0] || null,
          columns: Object.keys(users?.[0] || {})
        };
      }
    } catch (err: any) {
      result.usersTable = { success: false, error: err.message };
    }
    
    // Test 2: Check if accounts table exists and has correct columns
    try {
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .limit(1);
      
      if (accountsError) {
        result.accountsTable = { 
          success: false, 
          error: accountsError.message, 
          code: accountsError.code,
          details: accountsError.details,
          hint: accountsError.hint
        };
      } else {
        result.accountsTable = { 
          success: true, 
          count: accounts?.length || 0,
          sample: accounts?.[0] || null,
          columns: Object.keys(accounts?.[0] || {})
        };
      }
    } catch (err: any) {
      result.accountsTable = { success: false, error: err.message };
    }
    
    // Test 3: Simulate what Adapter does during OAuth callback
    const testUserId = crypto.randomUUID();
    const testEmail = `test-oauth-${Date.now()}@example.com`;
    
    try {
      // Create user
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert([{
          id: testUserId,
          email: testEmail,
          name: 'Test OAuth User',
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
        result.createUser = { success: true, user: newUser };
        
        // Try to link account (this is what fails in OAuth flow)
        const { data: newAccount, error: createAccountError } = await supabase
          .from('accounts')
          .insert([{
            userId: testUserId,
            type: 'oauth',
            provider: 'google',
            providerAccountId: 'test-google-id',
            access_token: 'test-token',
            token_type: 'bearer',
            scope: 'openid profile email',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }])
          .select()
          .single();
        
        if (createAccountError) {
          result.linkAccount = { 
            success: false, 
            error: createAccountError.message, 
            code: createAccountError.code,
            details: createAccountError.details,
            hint: createAccountError.hint
          };
        } else {
          result.linkAccount = { success: true, account: newAccount };
        }
        
        // Cleanup
        await supabase.from('accounts').delete().eq('userId', testUserId);
        await supabase.from('users').delete().eq('id', testUserId);
        result.cleanup = { success: true };
      }
    } catch (err: any) {
      result.oauthFlow = { success: false, error: err.message, stack: err.stack };
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
