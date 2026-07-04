import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

  if (!apiKey) {
    return NextResponse.json({
      error: 'Missing OPENAI_API_KEY',
    }, { status: 500 });
  }

  try {
    // Test the API by making a simple completion request
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://strokelab.app',
        'X-Title': 'StrokeLab',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say hello!' },
        ],
        max_tokens: 50,
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      success: response.ok,
      statusCode: response.status,
      statusText: response.statusText,
      baseUrl,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey.length,
      data: response.ok ? data : null,
      error: !response.ok ? data : null,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Request failed',
      message: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
