import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  let dbTest: { status: string; error?: string | null; code?: string; message?: string; count?: number } = { 
    status: 'not_tested', 
    error: null
  };
  
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // 测试查询 users 表
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (usersError) {
        dbTest = { 
          status: 'error', 
          error: usersError.message,
          code: usersError.code 
        };
      } else {
        dbTest = { 
          status: 'success', 
          message: 'Can access users table',
          count: users?.length || 0
        };
      }
    } catch (err: any) {
      dbTest = { 
        status: 'exception', 
        error: err.message 
      };
    }
  }
  
  return NextResponse.json({
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✓ Set' : '✗ Missing',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Missing',
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    SUPABASE_SERVICE_ROLE_KEY: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : '✗ Missing',
    database_test: dbTest,
  });
}
