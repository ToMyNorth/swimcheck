import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
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

    // Initialize Lemon Squeezy with API key
    const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
    const storeId = process.env.LEMON_SQUEEZY_STORE_ID;

    if (!apiKey || !storeId) {
      console.error('Missing environment variables:', {
        hasApiKey: !!apiKey,
        hasStoreId: !!storeId,
      });
      throw new Error('Lemon Squeezy is not configured. Please set environment variables.');
    }

    // Setup Lemon Squeezy SDK - this must be called before any API calls
    lemonSqueezySetup({
      apiKey: apiKey,
    });

    console.log('Creating checkout with:', {
      storeId,
      variantId,
      userId: session.user.id,
      userEmail: session.user.email,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      fullSessionUser: JSON.stringify(session.user),
    });

    // Use SDK to create checkout
    const checkout = await createCheckout(storeId, variantId, {
      customPrice: undefined,
      productOptions: {
        redirect_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
        receipt_link_url: `${process.env.NEXTAUTH_URL}/dashboard`,
      },
      checkoutOptions: undefined,
      checkoutData: {
        custom: {
          user_id: (session.user as any).id || '',
          user_email: session.user.email || '',
        },
      },
      expiresAt: undefined,
      preview: undefined,
      testMode: false,
    });

    if (checkout.error) {
      console.error('Lemon Squeezy checkout error:', {
        message: checkout.error.message,
        cause: checkout.error.cause,
      });
      throw new Error(`Checkout failed: ${checkout.error.message}`);
    }

    console.log('Checkout created successfully:', checkout.data?.attributes?.url);
    return Response.json({ url: checkout.data.attributes.url });
  } catch (error) {
    console.error('Lemon Squeezy checkout error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
