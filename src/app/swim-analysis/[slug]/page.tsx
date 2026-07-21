import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Camera, CheckCircle2, ClipboardList, Waves } from 'lucide-react';
import {
  getSwimAnalysisPage,
  swimAnalysisPages,
} from '@/data/swimAnalysisPages';
import { buttonVariants } from '@/components/ui/button';

const baseUrl = 'https://strokelab.app';

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return swimAnalysisPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getSwimAnalysisPage(slug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/swim-analysis/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `/swim-analysis/${page.slug}`,
      siteName: 'StrokeLab',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
    },
  };
}

export default async function SwimAnalysisLandingPage({ params }: Props) {
  const { slug } = await params;
  const page = getSwimAnalysisPage(slug);
  if (!page) notFound();

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.h1,
    description: page.description,
    mainEntityOfPage: `${baseUrl}/swim-analysis/${page.slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'StrokeLab',
      url: baseUrl,
    },
  };

  return (
    <article className="bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <section className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Waves className="h-4 w-4" />
              AI swim technique review
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {page.h1}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              {page.description}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              {page.intent}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/analyze" className={buttonVariants({ size: 'lg' })}>
                Analyze a Photo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/analyze/video"
                className={buttonVariants({ variant: 'outline', size: 'lg' })}
              >
                Analyze a Video
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  Best upload setup
                </h2>
                <p className="text-sm text-muted-foreground">
                  Clear input creates better feedback.
                </p>
              </div>
            </div>
            <ul className="mt-6 space-y-3">
              {page.uploadTips.map((tip) => (
                <li key={tip} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">What StrokeLab checks</h2>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {page.scoringFocus.map((item) => (
                <div key={item} className="rounded-lg border border-border bg-card p-4 text-sm text-card-foreground">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">Good use cases</h2>
            <ul className="mt-6 space-y-3">
              {page.useCases.map((useCase) => (
                <li key={useCase} className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                  {useCase}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground">Questions swimmers ask</h2>
          <div className="mt-6 space-y-4">
            {page.faqs.map((faq) => (
              <div key={faq.question} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold text-card-foreground">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-primary/20 bg-primary/10 p-6 text-center">
            <h2 className="text-xl font-semibold text-foreground">
              Ready to review your swim form?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload one clear photo or a short clip and get focused feedback in minutes.
            </p>
            <Link href="/analyze" className={buttonVariants({ className: 'mt-5' })}>
              Start Analysis
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
