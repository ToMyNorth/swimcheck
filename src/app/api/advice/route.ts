import { NextRequest, NextResponse } from 'next/server';
import { generateAdvice, type SwimmingAdvice } from '@/lib/llm/advisor';
import type { StrokeScores } from '@/lib/analysis/scorer';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { saveAnalysis, getAnalysisById } from '@/lib/db/supabase';

export async function POST(request: NextRequest) {
  try {
    const { scores, imageUrl, analysisId } = await request.json();
    console.log('[/api/advice] Received request:', { analysisId, hasScores: !!scores });

    // 如果有 analysisId，先检查数据库中是否已有 advice
    if (analysisId) {
      console.log('[/api/advice] Checking existing advice for ID:', analysisId);
      const existingAnalysis = await getAnalysisById(analysisId);
      
      if (existingAnalysis?.advice) {
        console.log('[/api/advice] Returning cached advice from DB');
        return NextResponse.json(existingAnalysis.advice as unknown as SwimmingAdvice);
      }
      console.log('[/api/advice] No cached advice found, generating new...');
    }

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

    // 带30秒超时的AI建议生成
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 30000)
    );

    const advicePromise = generateAdvice(scores as StrokeScores);

    const advice = await Promise.race([advicePromise, timeoutPromise]).catch(
      (err) => {
        console.warn('[/api/advice] Falling back due to:', err.message);
        // Return fallback advice matching SwimmingAdvice type
        return {
          summary:
            'Unable to generate personalized advice at this time. Please check your connection and try again.',
          strengths: ['Basic analysis completed'],
          weaknesses: [],
          recommendations: [
            {
              issue: 'Maintain training consistency',
              metric: 'Overall performance',
              currentScore: 70,
              targetScore: 80,
              explanation: 'Regular practice helps improve technique stability',
              drill: 'Fundamental drills',
              howTo: 'Repeat basic stroke movements with focus on proper form',
            },
            {
              issue: 'Record videos for comparison',
              metric: 'Stroke consistency',
              currentScore: 65,
              targetScore: 75,
              explanation: 'Video comparison helps identify form deviations',
              drill: 'Video review training',
              howTo: 'Record swimming videos weekly and compare with standard technique',
            },
          ],
          encouragement: 'Keep practicing! Your technique is steadily improving.',
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
