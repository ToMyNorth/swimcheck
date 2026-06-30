import { auth } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { getUserAnalyses, getUserQuota } from '@/lib/db/supabase';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { BarChart3, LogOut, CreditCard } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');
  if (!session.user.id) redirect('/auth/signin');

  let analyses: Awaited<ReturnType<typeof getUserAnalyses>> = [];
  let quota = { used: 0, limit: 3, isPro: false };

  try {
    analyses = await getUserAnalyses(session.user.id);
    quota = await getUserQuota(session.user.id);
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    // Continue with defaults - tables may not exist yet
  }

  const usagePercent = Math.min((quota.used / quota.limit) * 100, 100);

  return (
    <div className="max-w-4xl mx-auto p-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {session.user.name || session.user.email}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {quota.isPro ? 'Pro Member' : 'Free Plan'} • {quota.used}/{quota.limit === 9999 ? '∞' : quota.limit} analyses this month
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/pricing">
            <Button variant="outline" size="sm" className="gap-2">
              <CreditCard className="h-4 w-4" />
              {quota.isPro ? 'Manage Plan' : 'Upgrade'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Quota Card */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Your Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-sm text-muted-foreground">
                {quota.isPro ? 'Unlimited Analyses' : 'Free Analyses This Month'}
              </p>
              <p className="text-2xl font-bold mt-1">
                {quota.used} / {quota.limit === 9999 ? '∞' : quota.limit}
              </p>
            </div>
            {quota.used >= quota.limit && !quota.isPro && (
              <Link href="/pricing" className={buttonVariants()}>
                Upgrade to Pro
              </Link>
            )}
          </div>
          {!quota.isPro && (
            <Progress value={usagePercent} className="h-2" />
          )}
          {quota.isPro && (
            <div className="text-sm text-emerald-600 font-medium">
              ✓ Pro plan active — unlimited analyses
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Analysis History</CardTitle>
        </CardHeader>
        <CardContent>
          {analyses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No analyses yet. Upload your first swimming photo to get started!
              </p>
              <Link href="/analyze" className={buttonVariants()}>
                Analyze Your First Photo
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(analysis.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Overall Score:{' '}
                      <span className="font-semibold text-foreground">
                        {analysis.scores?.overall ?? 'N/A'}
                      </span>
                      /100
                    </p>
                  </div>
                  <Link
                    href={`/report/${analysis.id}?scores=${encodeURIComponent(JSON.stringify(analysis.scores))}`}
                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                  >
                    View Report
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
