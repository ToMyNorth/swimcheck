import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
  }
  
  try {
    // 使用与 @auth/supabase-adapter 相同的配置
    const supabase = createClient(supabaseUrl, supabaseKey, {
      db: { schema: "next_auth" },
      global: { headers: { "X-Client-Info": "test-client" } },
      auth: { persistSession: false },
    });
    
    let result: any = {};
    
    // 测试查询 users 表
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (usersError) {
        result.usersQuery = { 
          success: false, 
          error: usersError.message, 
          code: usersError.code,
          details: usersError.details,
          hint: usersError.hint
        };
      } else {
        result.usersQuery = { 
          success: true, 
          count: users?.length || 0,
          sample: users 
        };
      }
    } catch (err: any) {
      result.usersQuery = { 
        exception: err.message,
        stack: err.stack 
      };
    }
    
    // 测试插入用户
    try {
      const testUser = {
        id: crypto.randomUUID(),
        email: 'test-schema@example.com',
        name: 'Test Schema User',
        emailVerified: null,
        image: null,
      };
      
      const { data: inserted, error: insertError } = await supabase
        .from('users')
        .insert(testUser)
        .select();
      
      if (insertError) {
        result.insertUser = { 
          success: false, 
          error: insertError.message, 
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        };
      } else {
        result.insertUser = { 
          success: true, 
          user: inserted 
        };
        
        // 清理测试数据
        await supabase.from('users').delete().eq('email', 'test-schema@example.com');
        result.cleanup = { success: true };
      }
    } catch (err: any) {
      result.insertUser = { 
        exception: err.message,
        stack: err.stack 
      };
    }
    
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ 
      status: 'error',
      message: err.message,
      stack: err.stack 
    }, { status: 500 });
  }
}
