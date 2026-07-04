import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { saveAnalysis, getUserQuota } from '@/lib/db/supabase';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check quota before saving
    const quota = await getUserQuota(session.user.id);
    if (!quota.isPro && quota.used >= quota.limit) {
      return NextResponse.json({ error: 'Quota exceeded', quota }, { status: 403 });
    }

    const body = await req.json();
    const { type, imageUrl, videoUrl, scores, advice } = body;

    const record = await saveAnalysis({
      userId: session.user.id,
      type: type || 'image',
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
      scores,
      advice,
    });

    // Return updated quota
    const newQuota = await getUserQuota(session.user.id);
    return NextResponse.json({ success: true, record, quota: newQuota });
  } catch (error) {
    console.error('Failed to save analysis:', error);
    return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 });
  }
}
