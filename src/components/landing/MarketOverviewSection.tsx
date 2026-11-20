'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMarketData } from '@/context/MarketDataContext';
import { formatIDR, formatPercent } from '@/lib/utils';
import { ArrowUpRight, ChevronRight } from 'lucide-react';

export function MarketOverviewSection() {
  const { markets, setSelectedPair } = useMarketData();
  const [activeTab, setActiveTab] = useState<'gainers' | 'highest'>('gainers');

  // Sorted arrays
  const sortedMarkets = [...markets].sort((a, b) => {
    if (activeTab === 'gainers') {
      return b.price_change_percentage_24h - a.price_change_percentage_24h;
    }
    return b.current_price - a.current_price;
  });

  return (
    <section className="w-full py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Market Overview Table */}
          <div className="lg:col-span-7 flex flex-col p-6 rounded-3xl bg-[#0e1424] border border-surface-border shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Market Overview</h3>
              <Link
                href="/markets"
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <span>Buka Semua Pasar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setActiveTab('gainers')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'gainers'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-surface-subtle text-slate-400 hover:text-white'
                }`}
              >
                Top Gainers
              </button>
              <button
                onClick={() => setActiveTab('highest')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'highest'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-surface-subtle text-slate-400 hover:text-white'
                }`}
              >
                Harga Tertinggi
              </button>
            </div>

            {/* Coin List */}
            <div className="space-y-3 flex-1 flex flex-col justify-center">
              {sortedMarkets.map((asset, index) => {
                const isGain = asset.price_change_percentage_24h >= 0;

                return (
                  <Link
                    key={asset.id}
                    href="/trade"
                    onClick={() => setSelectedPair(asset.pair)}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-subtle/60 hover:bg-surface-hover border border-surface-border/60 transition-all group"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-xs font-mono font-bold text-slate-500 w-4">
                        {index + 1}
                      </span>
                      <span
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-slate-950 ${
                          asset.symbol === 'BTC'
                            ? 'bg-amber-500'
                            : asset.symbol === 'ETH'
                            ? 'bg-cyan-500'
                            : 'bg-emerald-500'
                        }`}
                      >
                        {asset.symbol}
                      </span>
                      <div>
                        <span className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors block">
                          {asset.name}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {asset.pair}
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span
                        className="font-bold text-sm text-white block"
                        suppressHydrationWarning
                      >
                        {formatIDR(asset.current_price)}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          isGain ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                        suppressHydrationWarning
                      >
                        {formatPercent(asset.price_change_percentage_24h)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Column: Mode Sandbox Recruiter Card */}
          <div className="lg:col-span-5 flex flex-col justify-between p-7 sm:p-8 rounded-3xl bg-gradient-to-b from-[#131b2d] via-[#0f1626] to-[#0a0e19] border border-amber-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Mode Sandbox Recruiter</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-4">
                Mulai Simulasi Paper Trading Hari Ini
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed mb-8">
                Langsung uji eksekusi Buy/Sell pada grafik live BTC/IDR, ETH/IDR, dan SOL/IDR dengan saldo virtual Rp 100.000.000 tanpa perlu verifikasi KYC.
              </p>
            </div>

            <Link
              href="/trade"
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-sm sm:text-base text-slate-950 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Masuk Auto Guest Demo</span>
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
