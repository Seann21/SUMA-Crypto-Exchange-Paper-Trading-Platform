export interface CryptoAsset {
  id: string; // e.g., 'bitcoin'
  symbol: string; // e.g., 'BTC'
  name: string; // e.g., 'Bitcoin'
  pair: string; // e.g., 'BTC/IDR'
  current_price: number; // in IDR
  price_change_24h: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  sparkline_in_7d?: {
    price: number[];
  };
  image?: string;
  last_updated?: string;
}

export interface CandlestickData {
  time: number | string; // Unix timestamp in seconds or string date
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
  depthPercentage: number;
}

export interface TradeFeedItem {
  id: string;
  price: number;
  amount: number;
  time: string;
  type: 'buy' | 'sell';
}

