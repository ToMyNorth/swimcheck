import Stripe from 'stripe';
import { auth } from '@/app/api/auth/[...nextauth]/route';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.startsWith('sk_test_your')) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY.');
  }
  return new Stripe(key);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { priceId } = await request.json();

    if (!priceId) {
      return new Response('Missing priceId', { status: 400 });
    }

    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      metadata: {
        userId: session.user.id || '',
      },
    });

    return Response.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
