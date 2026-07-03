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
    
    // Test ALL operations that Adapter does during OAuth callback
    
    const testUserId = crypto.randomUUID();
    const testEmail = `test-oauth-${Date.now()}@example.com`;
    const testProviderAccountId = `google-${Date.now()}`;
    
    try {
      // Step 1: Create user (what Adapter does first)
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert([{
          id: testUserId,
          email: testEmail,
          name: 'Test OAuth User',
          email_verified: new Date().toISOString(),
          image: null,
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
        
        // Step 2: Link account (what Adapter does next)
        const { data: newAccount, error: createAccountError } = await supabase
          .from('accounts')
          .insert([{
            id: crypto.randomUUID(),
            userId: testUserId,
            type: 'oauth',
            provider: 'google',
            providerAccountId: testProviderAccountId,
            refresh_token: null,
            access_token: 'test-token',
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            token_type: 'bearer',
            scope: 'openid profile email',
            id_token: 'test-id-token',
            session_state: null,
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
          result.linkAccount = { success: true, accountId: newAccount.id };
          
          // Step 3: Get user by email (what Adapter does to verify)
          const { data: getUser, error: getUserError } = await supabase
            .from('users')
            .select('*')
            .eq('email', testEmail)
            .maybeSingle();
          
          if (getUserError) {
            result.getUserByEmail = { 
              success: false, 
              error: getUserError.message, 
              code: getUserError.code,
              details: getUserError.details,
              hint: getUserError.hint
            };
          } else {
            result.getUserByEmail = { 
              success: true, 
              found: !!getUser,
              hasAccounts: false
            };
            
            // Step 4: Get accounts for user
            const { data: getAccounts, error: getAccountsError } = await supabase
              .from('accounts')
              .select('*')
              .eq('userId', testUserId);
            
            if (getAccountsError) {
              result.getAccounts = { 
                success: false, 
                error: getAccountsError.message, 
                code: getAccountsError.code,
                details: getAccountsError.details,
                hint: getAccountsError.hint
              };
            } else {
              result.getAccounts = { 
                success: true, 
                count: getAccounts?.length || 0 
              };
              
              // Step 5: Update user (what Adapter might do)
              const { error: updateUserError } = await supabase
                .from('users')
                .update({
                  name: 'Updated Name',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', testUserId);
              
              if (updateUserError) {
                result.updateUser = { 
                  success: false, 
                  error: updateUserError.message, 
                  code: updateUserError.code,
                  details: updateUserError.details,
                  hint: updateUserError.hint
                };
              } else {
                result.updateUser = { success: true };
              }
            }
          }
        }
        
        // Cleanup
        await supabase.from('accounts').delete().eq('userId', testUserId);
        await supabase.from('users').delete().eq('id', testUserId);
        result.cleanup = { success: true };
      }
    } catch (err: any) {
      result.exception = { 
        message: err.message, 
        stack: err.stack,
        name: err.name,
        code: err.code
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
