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

    // Use SDK to create checkout
    const checkout = await createCheckout(storeId, variantId, {
      productOptions: {
        redirectUrl: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
        receiptLinkUrl: `${process.env.NEXTAUTH_URL}/dashboard`,
      },
      checkoutData: {
        custom: {
          user_id: (session.user as any).id || '',
          user_email: session.user.email || '',
        },
      },
    });

    if (checkout.error) {
      console.error('Lemon Squeezy checkout error:', checkout.error);
      throw new Error(`Checkout failed: ${checkout.error.message}`);
    }

    // Lemon Squeezy SDK returns JSON API format: checkout.data.data.attributes.url
    // @ts-ignore - Lemon Squeezy SDK type issue
    const checkoutUrl = checkout.data?.data?.attributes?.url;
    
    if (!checkoutUrl) {
      console.error('Missing checkout URL');
      throw new Error('Checkout URL is missing from response');
    }
    
    return Response.json({ url: checkoutUrl });
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
