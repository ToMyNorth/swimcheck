import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const TEST_USER_EMAIL = 'a380816700norris@gmail.com';

async function checkSubscription() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    db: { schema: 'next_auth' },  // Use next_auth schema
  });

  try {
    console.log(`�� Checking subscription for user: ${TEST_USER_EMAIL}\n`);

    // Find the user in next_auth schema
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
    console.log(`✅ User ID: ${userId}`);
    console.log(`   Email: ${users[0].email}\n`);

    // Check subscription in next_auth schema
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error checking subscription:', error);
      return;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('⚠️  No subscription found for this user\n');
      console.log('💡 Tip: Make sure you are viewing the "next_auth" schema in Supabase Dashboard');
      console.log('   Current view shows "public" schema, but subscriptions are in "next_auth" schema');
      return;
    }

    console.log('📋 Subscription details:');
    subscriptions.forEach((sub, idx) => {
      console.log(`\nSubscription #${idx + 1}:`);
      console.log(`  ID: ${sub.id}`);
      console.log(`  Status: ${sub.status} ${sub.status === 'active' ? '✅' : '❌'}`);
      console.log(`  Created: ${sub.created_at}`);
      console.log(`  Updated: ${sub.updated_at}`);
      if (sub.current_period_end) {
        console.log(`  Period End: ${sub.current_period_end}`);
      }
    });

    console.log('\n✨ This user has unlimited access!');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkSubscription();
