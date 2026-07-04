import { createClient } from '@supabase/supabase-js';

// Service role client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export { supabase };

export interface AnalysisRecord {
  id: string;
  user_id: string;
  video_url: string | null;
  scores: Record<string, number>;
  advice: Record<string, unknown> | null;
  created_at: string;
}

export interface SaveAnalysisInput {
  userId: string;
  type?: 'image' | 'video';
  imageUrl?: string | null;
  videoUrl?: string | null;
  scores: Record<string, number>;
  advice?: Record<string, unknown> | null;
}

export async function saveAnalysis(input: SaveAnalysisInput): Promise<AnalysisRecord> {
  // The analyses table only has video_url column; store whichever URL is provided there
  const url = input.videoUrl || input.imageUrl || null;

  const { data, error } = await supabase
    .from('analyses')
    .insert({
      user_id: input.userId,
      video_url: url,
      scores: input.scores,
      advice: input.advice || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as AnalysisRecord;
}

export async function getUserAnalyses(userId: string): Promise<AnalysisRecord[]> {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getUserQuota(userId: string): Promise<{
  used: number;
  limit: number;
  isPro: boolean;
}> {
  // Check if user has active subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, plan')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  const isPro = subscription?.status === 'active';
  const limit = isPro ? 9999 : 3; // Pro users unlimited, free users 3/month

  // Count analyses this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('analyses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString());

  return {
    used: count || 0,
    limit,
    isPro,
  };
}
