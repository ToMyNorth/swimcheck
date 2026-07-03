import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
  }
  
  try {
    // Use admin client to query information_schema
    const supabase = createClient(supabaseUrl, supabaseKey, {
      db: { schema: "information_schema" },
      auth: { persistSession: false },
    });
    
    // Query column names for users table in next_auth schema
    const { data: columns, error } = await supabase.rpc('get_columns', {
      schema_name: 'next_auth',
      table_name: 'users'
    });
    
    if (error) {
      // Fallback: try direct query
      const fallbackSupabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      });
      
      const { data: result, error: fallbackError } = await fallbackSupabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (fallbackError) {
        return NextResponse.json({ 
          error: 'Failed to query users table',
          message: fallbackError.message,
          code: fallbackError.code
        }, { status: 500 });
      }
      
      if (result && result.length > 0) {
        return NextResponse.json({
          message: 'Users table columns',
          columns: Object.keys(result[0]),
          sample: result[0]
        });
      }
      
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }
    
    return NextResponse.json({ columns });
  } catch (err: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: err.message, 
      stack: err.stack 
    }, { status: 500 });
  }
}
