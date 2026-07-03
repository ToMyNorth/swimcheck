import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { auth } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { variantId } = await request.json();

    if (!variantId) {
      return new Response('Missing variantId', { status: 400 });
    }

    // Initialize Lemon Squeezy
    const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
    const apiKey = process.env.LEMON_SQUEEZY_API_KEY;

    if (!storeId || !apiKey) {
      throw new Error('Lemon Squeezy is not configured. Please set environment variables.');
    }

    // Create checkout session
    const checkout = await createCheckout(storeId, variantId, {
      checkoutData: {
        custom: {
          user_id: session.user.id || '',
          user_email: session.user.email || '',
        },
      },
      productOptions: {
        redirectUrl: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
        receiptLinkUrl: `${process.env.NEXTAUTH_URL}/dashboard`,
      },
    });

    if (checkout.error) {
      console.error('Lemon Squeezy checkout error:', checkout.error);
      return new Response(checkout.error.message || 'Checkout failed', { status: 500 });
    }

    // @ts-ignore - Lemon Squeezy SDK type issue
    return Response.json({ url: checkout.data?.attributes?.url });
  } catch (error) {
    console.error('Lemon Squeezy checkout error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
