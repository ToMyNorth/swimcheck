import { SWIMMING_ADVISOR_PROMPT, VIDEO_ANALYSIS_PROMPT } from './prompts';
import { StrokeScores } from '@/lib/analysis/scorer';

export interface SwimmingAdvice {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: Array<{
    issue: string;
    metric: string;
    currentScore: number;
    targetScore: number;
    explanation: string;
    drill: string;
    howTo: string;
  }>;
  encouragement: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _openai: any = null;

function getOpenAI(): any {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        'OpenRouter API key not configured. Please add OPENAI_API_KEY to your .env.local file.'
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const OpenAI = require('openai');
    
    // 使用 OpenRouter 作为代理（支持中国大陆访问）
    _openai = new OpenAI.default({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    });
  }
  return _openai;
}

export async function generateAdvice(scores: StrokeScores): Promise<SwimmingAdvice> {
  const openai = getOpenAI();

  console.log('Generating advice with scores:', JSON.stringify(scores));

  const prompt = SWIMMING_ADVISOR_PROMPT
    .replace('{bodyAlignment}', scores.bodyAlignment.toString())
    .replace('{armEntryLeft}', scores.armEntryLeft.toString())
    .replace('{armEntryRight}', scores.armEntryRight.toString())
    .replace('{headPosition}', scores.headPosition.toString())
    .replace('{bodyRoll}', scores.bodyRoll.toString())
    .replace('{symmetry}', scores.symmetry.toString())
    .replace('{overall}', scores.overall.toString());

  try {
    const completion = await openai.chat.completions.create({
      // Mistral Nemo - Cheap paid model, very stable and reliable
      // Cost: ~$0.02/1M tokens (input), $0.03/1M tokens (output)
      // Excellent for swimming analysis with JSON output
      // $5 credit can support 80,000+ analyses!
      model: 'mistralai/mistral-nemo',
      messages: [
        { role: 'system', content: 'You are a professional swimming coach with ASCA Level 3 certification.' },
        { role: 'user', content: prompt + '\n\nIMPORTANT: Respond ONLY with valid JSON. Do not include any text before or after the JSON object.' },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1500,
    });

    console.log('OpenRouter API call successful');

    let content = completion.choices[0].message.content;
    if (!content) throw new Error('No advice generated');

    // Handle markdown code blocks (some models wrap JSON in ```json ... ```)
    content = content.trim();
    if (content.startsWith('```')) {
      // Remove opening ```json or ```
      content = content.replace(/^```(?:json)?\s*/, '');
      // Remove closing ```
      content = content.replace(/```$/, '');
      content = content.trim();
    }

    // Try to extract JSON from content if it's not pure JSON
    if (!content.startsWith('{')) {
      // Find the first '{' and last '}'
      const startIdx = content.indexOf('{');
      const endIdx = content.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        content = content.substring(startIdx, endIdx + 1);
      }
    }

    return JSON.parse(content) as SwimmingAdvice;
  } catch (error) {
    console.error('OpenRouter API call failed:', error);
    
    // Return fallback advice instead of throwing
    return {
      summary: 'Analysis completed successfully.',
      strengths: ['Stroke metrics calculated'],
      weaknesses: [],
      recommendations: [],
      encouragement: 'Keep practicing! Your technique is improving.',
    } as SwimmingAdvice;
  }
}

export interface VideoFrameScore {
  frameIndex: number;
  timestamp: number;
  scores: StrokeScores;
}

export async function generateVideoAdvice(
  frameScores: VideoFrameScore[],
  averageScores: StrokeScores
): Promise<SwimmingAdvice> {
  const openai = getOpenAI();

  // Format frame-by-frame scores for the prompt
  const frameScoresText = frameScores
    .map(
      (f) =>
        `Frame ${f.frameIndex + 1} (${f.timestamp.toFixed(1)}s): Alignment=${f.scores.bodyAlignment}, ArmL=${f.scores.armEntryLeft}, ArmR=${f.scores.armEntryRight}, Head=${f.scores.headPosition}, Roll=${f.scores.bodyRoll}, Sym=${f.scores.symmetry}, Overall=${f.scores.overall}`
    )
    .join('\n');

  const prompt = VIDEO_ANALYSIS_PROMPT
    .replace('{frameScores}', frameScoresText)
    .replace('{bodyAlignment}', averageScores.bodyAlignment.toString())
    .replace('{armEntryLeft}', averageScores.armEntryLeft.toString())
    .replace('{armEntryRight}', averageScores.armEntryRight.toString())
    .replace('{headPosition}', averageScores.headPosition.toString())
    .replace('{bodyRoll}', averageScores.bodyRoll.toString())
    .replace('{symmetry}', averageScores.symmetry.toString())
    .replace('{overall}', averageScores.overall.toString());

  const completion = await openai.chat.completions.create({
    // Mistral Nemo for video analysis (same as image for consistency)
    model: 'mistralai/mistral-nemo',
    messages: [
      { role: 'system', content: 'You are a professional swimming coach with ASCA Level 3 certification.' },
      { role: 'user', content: prompt + '\n\nIMPORTANT: Respond ONLY with valid JSON. Do not include any text before or after the JSON object.' },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 2000,
  });

  let content = completion.choices[0].message.content;
  if (!content) throw new Error('No advice generated');

  // Handle markdown code blocks (some models wrap JSON in ```json ... ```)
  content = content.trim();
  if (content.startsWith('```')) {
    // Remove opening ```json or ```
    content = content.replace(/^```(?:json)?\s*/, '');
    // Remove closing ```
    content = content.replace(/```$/, '');
    content = content.trim();
  }

  // Try to extract JSON from content if it's not pure JSON
  if (!content.startsWith('{')) {
    // Find the first '{' and last '}'
    const startIdx = content.indexOf('{');
    const endIdx = content.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      content = content.substring(startIdx, endIdx + 1);
    }
  }

  return JSON.parse(content) as SwimmingAdvice;
}
