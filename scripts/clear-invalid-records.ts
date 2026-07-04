import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const TEST_USER_EMAIL = 'a380816700norris@gmail.com';

async function clearInvalidRecords() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    db: { schema: 'next_auth' },
  });

  try {
    console.log(` Finding user: ${TEST_USER_EMAIL}\n`);

    // Find the user
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .eq('email', TEST_USER_EMAIL)
      .limit(1);

    if (!users || users.length === 0) {
      console.error(' User not found');
      return;
    }

    const userId = users[0].id;
    console.log(`✅ User ID: ${userId}\n`);

    // Check for invalid records (non-UUID IDs) in public.analyses
    console.log('🔍 Checking for invalid records...\n');
    
    const { data: allRecords, error: fetchError } = await supabase
      .schema('public')
      .from('analyses')
      .select('*')
      .eq('user_id', userId);

    if (fetchError) {
      console.error('❌ Error fetching records:', fetchError);
      return;
    }

    if (!allRecords || allRecords.length === 0) {
      console.log('ℹ️  No analysis records found for this user\n');
      return;
    }

    console.log(`Found ${allRecords.length} total records:\n`);
    
    // Filter invalid records (those with non-UUID IDs)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const invalidRecords = allRecords.filter(record => !uuidRegex.test(record.id));
    const validRecords = allRecords.filter(record => uuidRegex.test(record.id));

    console.log(`  Valid records (UUID): ${validRecords.length}`);
    console.log(`  Invalid records (non-UUID): ${invalidRecords.length}\n`);

    if (invalidRecords.length > 0) {
      console.log('❌ Invalid records to delete:');
      invalidRecords.forEach((record, idx) => {
        console.log(`  ${idx + 1}. ID: "${record.id}" | Created: ${record.created_at}`);
      });
      console.log();

      // Delete invalid records
      console.log('🗑️  Deleting invalid records...');
      
      for (const record of invalidRecords) {
        const { error: deleteError } = await supabase
          .schema('public')
          .from('analyses')
          .delete()
          .eq('id', record.id);

        if (deleteError) {
          console.error(`  ❌ Failed to delete record "${record.id}":`, deleteError);
        } else {
          console.log(`  ✅ Deleted record "${record.id}"`);
        }
      }

      console.log('\n✨ All invalid records deleted!');
      console.log(' Please refresh Dashboard and upload a new photo to test.\n');
    } else {
      console.log('✅ No invalid records found. All records have valid UUIDs.\n');
    }

    // Show valid records
    if (validRecords.length > 0) {
      console.log('📋 Valid records:');
      validRecords.forEach((record, idx) => {
        console.log(`  ${idx + 1}. ID: ${record.id} | Score: ${record.scores?.overall ?? 'N/A'} | Created: ${record.created_at}`);
      });
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

clearInvalidRecords();
