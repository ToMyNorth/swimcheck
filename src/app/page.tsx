import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Waves, 
  Brain, 
  TrendingUp, 
  Upload, 
  Sparkles, 
  FileCheck, 
  Play,
  Activity,
  Target,
  Award
} from 'lucide-react';
import { SwimmingBackground } from '@/components/SwimmingBackground';

const features = [
  {
    icon: Waves,
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

const samples = [
  {
    image: '/images/examples/freestyle-side.jpg',
    title: 'Freestyle – Side View',
    description: 'Clear side angle showing full body position and arm entry.',
  },
  {
    image: '/images/examples/breaststroke.jpg',
    title: 'Breaststroke',
    description: 'Front or side view showing arm and leg coordination.',
  },
  {
    image: '/images/examples/video-thumbnail.jpg',
    title: 'Video Upload',
    description: '5–10 second clip from underwater or above water side angle.',
    isVideo: true,
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

// Swimming-related decorative icons for sections
const sectionIcons = {
  accuracy: Activity,
  precision: Target,
  achievement: Award,
};

export default function Home() {
  return (
    <>
      {/* Hero Section with Swimming Background */}
      <section className="relative overflow-hidden py-20 sm:py-28 min-h-[600px] flex items-center">
        {/* Dynamic swimming background */}
        <SwimmingBackground 
          videoUrl="/videos/hero-swimming.mp4"
          posterUrl="/images/hero-poster.jpg"
          fallbackImageUrl="/images/examples/freestyle-side.jpg"
          overlayOpacity={0.7}
        />
        
        {/* Content layer - positioned above background */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white drop-shadow-lg">
            AI-Powered Swimming{' '}
            <span className="text-cyan-300">Stroke Analysis</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-white/90 sm:text-xl drop-shadow-md">
            Upload your swimming photos and get instant feedback on your technique. Improve your form with personalized AI coaching.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/analyze">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all">
                Try Free — 3 Analyses/Month
              </Button>
            </Link>
            <Link href="/analyze/video">
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50">
                Upload Video
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28 bg-background relative overflow-hidden">
        {/* Subtle water ripple background pattern */}
        <div className="absolute inset-0 bg-[url('/patterns/water-ripple.svg')] opacity-5 pointer-events-none" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              Why StrokeLab?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional-grade analysis at your fingertips
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/60 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
                <CardContent className="pt-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-7 w-7" />
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
      <section className="py-20 sm:py-28 bg-secondary/40 relative overflow-hidden">
        {/* Decorative wave elements */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background to-transparent opacity-50" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent opacity-50" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to better swimming
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.step} className="relative text-center group">
                {/* Connecting line between steps (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                )}
                
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white font-bold text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  {step.step}
                </div>
                <div className="flex justify-center mb-3">
                  <step.icon className="h-9 w-9 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to Upload Section */}
      <section className="py-20 sm:py-28 bg-muted/30 relative overflow-hidden">
        {/* Decorative swimming lane lines */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-px bg-primary"
              style={{
                top: `${20 + i * 15}%`,
                left: 0,
              }}
            />
          ))}
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              What to Upload
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              See examples of photos and videos that work best for analysis
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {samples.map((sample) => (
              <Card key={sample.title} className="overflow-hidden border-border/60 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group">
                <div className="relative overflow-hidden">
                  <img
                    src={sample.image}
                    alt={sample.title + ' example'}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {sample.isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="h-7 w-7 text-primary ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  )}
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CardContent className="pt-5">
                  <h3 className="text-lg font-semibold text-foreground">{sample.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{sample.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/analyze">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all">
                Try It Now →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        {/* Gradient background with swimming theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-secondary" />
        
        {/* Decorative wave patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>
        
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white drop-shadow-lg">
            Ready to Improve Your Swimming?
          </h2>
          <p className="mt-4 text-lg text-white/90 drop-shadow-md">
            Join thousands of swimmers using AI to perfect their technique.
          </p>
          <div className="mt-10">
            <Link href="/auth/signin">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data: SoftwareApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'StrokeLab',
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

      {/* JSON-LD Structured Data: FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'How does StrokeLab work?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Upload your swimming photos, our AI analyzes your stroke using MediaPipe pose detection, and you receive personalized feedback in seconds.',
                },
              },
              {
                '@type': 'Question',
                name: 'What type of photos should I upload?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Side-view photos taken above water work best. Ensure good lighting and that your full body is visible. We recommend 1-3 photos for comprehensive analysis.',
                },
              },
              {
                '@type': 'Question',
                name: 'How accurate is the AI analysis?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Our AI uses MediaPipe Pose estimation, which provides 33 3D keypoints with high accuracy. For best results, use clear photos with minimal water splash obstruction.',
                },
              },
              {
                '@type': 'Question',
                name: 'What swimming strokes are supported?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'MVP supports freestyle (front crawl) only. Backstroke, breaststroke, and butterfly will be added in future updates.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is my data secure?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. We use Cloudflare R2 for secure image storage and never share your data with third parties. You can delete your analysis history at any time.',
                },
              },
            ],
          }),
        }}
      />

      {/* JSON-LD Structured Data: HowTo */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'How to Analyze Your Swimming Stroke with StrokeLab',
            step: [
              {
                '@type': 'HowToStep',
                position: 1,
                name: 'Upload Photo',
                text: 'Take a photo of your swimming from the side (above water). We recommend 1-3 photos for best results.',
              },
              {
                '@type': 'HowToStep',
                position: 2,
                name: 'AI Analysis',
                text: 'Our AI detects your body keypoints and evaluates your stroke against professional standards.',
              },
              {
                '@type': 'HowToStep',
                position: 3,
                name: 'Get Feedback',
                text: 'Receive a detailed report with scores, visual overlays, and personalized improvement suggestions.',
              },
            ],
          }),
        }}
      />
    </>
  );
}
