import { NextRequest, NextResponse } from 'next/server';
import { generateAdvice, type SwimmingAdvice } from '@/lib/llm/advisor';
import type { StrokeScores } from '@/lib/analysis/scorer';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { saveAnalysis } from '@/lib/db/supabase';

export async function POST(request: NextRequest) {
  try {
    const { scores, imageUrl } = await request.json();
    console.log('[/api/advice] Received scores:', JSON.stringify(scores));

    // 验证scores参数
    if (!scores || typeof scores !== 'object') {
      return NextResponse.json(
        { error: 'Invalid scores parameter' },
        { status: 400 }
      );
    }

    // 验证用户登录状态
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 带8秒超时的AI建议生成
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 8000)
    );

    const advicePromise = generateAdvice(scores as StrokeScores);

    const advice = await Promise.race([advicePromise, timeoutPromise]).catch(
      (err) => {
        console.warn('[/api/advice] Falling back due to:', err.message);
        // 返回fallback建议，字段与 SwimmingAdvice 类型匹配
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

    console.log('[/api/advice] Advice generated successfully');

    // 保存分析结果到数据库（scores + advice）
    try {
      const record = await saveAnalysis({
        userId: session.user.id,
        type: 'image',
        imageUrl: imageUrl || null,
        scores: scores as Record<string, number>,
        advice: advice as unknown as Record<string, unknown>,
      });
      console.log('[/api/advice] Analysis saved to DB, id:', record.id);
    } catch (dbError) {
      // 数据库保存失败不影响建议返回，仅记录日志
      console.error('[/api/advice] Failed to save analysis to DB:', dbError);
    }

    return NextResponse.json(advice as SwimmingAdvice);
  } catch (error) {
    console.error('[/api/advice] Error generating advice:', error);
    return NextResponse.json(
      { error: 'Failed to generate advice' },
      { status: 500 }
    );
  }
}
