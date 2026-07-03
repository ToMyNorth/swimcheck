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
      throw new Error('Lemon Squeezy is not configured. Please set environment variables.');
    }

    // Use direct HTTP API call instead of SDK
    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              custom: {
                user_id: session.user.id || '',
                user_email: session.user.email || '',
              },
            },
            product_options: {
              redirect_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
              receipt_link_url: `${process.env.NEXTAUTH_URL}/dashboard`,
            },
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: storeId,
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: variantId.toString(),
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lemon Squeezy API error:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return Response.json({ url: data.data.attributes.url });
  } catch (error) {
    console.error('Lemon Squeezy checkout error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
