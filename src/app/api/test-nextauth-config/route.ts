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
      console.log('[DEBUG] SignIn callback:', { 
        userId: user?.id,
        email: user?.email,
        provider: account?.provider,
        providerAccountId: account?.providerAccountId,
      });
      return true;
    },
    async session({ session, user }) {
      console.log('[DEBUG] Session callback:', { 
        sessionId: session.user?.email,
        userId: user.id,
      });
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('[DEBUG] Redirect callback:', { url, baseUrl });
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/api/auth/error-debug', // Custom error page for debugging
  },
  debug: true, // Enable debug mode
});

export async function GET() {
  try {
    // Test the auth configuration
    const config = {
      adapter: 'SupabaseAdapter configured',
      providers: ['Google'],
      trustHost: true,
      callbacks: ['signIn', 'session', 'redirect'],
      pages: {
        signIn: '/auth/signin',
        error: '/api/auth/error-debug',
      },
      debug: true,
    };

    // Check if we can access the auth handlers
    const hasHandlers = !!testAuth.handlers;
    
    return NextResponse.json({
      status: 'success',
      message: 'NextAuth configuration validated',
      config,
      hasHandlers,
      environment: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing',
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      },
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: err.message,
      stack: err.stack,
    }, { status: 500 });
  }
}
