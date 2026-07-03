import { createHmac } from 'crypto';
import { supabase } from '@/lib/db/supabase';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('x-signature');

  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  // Verify webhook signature
  const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('LEMON_SQUEEZY_WEBHOOK_SECRET is not configured');
  }

  const hmac = createHmac('sha256', webhookSecret);
  const computedSignature = hmac.update(body).digest('hex');

  if (signature !== computedSignature) {
    console.error('Invalid webhook signature');
    return new Response('Invalid signature', { status: 401 });
  }

  try {
    const event = JSON.parse(body);
    const eventName = event.meta?.event_name;

    console.log(`Lemon Squeezy webhook received: ${eventName}`);

    // Handle subscription events
    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      const subscription = event.data.attributes;
      const userId = subscription.custom_data?.user_id;
      const userEmail = subscription.custom_data?.user_email;

      if (!userId && !userEmail) {
        console.error('No user_id or user_email in subscription custom_data');
        return new Response('Missing user data', { status: 400 });
      }

      // Find user by ID or email
      let userQuery = supabase.from('users').select('*').limit(1);
      
      if (userId) {
        userQuery = userQuery.eq('id', userId);
      } else if (userEmail) {
        userQuery = userQuery.eq('email', userEmail);
      }

      const { data: users, error: userError } = await userQuery;

      if (userError || !users || users.length === 0) {
        console.error('User not found:', userError);
        return new Response('User not found', { status: 404 });
      }

      const user = users[0];

      // Update user subscription status
      const { error: updateError } = await supabase
        .from('users')
        .update({
          stripe_subscription_id: subscription.id.toString(),
          stripe_customer_id: subscription.customer_id.toString(),
          plan: subscription.variant_id === parseInt(process.env.NEXT_PUBLIC_LEMON_PRO_VARIANT_ID || '0') ? 'pro' : 'basic',
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to update user subscription:', updateError);
        return new Response('Update failed', { status: 500 });
      }

      console.log(`User ${user.id} subscription updated successfully`);
    }

    // Handle subscription cancellation
    if (eventName === 'subscription_cancelled') {
      const subscription = event.data.attributes;
      const userId = subscription.custom_data?.user_id;
      const userEmail = subscription.custom_data?.user_email;

      if (!userId && !userEmail) {
        return new Response('Missing user data', { status: 400 });
      }

      // Find and update user
      let userQuery = supabase.from('users').select('*').limit(1);
      
      if (userId) {
        userQuery = userQuery.eq('id', userId);
      } else if (userEmail) {
        userQuery = userQuery.eq('email', userEmail);
      }

      const { data: users } = await userQuery;

      if (users && users.length > 0) {
        await supabase
          .from('users')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', users[0].id);

        console.log(`User ${users[0].id} subscription cancelled`);
      }
    }

    return new Response('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
