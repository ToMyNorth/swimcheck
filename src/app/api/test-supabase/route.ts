import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 测试插入一个用户
    const testUser = {
      id: crypto.randomUUID(),
      email: 'test@example.com',
      email_verified: null,
      name: 'Test User',
      image: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('users')
      .insert(testUser)
      .select();
    
    if (error) {
      return NextResponse.json({ 
        status: 'error',
        message: error.message,
        code: error.code,
        details: error.details 
      }, { status: 500 });
    }
    
    // 删除测试数据
    await supabase.from('users').delete().eq('email', 'test@example.com');
    
    return NextResponse.json({ 
      status: 'success',
      message: 'Can insert and delete users',
      data 
    });
  } catch (err: any) {
    return NextResponse.json({ 
      status: 'exception',
      message: err.message,
      stack: err.stack 
    }, { status: 500 });
  }
}
