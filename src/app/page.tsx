import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Brain, TrendingUp, Upload, Sparkles, FileCheck } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Instant Analysis',
    description:
      'Get detailed feedback on your stroke in seconds. Our AI analyzes 5 key metrics including body alignment, arm entry angle, and head position.',
  },
  {
    icon: Brain,
    title: 'Personalized Coaching',
    description:
      'Receive tailored improvement suggestions powered by advanced AI. Learn exactly what to fix and how to fix it.',
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    description:
      'Save your analysis history and visualize your improvement over time. See how your technique evolves with each session.',
  },
];

const steps = [
  {
    icon: Upload,
    step: '1',
    title: 'Upload Photo',
    description:
      'Take a photo of your swimming from the side (above water). We recommend 1-3 photos for best results.',
  },
  {
    icon: Sparkles,
    step: '2',
    title: 'AI Analysis',
    description:
      'Our AI detects your body keypoints and evaluates your stroke against professional standards.',
  },
  {
    icon: FileCheck,
    step: '3',
    title: 'Get Feedback',
    description:
      'Receive a detailed report with scores, visual overlays, and personalized improvement suggestions.',
  },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent/40 via-background to-background py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground">
            AI-Powered Swimming{' '}
            <span className="text-primary">Stroke Analysis</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
            Upload your swimming photos and get instant feedback on your technique. Improve your form with personalized AI coaching.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/analyze">
              <Button size="lg">Try Free — 3 Analyses/Month</Button>
            </Link>
            <Link href="/analyze/video">
              <Button size="lg" variant="outline">Upload Video</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              Why SwimCheck?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional-grade analysis at your fingertips
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-28 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to better swimming
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.step} className="relative text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4">
                  {step.step}
                </div>
                <div className="flex justify-center mb-3">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-background to-accent/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            Ready to Improve Your Swimming?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of swimmers using AI to perfect their technique.
          </p>
          <div className="mt-10">
            <Link href="/auth/signin">
              <Button size="lg">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'SwimCheck',
            applicationCategory: 'SportsApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            description: 'AI-powered swimming stroke analysis tool',
          }),
        }}
      />
    </>
  );
}
