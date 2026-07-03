import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
  }
  
  try {
    // Use the EXACT same configuration as @auth/supabase-adapter
    const supabase = createClient(supabaseUrl, supabaseKey, {
      db: { schema: "next_auth" },
      global: { headers: { "X-Client-Info": "@auth/supabase-adapter" } },
      auth: { persistSession: false },
    });
    
    let result: any = {};
    
    // Query the information_schema to see actual column names
    const { data: columns, error: columnsError } = await supabase.rpc('get_columns', {
      schema_name: 'next_auth',
      table_name: 'users'
    });
    
    if (columnsError) {
      result.columnsQuery = { 
        success: false, 
        error: columnsError.message,
        code: columnsError.code
      };
    } else {
      result.columnsQuery = { 
        success: true, 
        columns: columns?.map((c: any) => c.column_name) || []
      };
    }
    
    // Alternative: Try to query users table directly with *
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      result.usersTable = { 
        success: false, 
        error: usersError.message,
        code: usersError.code,
        details: usersError.details,
        hint: usersError.hint
      };
    } else {
      result.usersTable = { 
        success: true, 
        count: users?.length || 0,
        sample: users?.[0] || null,
        columns: users?.[0] ? Object.keys(users[0]) : []
      };
    }
    
    // Check if email_verified exists
    if (users && users.length > 0) {
      result.hasEmailVerified = 'email_verified' in users[0];
      result.hasEmailVerifiedCamel = 'emailVerified' in users[0];
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
