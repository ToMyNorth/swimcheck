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
    
    // Simulate the exact OAuth flow that NextAuth does
    const testUserId = crypto.randomUUID();
    const testEmail = `test-oauth-flow-${Date.now()}@example.com`;
    const testProviderAccountId = `google-${Date.now()}`;
    
    try {
      // Step 1: Create user (NextAuth calls createUser first)
      console.log('Step 1: Creating user...');
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          id: testUserId,
          email: testEmail,
          name: 'Test OAuth Flow User',
          email_verified: null, // NextAuth sets this later
          image: null,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .select()
        .single();
      
      if (userError) {
        result.step1_createUser = { 
          success: false, 
          error: userError.message,
          code: userError.code,
          details: userError.details,
          hint: userError.hint
        };
        return NextResponse.json(result);
      }
      
      result.step1_createUser = { success: true, userId: user.id };
      
      // Step 2: Link account (NextAuth calls linkAccount after createUser)
      console.log('Step 2: Linking account...');
      const { error: accountError } = await supabase
        .from('accounts')
        .insert({
          id: crypto.randomUUID(),
          userId: testUserId, // This is the key field - must be "userId" not "user_id"
          type: 'oauth',
          provider: 'google',
          providerAccountId: testProviderAccountId,
          refresh_token: null,
          access_token: 'ya29.test-google-access-token',
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          scope: 'openid profile email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
          id_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6InRlc3QiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIn0.test-signature',
          session_state: null,
          created_at: new Date(),
          updated_at: new Date(),
        });
      
      if (accountError) {
        result.step2_linkAccount = { 
          success: false, 
          error: accountError.message,
          code: accountError.code,
          details: accountError.details,
          hint: accountError.hint
        };
        
        // Cleanup on failure
        await supabase.from('users').delete().eq('id', testUserId);
        return NextResponse.json(result);
      }
      
      result.step2_linkAccount = { success: true };
      
      // Step 3: Get user by email (NextAuth may call this to verify)
      console.log('Step 3: Getting user by email...');
      const { data: retrievedUser, error: getUserError } = await supabase
        .from('users')
        .select('*')
        .eq('email', testEmail)
        .maybeSingle();
      
      if (getUserError) {
        result.step3_getUserByEmail = { 
          success: false, 
          error: getUserError.message,
          code: getUserError.code
        };
      } else {
        result.step3_getUserByEmail = { 
          success: true, 
          found: !!retrievedUser,
          hasEmailVerified: retrievedUser?.email_verified !== null
        };
      }
      
      // Step 4: Get accounts for user
      console.log('Step 4: Getting accounts...');
      const { data: accounts, error: getAccountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('userId', testUserId);
      
      if (getAccountsError) {
        result.step4_getAccounts = { 
          success: false, 
          error: getAccountsError.message,
          code: getAccountsError.code
        };
      } else {
        result.step4_getAccounts = { 
          success: true, 
          count: accounts?.length || 0
        };
      }
      
      // Step 5: Update user (NextAuth may update email_verified)
      console.log('Step 5: Updating user...');
      const { error: updateError } = await supabase
        .from('users')
        .update({
          email_verified: new Date(),
          updated_at: new Date(),
        })
        .eq('id', testUserId);
      
      if (updateError) {
        result.step5_updateUser = { 
          success: false, 
          error: updateError.message,
          code: updateError.code
        };
      } else {
        result.step5_updateUser = { success: true };
      }
      
      // Cleanup
      console.log('Cleaning up...');
      await supabase.from('accounts').delete().eq('userId', testUserId);
      await supabase.from('users').delete().eq('id', testUserId);
      result.cleanup = { success: true };
      
    } catch (err: any) {
      result.exception = { 
        message: err.message,
        stack: err.stack,
        code: err.code,
        details: err.details,
        hint: err.hint
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
