import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Test user email to grant unlimited access
const TEST_USER_EMAIL = 'a380816700norris@gmail.com';

async function grantUnlimitedAccess() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(' Missing environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    db: { schema: 'next_auth' },
  });

  try {
    console.log(`🔍 Looking for user with email: ${TEST_USER_EMAIL}`);

    // Find the user
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', TEST_USER_EMAIL)
      .limit(1);

    if (findError) {
      console.error('❌ Error finding user:', findError);
      process.exit(1);
    }

    if (!users || users.length === 0) {
      console.error('❌ User not found. Please log in first to create the account.');
      process.exit(1);
    }

    const userId = users[0].id;
    console.log(`✅ Found user: ${userId} (${users[0].email})`);

    // Check if subscription already exists
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingSub) {
      console.log('⚠️  Subscription already exists, updating...');
      
      // Update existing subscription to active status
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('❌ Error updating subscription:', updateError);
        process.exit(1);
      }

      console.log('✅ Successfully updated subscription to active!');
    } else {
      console.log(' Creating new subscription...');

      // Create new active subscription
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert([
          {
            id: crypto.randomUUID(),
            user_id: userId,
            status: 'active',
            current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

      if (insertError) {
        console.error('❌ Error creating subscription:', insertError);
        process.exit(1);
      }

      console.log('✅ Successfully created Pro subscription!');
    }

    console.log('\n🎉 Test user now has UNLIMITED access!');
    console.log('You can now analyze as many images/videos as you want.');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

grantUnlimitedAccess();
