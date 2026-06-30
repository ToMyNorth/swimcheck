import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  const session = await auth();
  
  return NextResponse.json({
    hasSession: !!session,
    user: session?.user || null,
    message: session ? 'Logged in' : 'Not logged in',
  });
}
