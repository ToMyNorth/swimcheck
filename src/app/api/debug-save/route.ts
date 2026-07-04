import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        error: 'Missing environment variables',
        hasSupabaseUrl: !!supabaseUrl,
        hasServiceRoleKey: !!serviceRoleKey,
        serviceRoleKeyLength: serviceRoleKey?.length || 0,
      }, { status: 500 });
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Test 1: Check connection
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1);

    if (userError) {
      return NextResponse.json({
        error: 'Failed to query users table',
        details: userError,
      }, { status: 500 });
    }

    // Test 2: Try to insert a test analysis record
    const testUserId = 'test-user-' + Date.now();
    const { data: insertData, error: insertError } = await supabase
      .from('analyses')
      .insert({
        user_id: testUserId,
        video_url: 'https://example.com/test.jpg',
        scores: { bodyAlignment: 80, armEntryLeft: 90, armEntryRight: 85, headPosition: 75, bodyRoll: 70, symmetry: 95, overall: 83 },
        advice: { summary: 'Test advice', strengths: ['Good form'], weaknesses: ['Needs work'], recommendations: [], encouragement: 'Keep going!' },
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({
        error: 'Failed to insert test analysis',
        details: insertError,
        message: insertError.message,
        code: insertError.code,
      }, { status: 500 });
    }

    // Test 3: Clean up - delete the test record
    await supabase.from('analyses').delete().eq('user_id', testUserId);

    return NextResponse.json({
      success: true,
      message: 'All tests passed!',
      supabaseUrl: supabaseUrl.substring(0, 20) + '...',
      serviceRoleKeyLength: serviceRoleKey.length,
      testRecordId: insertData.id,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
