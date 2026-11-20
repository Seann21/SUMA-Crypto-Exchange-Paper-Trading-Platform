export type OrderType = 'market' | 'limit';
export type OrderSide = 'buy' | 'sell';
export type OrderStatus = 'filled' | 'pending' | 'cancelled';

export interface Order {
  id: string;
  pair: string; // e.g. "BTC/IDR"
  assetId: string; // e.g. "bitcoin"
  side: OrderSide;
  type: OrderType;
  price: number; // Execution price or target limit price
  amount: number; // Crypto quantity
  totalIdr: number; // IDR amount
  feeIdr: number;
  status: OrderStatus;
  createdAt: number;
  filledAt?: number;
}

export interface AssetHolding {
  symbol: string;
  name: string;
  amount: number;
  avgBuyPriceIdr: number; // Cost basis
  totalInvestedIdr: number;
}

export interface UserPortfolio {
  cashIdr: number; // Virtual cash balance, starts at 100,000,000
  holdings: Record<string, AssetHolding>; // keyed by symbol (BTC, ETH, SOL)
  orders: Order[];
  realizedPnLIdr: number;
}

