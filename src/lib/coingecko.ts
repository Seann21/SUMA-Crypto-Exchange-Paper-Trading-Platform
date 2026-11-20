import { CryptoAsset, CandlestickData } from '@/types/crypto';
import { DEFAULT_PAIRS } from './constants';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const API_KEY = process.env.COINGECKO_API_KEY || process.env.NEXT_PUBLIC_COINGECKO_API_KEY || '';

// Simple in-memory cache to prevent CoinGecko rate limiting
let marketsCache: { data: CryptoAsset[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 25 * 1000; // 25 seconds cache

/**
 * Fetch live market prices for BTC, ETH, and SOL in IDR
 */
export async function getCryptoMarkets(): Promise<CryptoAsset[]> {
  const now = Date.now();
  if (marketsCache && now - marketsCache.timestamp < CACHE_TTL_MS) {
    return marketsCache.data;
  }

  try {
    const url = `${COINGECKO_BASE_URL}/coins/markets?vs_currency=idr&ids=bitcoin,ethereum,solana&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (API_KEY) {
      headers['x-cg-demo-api-key'] = API_KEY;
    }

    const response = await fetch(url, {
      headers,
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      console.warn(`CoinGecko markets returned ${response.status}: ${response.statusText}. Using fallback data.`);
      return DEFAULT_PAIRS;
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return DEFAULT_PAIRS;
    }

    const mapped: CryptoAsset[] = data.map((item: any) => ({
      id: item.id,
      symbol: item.symbol.toUpperCase(),
      name: item.name,
      pair: `${item.symbol.toUpperCase()}/IDR`,
      current_price: item.current_price,
      price_change_24h: item.price_change_24h || 0,
      price_change_percentage_24h: item.price_change_percentage_24h || 0,
      high_24h: item.high_24h || item.current_price * 1.03,
      low_24h: item.low_24h || item.current_price * 0.97,
      total_volume: item.total_volume || 0,
      image: item.image,
      sparkline_in_7d: item.sparkline_in_7d,
      last_updated: item.last_updated,
    }));

    marketsCache = { data: mapped, timestamp: now };
    return mapped;
  } catch (error) {
    console.error('Error fetching CoinGecko markets:', error);
    return DEFAULT_PAIRS;
  }
}

/**
 * Fetch OHLC candlestick data for TradingView Lightweight Charts
 * @param coinId e.g. "bitcoin", "ethereum", "solana"
 * @param days e.g. 1, 7, 30
 */
export async function getCryptoOHLC(coinId: string = 'bitcoin', days: number = 1): Promise<CandlestickData[]> {
  try {
    const url = `${COINGECKO_BASE_URL}/coins/${coinId}/ohlc?vs_currency=idr&days=${days}`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (API_KEY) {
      headers['x-cg-demo-api-key'] = API_KEY;
    }

    const response = await fetch(url, {
      headers,
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.warn(`CoinGecko OHLC returned ${response.status}. Generating synthetic candles.`);
      return generateSyntheticCandles(coinId, days);
    }

    const rawData = await response.json();
    if (!Array.isArray(rawData) || rawData.length === 0) {
      return generateSyntheticCandles(coinId, days);
    }

    // CoinGecko OHLC format: [ [time_ms, open, high, low, close], ... ]
    const candles: CandlestickData[] = rawData.map((item: [number, number, number, number, number]) => ({
      time: Math.floor(item[0] / 1000), // convert to seconds for Lightweight Charts
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
    }));

    return candles;
  } catch (error) {
    console.error('Error fetching CoinGecko OHLC:', error);
    return generateSyntheticCandles(coinId, days);
  }
}

/**
 * High-fidelity fallback / minute-candle generator when CoinGecko API is offline or rate-limited
 */
export function generateSyntheticCandles(coinId: string, days: number = 1): CandlestickData[] {
  const baseAsset = DEFAULT_PAIRS.find(p => p.id === coinId) || DEFAULT_PAIRS[0];
  let current = baseAsset.current_price;
  
  // Total bars based on days
  const totalBars = days === 1 ? 96 : 140; // 15-min bars for 1 day, or hourly for 7 days
  const stepSeconds = (days * 86400) / totalBars;
  const now = Math.floor(Date.now() / 1000);
  const startTime = now - (days * 86400);

  const candles: CandlestickData[] = [];
  let price = current * (1 - (baseAsset.price_change_percentage_24h / 100) * 0.7);

  for (let i = 0; i < totalBars; i++) {
    const time = startTime + (i * stepSeconds);
    const volatility = price * 0.004; // 0.4% per step
    const change = (Math.random() - 0.48) * volatility;
    const open = price;
    const close = Math.round(open + change);
    const high = Math.round(Math.max(open, close) + Math.random() * volatility * 0.8);
    const low = Math.round(Math.min(open, close) - Math.random() * volatility * 0.8);

    candles.push({
      time,
      open,
      high,
      low,
      close,
      volume: Math.round(Math.random() * 50 + 10),
    });

    price = close;
  }

  // Ensure last candle closes near current live price
  if (candles.length > 0) {
    candles[candles.length - 1].close = current;
  }

  return candles;
}

