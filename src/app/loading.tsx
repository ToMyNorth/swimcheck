import { Waves } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <Waves className="h-16 w-16 animate-pulse text-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Loading...</p>
          <p className="mt-1 text-xs text-muted-foreground">Please wait a moment</p>
        </div>
      </div>
    </div>
  );
}
