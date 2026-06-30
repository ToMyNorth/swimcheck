'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Waves, Home, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 text-primary">
            <Waves className="h-12 w-12" />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Something went wrong</h1>
        <p className="mt-3 text-muted-foreground max-w-md mx-auto">
          We encountered an unexpected error. Our team has been notified. Please try again or return home.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/">
            <Button size="lg" className="gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="gap-2" onClick={reset}>
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
