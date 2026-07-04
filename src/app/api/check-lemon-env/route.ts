import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    lemonSqueezyConfig: {
      hasApiKey: !!process.env.LEMON_SQUEEZY_API_KEY,
      apiKeyLength: process.env.LEMON_SQUEEZY_API_KEY?.length || 0,
      apiKeyFirstChars: process.env.LEMON_SQUEEZY_API_KEY?.substring(0, 20) + '...',
      hasStoreId: !!process.env.LEMON_SQUEEZY_STORE_ID,
      storeId: process.env.LEMON_SQUEEZY_STORE_ID,
      hasWebhookSecret: !!process.env.LEMON_SQUEEZY_WEBHOOK_SECRET,
      basicVariantId: process.env.NEXT_PUBLIC_LEMON_BASIC_VARIANT_ID,
      proVariantId: process.env.NEXT_PUBLIC_LEMON_PRO_VARIANT_ID,
    },
  });
}
