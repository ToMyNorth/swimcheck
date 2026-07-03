import { NextResponse } from 'next/server';

export async function GET() {
  // Check all required environment variables for NextAuth + Google OAuth
  const envVars = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✓ Set' : ' Missing',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✓ Set' : '✗ Missing',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY 
      ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 30)}... (length: ${process.env.SUPABASE_SERVICE_ROLE_KEY.length})`
      : '✗ Missing',
  };
  
  // Validate NEXTAUTH_URL matches current domain
  const isValidUrl = envVars.NEXTAUTH_URL === 'https://strokelab.app';
  
  // Check if SUPABASE_SERVICE_ROLE_KEY looks like a valid JWT
  const isJwtFormat = process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('eyJ');
  
  // Check if Google credentials are valid format
  const isValidGoogleClientId = process.env.GOOGLE_CLIENT_ID?.includes('.apps.googleusercontent.com');
  const isValidGoogleClientSecret = (process.env.GOOGLE_CLIENT_SECRET?.length || 0) >= 20;
  
  return NextResponse.json({
    environment_variables: envVars,
    validation: {
      NEXTAUTH_URL_valid: isValidUrl,
      NEXTAUTH_URL_expected: 'https://strokelab.app',
      NEXTAUTH_URL_actual: envVars.NEXTAUTH_URL,
      SUPABASE_KEY_jwt_format: isJwtFormat,
      GOOGLE_CLIENT_ID_valid: isValidGoogleClientId,
      GOOGLE_CLIENT_SECRET_valid: isValidGoogleClientSecret,
      all_required_vars_present: Object.values(envVars).every(v => v !== '✗ Missing'),
    },
    current_url: typeof window !== 'undefined' ? window.location.href : 'server-side',
    message: 'If any validation fails, check your Vercel environment variables.',
  });
}
