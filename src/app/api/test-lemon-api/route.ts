import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID;

  if (!apiKey || !storeId) {
    return NextResponse.json({
      error: 'Missing environment variables',
      hasApiKey: !!apiKey,
      hasStoreId: !!storeId,
    }, { status: 500 });
  }

  try {
    // Test the API by fetching stores
    const response = await fetch('https://api.lemonsqueezy.com/v1/stores', {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const data = await response.json();

    return NextResponse.json({
      success: response.ok,
      statusCode: response.status,
      statusText: response.statusText,
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
