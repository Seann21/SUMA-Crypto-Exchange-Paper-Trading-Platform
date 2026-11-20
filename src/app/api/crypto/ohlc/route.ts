import { NextRequest, NextResponse } from 'next/server';
import { getCryptoOHLC } from '@/lib/coingecko';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const coinId = searchParams.get('coinId') || 'bitcoin';
    const daysParam = searchParams.get('days') || '1';
    const days = parseInt(daysParam, 10) || 1;

    const ohlc = await getCryptoOHLC(coinId, days);

    return NextResponse.json({
      success: true,
      data: ohlc,
      coinId,
      days,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

