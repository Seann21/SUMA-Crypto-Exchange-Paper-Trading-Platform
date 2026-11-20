import { CryptoAsset } from '@/types/crypto';

export const INITIAL_DEMO_BALANCE_IDR = 100_000_000; // 100 Juta Rupiah

export const DEFAULT_PAIRS: CryptoAsset[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    pair: 'BTC/IDR',
    current_price: 1_495_774_078,
    price_change_24h: 60_082_120,
    price_change_percentage_24h: 4.18,
    high_24h: 1_510_000_000,
    low_24h: 1_430_000_000,
    total_volume: 462_800_000_000,
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    pair: 'ETH/IDR',
    current_price: 54_777_034,
    price_change_24h: 1_524_200,
    price_change_percentage_24h: 2.86,
    high_24h: 55_600_000,
    low_24h: 53_100_000,
    total_volume: 218_400_000_000,
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    pair: 'SOL/IDR',
    current_price: 2_922_362,
    price_change_24h: 176_450,
    price_change_percentage_24h: 6.42,
    high_24h: 2_990_000,
    low_24h: 2_740_000,
    total_volume: 149_600_000_000,
    image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
  },
];

export const TIMEFRAMES = [
  { label: '1M', value: '1m', seconds: 60 },
  { label: '5M', value: '5m', seconds: 300 },
  { label: '15M', value: '15m', seconds: 900 },
  { label: '1J', value: '1h', seconds: 3600 },
  { label: '4J', value: '4h', seconds: 14400 },
  { label: '1H', value: '1d', seconds: 86400 },
] as const;

