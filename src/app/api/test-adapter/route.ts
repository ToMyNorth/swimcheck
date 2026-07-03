import { NextResponse } from 'next/server';
import { SupabaseAdapter } from '@auth/supabase-adapter';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
  }
  
  try {
    // 初始化 Adapter
    const adapter = SupabaseAdapter({
      url: supabaseUrl,
      secret: supabaseKey,
    });
    
    // 测试 getUserByEmail 方法
    const testEmail = 'test-adapter@example.com';
    let result: any = {};
    
    try {
      const user = await (adapter as any).getUserByEmail?.(testEmail);
      result.getUserByEmail = { success: true, user };
    } catch (err: any) {
      result.getUserByEmail = { 
        success: false, 
        error: err.message,
        stack: err.stack 
      };
    }
    
    // 测试 createUser 方法
    try {
      const newUser = await (adapter as any).createUser?.({
        email: testEmail,
        name: 'Test Adapter User',
        emailVerified: null,
        image: null,
      });
      result.createUser = { success: true, user: newUser };
      
      // 清理测试数据
      if (newUser?.id) {
        await (adapter as any).deleteUser?.(newUser.id);
        result.cleanup = { success: true };
      }
    } catch (err: any) {
      result.createUser = { 
        success: false, 
        error: err.message,
        stack: err.stack 
      };
    }
    
    return NextResponse.json({ 
      status: 'success',
      message: 'Adapter methods tested',
      results: result
    });
  } catch (err: any) {
    return NextResponse.json({ 
      status: 'error',
      message: err.message,
      stack: err.stack 
    }, { status: 500 });
  }
}
