import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const TEST_USER_EMAIL = 'a380816700norris@gmail.com';

async function clearTestData() {
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
    console.log(`🔍 Finding user: ${TEST_USER_EMAIL}\n`);

    // Find the user
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .eq('email', TEST_USER_EMAIL)
      .limit(1);

    if (!users || users.length === 0) {
      console.error('❌ User not found');
      return;
    }

    const userId = users[0].id;
    console.log(`✅ Found user: ${userId}\n`);

    // Delete all analyses for this user (in public schema)
    console.log('🗑️  Deleting old analyses...');
    const { error: deleteError } = await supabase
      .schema('public')
      .from('analyses')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('❌ Error deleting analyses:', deleteError);
      return;
    }

    console.log('✅ All old analyses deleted!\n');
    console.log('💡 Next steps:');
    console.log('   1. Refresh your Dashboard page');
    console.log('   2. Upload a new swimming photo');
    console.log('   3. Click "View Report" - it should work now!');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

clearTestData();
