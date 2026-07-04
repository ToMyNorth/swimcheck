import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { getUserQuota } from '@/lib/db/supabase';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quota = await getUserQuota(session.user.id);
    return NextResponse.json(quota);
  } catch (error) {
    console.error('Failed to check quota:', error);
    return NextResponse.json({ error: 'Failed to check quota' }, { status: 500 });
  }
}
