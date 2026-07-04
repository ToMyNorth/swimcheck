import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    db: { schema: 'next_auth' },
  });

  // Find user by email in next_auth schema
  const userResponse = await supabase.from('users').select('id,email').eq('email', 'a380816700norris@gmail.com').maybeSingle();
  
  if (userResponse.error) {
    console.error('Error finding user:', userResponse.error);
    return;
  }

  if (!userResponse.data) {
    console.log('User not found');
    return;
  }

  const userId = userResponse.data.id;
  console.log(`Found user: ${userId}`);

  // Switch to public schema for analyses
  const supabasePublic = createClient(supabaseUrl, supabaseKey, {
    db: { schema: 'public' },
  });

  // Get all analyses for this user
  const analysesResponse = await supabasePublic.from('analyses').select('id,user_id,scores,created_at').eq('user_id', userId).order('created_at', { ascending: false });

  if (analysesResponse.error) {
    console.error('Error fetching analyses:', analysesResponse.error);
    return;
  }

  console.log(`\nTotal analyses: ${analysesResponse.data.length}`);

  let deletedCount = 0;
  for (const analysis of analysesResponse.data) {
    console.log(`ID: ${analysis.id} | Score: ${analysis.scores?.overall || 'N/A'} | Created: ${analysis.created_at}`);

    // Check if id is "temp-id" or invalid UUID
    if (analysis.id === 'temp-id' || analysis.id.length !== 36) {
      console.log(`  ️ INVALID ID FOUND!`);

      // Delete this record
      const deleteResponse = await supabasePublic.from('analyses').delete().eq('id', analysis.id);
      
      if (deleteResponse.error) {
        console.error(`  Error deleting:`, deleteResponse.error);
      } else {
        console.log(`  ✅ Deleted`);
        deletedCount++;
      }
    }
  }

  console.log(`\nDeleted ${deletedCount} invalid records`);
}

main().catch(console.error);
