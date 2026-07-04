import Link from 'next/link';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Waves, Home, ArrowLeft, Video } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description:
    'The page you are looking for does not exist. Return to StrokeLab homepage or try our swimming stroke analysis tools.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 text-primary">
            <Waves className="h-12 w-12" />
          </div>
        </div>
        <h1 className="text-6xl font-extrabold tracking-tight text-foreground">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-foreground">Page Not Found</h2>
        <p className="mt-3 text-muted-foreground max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/">
            <Button size="lg" className="gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Link href="/analyze">
            <Button variant="outline" size="lg" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Analyze Stroke
            </Button>
          </Link>
          <Link href="/analyze/video">
            <Button variant="outline" size="lg" className="gap-2">
              <Video className="h-4 w-4" />
              Video Analysis
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
