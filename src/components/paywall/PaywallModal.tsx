'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaywallModal({ open, onOpenChange }: PaywallModalProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>You've Used Your Free Analyses</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            You've used all 3 free analyses this month. Upgrade to Pro to unlock unlimited analyses and advanced features.
          </p>
          <div className="space-y-2">
            <h4 className="font-medium">Pro Benefits:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">Unlimited stroke analyses</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">AI-generated improvement suggestions</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">Training plan recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">Progress tracking & charts</span>
              </li>
            </ul>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={() => router.push('/pricing')} className="flex-1">
              View Plans
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
