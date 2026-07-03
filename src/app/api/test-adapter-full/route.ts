import { NextResponse } from 'next/server';
import { SupabaseAdapter } from '@auth/supabase-adapter';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
  }
  
  try {
    const adapter = SupabaseAdapter({ url: supabaseUrl, secret: supabaseKey });
    
    let result: any = {};
    
    // Test getUserByEmail
    try {
      const user = await (adapter as any).getUserByEmail?.('test@example.com');
      result.getUserByEmail = { success: true, user };
    } catch (err: any) {
      result.getUserByEmail = { 
        success: false, 
        error: err.message, 
        code: err.code,
        details: err.details,
        hint: err.hint,
        stack: err.stack 
      };
    }
    
    // Test createUser
    try {
      const newUser = await (adapter as any).createUser?.({
        email: 'test-full-login@example.com',
        name: 'Test Full Login User',
        emailVerified: null,
        image: null,
      });
      result.createUser = { success: true, user: newUser };
      
      // Test linkAccount
      if (newUser?.id) {
        try {
          await (adapter as any).linkAccount?.({
            providerAccountId: 'test-account-id',
            type: 'oauth',
            provider: 'google',
            userId: newUser.id,
            access_token: 'test-token',
            token_type: 'bearer',
            scope: 'openid profile email',
            id_token: 'test-id-token',
          });
          result.linkAccount = { success: true };
        } catch (err: any) {
          result.linkAccount = { 
            success: false, 
            error: err.message,
            code: err.code,
            details: err.details,
            hint: err.hint,
            stack: err.stack
          };
        }
        
        // Cleanup
        await (adapter as any).deleteUser?.(newUser.id);
        result.cleanup = { success: true };
      }
    } catch (err: any) {
      result.createUser = { 
        success: false, 
        error: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint,
        stack: err.stack
      };
    }
    
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ 
      status: 'error',
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint,
      stack: err.stack 
    }, { status: 500 });
  }
}
