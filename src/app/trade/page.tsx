'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { TradingHeader } from '@/components/trading/TradingHeader';
import { OrderBook } from '@/components/trading/OrderBook';
import { OrderForm } from '@/components/trading/OrderForm';
import { PortfolioPnL } from '@/components/trading/PortfolioPnL';
import { RecentTrades } from '@/components/trading/RecentTrades';
import { OrderHistoryModal } from '@/components/trading/OrderHistoryModal';
import { useTrading } from '@/context/TradingContext';
import { useMarketData } from '@/context/MarketDataContext';
import { PieChart, History } from 'lucide-react';

// Dynamically import LightweightChart with SSR disabled for optimal TradingView canvas rendering
const LightweightChart = dynamic(
  () => import('@/components/trading/LightweightChart').then((mod) => mod.LightweightChart),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[460px] bg-[#0d1320] border border-surface-border rounded-2xl flex items-center justify-center">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
          <span className="w-4 h-4 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
          <span>Memuat TradingView Engine...</span>
        </div>
      </div>
    ),
  }
);

export default function TradePage() {
  const { portfolio, resetPortfolio, placeOrder } = useTrading();
  const { selectedPair, livePrice } = useMarketData();
  const [selectedBookPrice, setSelectedBookPrice] = useState<number | undefined>(undefined);
  const [bottomTab, setBottomTab] = useState<'pnl' | 'history'>('pnl');

  // Quick 1-click recruiter demo action
  const handleQuickBuy = () => {
    const buyAmount = 10_000_000; // Rp 10 Juta
    if (portfolio.cashIdr >= buyAmount) {
      const cryptoQty = buyAmount / livePrice;
      placeOrder({
        pair: selectedPair,
        side: 'buy',
        type: 'market',
        price: livePrice,
        amount: Number(cryptoQty.toFixed(6)),
        totalIdr: buyAmount,
      });
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col bg-[#07090e]">
      {/* Recruiter Sandbox Top Ribbon */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border-b border-amber-500/20 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-amber-400">Sandbox Recruiter Aktif:</span>
            <span className="text-slate-300">
              Anda sedang menguji simulasi Paper Trading dengan saldo awal{' '}
              <strong className="text-white font-mono">Rp 100.000.000</strong>.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickBuy}
              className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] transition-colors"
            >
              + Quick Buy Rp 10 Jt {selectedPair.split('/')[0]}
            </button>
            <button
              onClick={resetPortfolio}
              className="px-2.5 py-1 rounded-lg bg-surface-subtle hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-amber-400 text-[11px] font-medium transition-colors"
            >
              Reset Saldo Rp 100 Jt
            </button>
          </div>
        </div>
      </div>

      {/* Trading Pair Ticker Header */}
      <TradingHeader />

      {/* Main Trading Platform Grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Chart Column (8 Cols on large screens) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* TradingView Lightweight Candlestick Chart */}
            <LightweightChart height={460} />

            {/* Bottom Panel: PnL & Order History Tabs */}
            <div className="flex items-center gap-2 border-b border-surface-border/60 pb-2">
              <button
                onClick={() => setBottomTab('pnl')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  bottomTab === 'pnl'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <PieChart className="w-4 h-4" />
                <span>Portofolio & PnL Real-Time</span>
              </button>

              <button
                onClick={() => setBottomTab('history')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  bottomTab === 'history'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Order Terbuka & Riwayat Transaksi</span>
              </button>
            </div>

            {bottomTab === 'pnl' ? (
              <PortfolioPnL />
            ) : (
              <OrderHistoryModal />
            )}
          </div>

          {/* Right Column: Order Form, Order Book & Recent Trades (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Order Form (Buy/Sell Spot & Limit) */}
            <OrderForm externalPrice={selectedBookPrice} />

            {/* Order Book */}
            <div className="h-[360px]">
              <OrderBook onSelectPrice={(price) => setSelectedBookPrice(price)} />
            </div>

            {/* Recent Trades Stream */}
            <div className="h-[280px]">
              <RecentTrades />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
