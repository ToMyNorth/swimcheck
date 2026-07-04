import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing & Plans | StrokeLab',
  description: 'Choose the right plan for your swimming improvement journey.',
  alternates: { canonical: '/pricing' },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}

      {/* JSON-LD Structured Data: Product / Offers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'StrokeLab Pro',
            description:
              'AI-powered swimming stroke analysis with detailed scoring and personalized coaching tips',
            brand: {
              '@type': 'Brand',
              name: 'StrokeLab',
            },
            offers: [
              {
                '@type': 'Offer',
                name: 'Free',
                price: '0',
                priceCurrency: 'USD',
                description: '3 analyses per month with basic stroke scoring and visual skeleton overlay',
              },
              {
                '@type': 'Offer',
                name: 'Basic',
                price: '4.99',
                priceCurrency: 'USD',
                description:
                  'Unlimited analyses with full 5-metric scoring, AI suggestions, and history tracking',
              },
              {
                '@type': 'Offer',
                name: 'Pro',
                price: '9.99',
                priceCurrency: 'USD',
                description:
                  'Everything in Basic plus training plans, progress charts, PDF reports, and advanced analytics',
              },
            ],
          }),
        }}
      />
    </>
  );
}
