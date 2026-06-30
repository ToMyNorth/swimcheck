import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? '***configured***' : 'NOT_SET',
    nextauthUrl: process.env.NEXTAUTH_URL,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '***configured***' : 'NOT_SET',
  };

  // Check if values match expected format
  const issues = [];
  
  if (!config.googleClientId?.includes('apps.googleusercontent.com')) {
    issues.push('GOOGLE_CLIENT_ID format is invalid');
  }
  
  if (!config.nextauthUrl) {
    issues.push('NEXTAUTH_URL is not set');
  }
  
  if (!config.supabaseUrl) {
    issues.push('NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  
  if (!config.supabaseKey) {
    issues.push('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  return NextResponse.json({
    config,
    issues: issues.length > 0 ? issues : ['No configuration issues found'],
    status: issues.length === 0 ? 'OK' : 'ERROR',
  });
}
