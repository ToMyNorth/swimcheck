'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      '3 analyses per month',
      'Basic stroke scoring (3 metrics)',
      'Visual skeleton overlay',
      'Email support',
    ],
    cta: 'Get Started',
    href: '/analyze',
    popular: false,
    priceId: null,
  },
  {
    name: 'Basic',
    price: '$4.99',
    period: '/month',
    description: 'For serious swimmers',
    features: [
      'Unlimited analyses',
      'Full stroke scoring (5 metrics)',
      'AI-generated improvement suggestions',
      'Analysis history',
      'Priority support',
    ],
    cta: 'Subscribe',
    href: '/checkout?plan=basic',
    popular: true,
    priceId: 'price_basic_monthly', // Replace with actual Stripe Price ID
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'For competitive athletes',
    features: [
      'Everything in Basic',
      'Training plan recommendations',
      'Progress tracking & charts',
      'Export reports (PDF)',
      'Advanced analytics',
    ],
    cta: 'Subscribe',
    href: '/checkout?plan=pro',
    popular: false,
    priceId: 'price_pro_monthly', // Replace with actual Stripe Price ID
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string | null) => {
    if (!priceId) {
      // Free plan
      router.push('/analyze');
      return;
    }

    if (!session) {
      signIn('google', { callbackUrl: '/pricing' });
      return;
    }

    setLoading(priceId);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error('Checkout failed');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your swimming goals. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3 items-start">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col border-border/60 shadow-sm ${
                plan.popular ? 'ring-2 ring-primary scale-[1.02] shadow-lg' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="mt-1">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 pt-4">
                <div className="text-center">
                  <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-6">
                <Button
                  className="w-full"
                  size="lg"
                  disabled={loading === plan.priceId}
                  onClick={() => handleSubscribe(plan.priceId)}
                >
                  {loading === plan.priceId ? 'Processing...' : plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
