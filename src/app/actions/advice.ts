'use server';

import { generateAdvice, type SwimmingAdvice } from '@/lib/llm/advisor';
import type { StrokeScores } from '@/lib/analysis/scorer';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { saveAnalysis } from '@/lib/db/supabase';

/**
 * Server action: generate AI swimming advice and save to database.
 * Called directly from client components to avoid SSR timeout.
 */
export async function generateAndSaveAdvice(
  scores: StrokeScores
): Promise<SwimmingAdvice> {
  console.log('[action:generateAndSaveAdvice] scores:', JSON.stringify(scores));

  // 验证用户登录状态
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized: please sign in first');
  }

  // 带 8 秒超时的 AI 建议生成
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), 8000)
  );

  const advicePromise = generateAdvice(scores);

  const advice = await Promise.race([advicePromise, timeoutPromise]).catch(
    (err) => {
      console.warn('[action:generateAndSaveAdvice] fallback due to:', err.message);
      return {
        summary:
          '由于网络超时，暂时无法获取个性化建议。请检查网络连接后重试。',
        strengths: ['已完成基础分析'],
        weaknesses: [],
        recommendations: [
          {
            issue: '保持训练节奏',
            metric: '整体表现',
            currentScore: 70,
            targetScore: 80,
            explanation: '持续规律训练有助于提升技术稳定性',
            drill: '基础练习',
            howTo: '重复基础动作训练，关注动作规范',
          },
          {
            issue: '定期录制视频对比',
            metric: '动作一致性',
            currentScore: 65,
            targetScore: 75,
            explanation: '视频对比能帮助发现动作偏差',
            drill: '视频对比训练',
            howTo: '每周录制一次游泳视频，与标准动作对比',
          },
        ],
        encouragement: '坚持训练，你的技术正在稳步提升！',
      } as SwimmingAdvice;
    }
  );

  console.log('[action:generateAndSaveAdvice] advice generated');

  // 保存分析结果到数据库（scores + advice）
  try {
    const record = await saveAnalysis({
      userId: session.user.id,
      type: 'image',
      scores: scores as unknown as Record<string, number>,
      advice: advice as unknown as Record<string, unknown>,
    });
    console.log('[action:generateAndSaveAdvice] saved to DB, id:', record.id);
  } catch (dbError) {
    // 数据库保存失败不影响建议返回，仅记录日志
    console.error('[action:generateAndSaveAdvice] DB save failed:', dbError);
  }

  return advice;
}
