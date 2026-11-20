import { NextResponse } from 'next/server';
import { getCryptoMarkets } from '@/lib/coingecko';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const markets = await getCryptoMarkets();
    return NextResponse.json({
      success: true,
      data: markets,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

