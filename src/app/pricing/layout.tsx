import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing & Plans | StrokeLab',
  description: 'Choose the right plan for your swimming improvement journey.',
  alternates: { canonical: '/pricing' },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
