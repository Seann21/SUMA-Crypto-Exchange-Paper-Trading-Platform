'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { CryptoAsset, OrderBookEntry, TradeFeedItem } from '@/types/crypto';
import { DEFAULT_PAIRS } from '@/lib/constants';

interface MarketDataContextType {
  markets: CryptoAsset[];
  selectedAsset: CryptoAsset;
  selectedPair: string;
  setSelectedPair: (pair: string) => void;
  livePrice: number;
  priceDirection: 'up' | 'down' | 'same';
  orderBook: {
    asks: OrderBookEntry[];
    bids: OrderBookEntry[];
    spread: number;
    spreadPercentage: number;
  };
  recentTrades: TradeFeedItem[];
  isLoading: boolean;
  refreshMarkets: () => Promise<void>;
}

const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined);

export function MarketDataProvider({ children }: { children: React.ReactNode }) {
  const [markets, setMarkets] = useState<CryptoAsset[]>(DEFAULT_PAIRS);
  const [selectedPair, setSelectedPair] = useState<string>('BTC/IDR');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Real-time micro-price tracking for current pair
  const [livePrice, setLivePrice] = useState<number>(DEFAULT_PAIRS[0].current_price);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'same'>('same');
  const [recentTrades, setRecentTrades] = useState<TradeFeedItem[]>([]);
  
  const lastPriceRef = useRef<number>(livePrice);

  // Selected asset based on selectedPair
  const selectedAsset = useMemo(() => {
    return markets.find((m) => m.pair === selectedPair) || markets[0];
  }, [markets, selectedPair]);

  // Sync livePrice when selected pair changes
  useEffect(() => {
    if (selectedAsset) {
      setLivePrice(selectedAsset.current_price);
      lastPriceRef.current = selectedAsset.current_price;
    }
  }, [selectedAsset?.pair]);

  // Initial fetch from our cached API route (backed by CoinGecko)
  const refreshMarkets = async () => {
    try {
      const res = await fetch('/api/crypto/markets');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setMarkets(json.data);
        }
      }
    } catch (err) {
      console.warn('Could not refresh markets from API, using fallback data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshMarkets();
    const interval = setInterval(refreshMarkets, 30000); // 30s background sync
    return () => clearInterval(interval);
  }, []);

  // Real-time micro-tick simulation engine (1.2s - 2.2s tick updates)
  useEffect(() => {
    if (!selectedAsset) return;

    // Seed initial recent trades
    const initialTrades: TradeFeedItem[] = [];
    const baseP = selectedAsset.current_price;
    for (let i = 0; i < 15; i++) {
      const isBuy = Math.random() > 0.48;
      const variation = (Math.random() - 0.5) * 0.001;
      const tradePrice = Math.round(baseP * (1 + variation));
      let amount = 0.005;
      if (selectedAsset.symbol === 'BTC') amount = Number((Math.random() * 0.45 + 0.01).toFixed(4));
      if (selectedAsset.symbol === 'ETH') amount = Number((Math.random() * 3.5 + 0.1).toFixed(3));
      if (selectedAsset.symbol === 'SOL') amount = Number((Math.random() * 25 + 0.5).toFixed(2));
      
      const now = new Date(Date.now() - (15 - i) * 3500);
      initialTrades.push({
        id: `trade-init-${i}`,
        price: tradePrice,
        amount,
        time: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: isBuy ? 'buy' : 'sell',
      });
    }
    setRecentTrades(initialTrades.reverse());

    const tickInterval = setInterval(() => {
      setLivePrice((prev) => {
        // Subtle realistic micro-fluctuation (between -0.05% and +0.05%)
        const deltaFactor = (Math.random() - 0.495) * 0.0008;
        const nextPrice = Math.round(prev * (1 + deltaFactor));

        if (nextPrice > prev) {
          setPriceDirection('up');
        } else if (nextPrice < prev) {
          setPriceDirection('down');
        } else {
          setPriceDirection('same');
        }

        // Add new trade feed item
        let tradeAmount = 0.01;
        if (selectedAsset.symbol === 'BTC') tradeAmount = Number((Math.random() * 0.35 + 0.005).toFixed(4));
        if (selectedAsset.symbol === 'ETH') tradeAmount = Number((Math.random() * 2.5 + 0.08).toFixed(3));
        if (selectedAsset.symbol === 'SOL') tradeAmount = Number((Math.random() * 18 + 0.4).toFixed(2));

        const newTrade: TradeFeedItem = {
          id: `trade-${Date.now()}-${Math.random()}`,
          price: nextPrice,
          amount: tradeAmount,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: nextPrice >= prev ? 'buy' : 'sell',
        };

        setRecentTrades((prevTrades) => [newTrade, ...prevTrades.slice(0, 24)]);
        lastPriceRef.current = nextPrice;
        return nextPrice;
      });
    }, 1800);

    return () => clearInterval(tickInterval);
  }, [selectedAsset?.pair]);

  // Order Book generation based on current livePrice
  const orderBook = useMemo(() => {
    const p = livePrice || selectedAsset.current_price;
    const isBtc = selectedAsset.symbol === 'BTC';
    const isEth = selectedAsset.symbol === 'ETH';
    const baseStep = isBtc ? 15000 : isEth ? 5000 : 200;

    const asks: OrderBookEntry[] = [];
    const bids: OrderBookEntry[] = [];

    let cumAsk = 0;
    for (let i = 1; i <= 8; i++) {
      const askPrice = Math.round(p + i * baseStep + (Math.random() * baseStep * 0.3));
      const amount = isBtc
        ? Number((Math.random() * 0.4 + 0.05).toFixed(4))
        : isEth
        ? Number((Math.random() * 3.5 + 0.2).toFixed(3))
        : Number((Math.random() * 25 + 1.5).toFixed(2));
      cumAsk += amount;
      asks.unshift({
        price: askPrice,
        amount,
        total: Number(cumAsk.toFixed(4)),
        depthPercentage: Math.min(100, Math.round((cumAsk / (isBtc ? 3 : isEth ? 25 : 180)) * 100)),
      });
    }

    let cumBid = 0;
    for (let i = 1; i <= 8; i++) {
      const bidPrice = Math.round(p - i * baseStep - (Math.random() * baseStep * 0.3));
      const amount = isBtc
        ? Number((Math.random() * 0.45 + 0.05).toFixed(4))
        : isEth
        ? Number((Math.random() * 4.0 + 0.2).toFixed(3))
        : Number((Math.random() * 30 + 2.0).toFixed(2));
      cumBid += amount;
      bids.push({
        price: bidPrice,
        amount,
        total: Number(cumBid.toFixed(4)),
        depthPercentage: Math.min(100, Math.round((cumBid / (isBtc ? 3 : isEth ? 25 : 180)) * 100)),
      });
    }

    const lowestAsk = asks[asks.length - 1]?.price || p;
    const highestBid = bids[0]?.price || p;
    const spread = Math.max(0, lowestAsk - highestBid);
    const spreadPercentage = Number(((spread / p) * 100).toFixed(3));

    return { asks, bids, spread, spreadPercentage };
  }, [livePrice, selectedAsset]);

  return (
    <MarketDataContext.Provider
      value={{
        markets,
        selectedAsset,
        selectedPair,
        setSelectedPair,
        livePrice,
        priceDirection,
        orderBook,
        recentTrades,
        isLoading,
        refreshMarkets,
      }}
    >
      {children}
    </MarketDataContext.Provider>
  );
}

export function useMarketData() {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
}

