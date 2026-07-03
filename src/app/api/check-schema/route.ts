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
    
    // 检查所有 schemas
    const { data: schemas, error: schemasError } = await supabase.rpc('get_schemas');
    
    let result: any = {};
    
    if (schemasError) {
      result.schemas = { error: schemasError.message };
    } else {
      result.schemas = schemas;
    }
    
    // 尝试直接查询 next_auth.users 表
    try {
      const { data: users, error: usersError } = await supabase
        .schema('next_auth')
        .from('users')
        .select('*')
        .limit(1);
      
      if (usersError) {
        result.nextAuthUsers = { error: usersError.message, code: usersError.code };
      } else {
        result.nextAuthUsers = { success: true, count: users?.length || 0 };
      }
    } catch (err: any) {
      result.nextAuthUsers = { exception: err.message };
    }
    
    // 尝试查询 public.users 表（如果存在）
    try {
      const { data: publicUsers, error: publicUsersError } = await supabase
        .schema('public')
        .from('users')
        .select('*')
        .limit(1);
      
      if (publicUsersError) {
        result.publicUsers = { error: publicUsersError.message, code: publicUsersError.code };
      } else {
        result.publicUsers = { success: true, count: publicUsers?.length || 0 };
      }
    } catch (err: any) {
      result.publicUsers = { exception: err.message };
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
