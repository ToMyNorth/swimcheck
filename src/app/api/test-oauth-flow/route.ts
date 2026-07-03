import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { SupabaseAdapter } from '@auth/supabase-adapter';

// Create a test auth handler to capture errors
const testAuth = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  trustHost: true,
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn callback:', { user, account, profile });
      return true;
    },
    async session({ session, user }) {
      console.log('Session callback:', { session, user });
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  debug: true, // Enable debug mode
});

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
  }
  
  try {
    // Test the adapter directly
    const adapter = SupabaseAdapter({ url: supabaseUrl, secret: supabaseKey });
    
    // Try to create a test user and link an account (simulating OAuth flow)
    const testEmail = `test-oauth-${Date.now()}@example.com`;
    
    let result: any = {};
    
    // Step 1: Create user
    try {
      const user = await (adapter as any).createUser?.({
        email: testEmail,
        name: 'Test OAuth User',
        emailVerified: new Date(),
        image: null,
      });
      result.createUser = { success: true, userId: user?.id };
      
      // Step 2: Link account (simulating Google OAuth)
      if (user?.id) {
        try {
          await (adapter as any).linkAccount?.({
            providerAccountId: 'google-test-' + Date.now(),
            type: 'oauth',
            provider: 'google',
            userId: user.id,
            access_token: 'ya29.test-token',
            token_type: 'bearer',
            scope: 'openid profile email',
            id_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6InRlc3QiLCJ0eXAiOiJKV1QifQ.test',
            expires_at: Math.floor(Date.now() / 1000) + 3600,
          });
          result.linkAccount = { success: true };
          
          // Step 3: Get user by email
          const retrievedUser = await (adapter as any).getUserByEmail?.(testEmail);
          result.getUserByEmail = { 
            success: true, 
            found: !!retrievedUser,
            hasAccounts: retrievedUser ? false : undefined
          };
          
          // Step 4: Get accounts for user
          if (retrievedUser?.id) {
            const accounts = await (adapter as any).getAccountsByUserId?.(retrievedUser.id);
            result.getAccounts = { 
              success: true, 
              count: accounts?.length || 0,
              accounts: accounts 
            };
          }
          
          // Cleanup
          await (adapter as any).deleteUser?.(user.id);
          result.cleanup = { success: true };
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
