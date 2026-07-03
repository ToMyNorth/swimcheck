import type { Metadata } from 'next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'FAQ - Frequently Asked Questions | StrokeLab',
    description: 'Find answers to common questions about our AI swimming analysis tool.',
    alternates: { canonical: '/faq' },
  };
}

const faqs = [
  {
    question: 'What type of photos should I upload?',
    answer:
      'Side-view photos taken above water work best. Ensure good lighting and that your full body is visible. We recommend 1-3 photos for comprehensive analysis.',
  },
  {
    question: 'How accurate is the AI analysis?',
    answer:
      'Our AI uses MediaPipe Pose estimation, which provides 33 3D keypoints with high accuracy. For best results, use clear photos with minimal water splash obstruction.',
  },
  {
    question: 'Can I analyze videos instead of photos?',
    answer:
      'Currently, we support photo analysis only. Video analysis is coming in Phase 2.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes. We use Cloudflare R2 for secure image storage and never share your data with third parties. You can delete your analysis history at any time.',
  },
  {
    question: 'What swimming strokes are supported?',
    answer:
      'MVP supports freestyle (front crawl) only. Backstroke, breaststroke, and butterfly will be added in future updates.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Yes. You can cancel anytime from your dashboard. Your subscription will remain active until the end of the billing period.',
  },
];

export default function FAQPage() {
  return (
    <div className="py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about StrokeLab
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion className="w-full space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-border/60 rounded-lg px-4">
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <span className="font-medium text-foreground">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Still have questions?{' '}
            <a href="mailto:contact@strokelab.app" className="text-primary hover:underline font-medium">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
