'use client';

import React from 'react';
import { useMarketData } from '@/context/MarketDataContext';
import { formatIDR, formatPercent, formatCompactIDR } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function TradingHeader() {
  const { markets, selectedPair, setSelectedPair, selectedAsset, livePrice, priceDirection } = useMarketData();

  return (
    <div className="w-full bg-[#0a0e18] border-b border-surface-border px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Pair Selector Tabs */}
        <div className="flex items-center gap-2">
          {markets.map((asset) => {
            const isSelected = asset.pair === selectedPair;
            const isGain = asset.price_change_percentage_24h >= 0;

            return (
              <button
                key={asset.id}
                onClick={() => setSelectedPair(asset.pair)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-surface-hover border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-surface-subtle/50 border-surface-border/60 hover:bg-surface-subtle text-slate-400'
                }`}
              >
                {asset.image && (
                  <div className="relative w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                    <img src={asset.image} alt={asset.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white leading-none">
                      {asset.pair}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-medium ${
                      isGain ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                    suppressHydrationWarning
                  >
                    {formatPercent(asset.price_change_percentage_24h)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Pair Metrics */}
        <div className="flex flex-wrap items-center gap-6 sm:gap-8">
          {/* Live Price with Flash Animation */}
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Harga Terkini
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`text-xl sm:text-2xl font-black font-mono transition-colors duration-300 ${
                  priceDirection === 'up'
                    ? 'text-emerald-400 scale-[1.02]'
                    : priceDirection === 'down'
                    ? 'text-rose-400 scale-[1.02]'
                    : 'text-white'
                }`}
                suppressHydrationWarning
              >
                {formatIDR(livePrice)}
              </span>
              {selectedAsset.price_change_percentage_24h >= 0 ? (
                <span
                  className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20"
                  suppressHydrationWarning
                >
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  {formatPercent(selectedAsset.price_change_percentage_24h)}
                </span>
              ) : (
                <span
                  className="flex items-center text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20"
                  suppressHydrationWarning
                >
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                  {formatPercent(selectedAsset.price_change_percentage_24h)}
                </span>
              )}
            </div>
          </div>

          {/* 24h High */}
          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Tertinggi 24j
            </span>
            <span className="text-xs sm:text-sm font-semibold font-mono text-white" suppressHydrationWarning>
              {formatIDR(selectedAsset.high_24h)}
            </span>
          </div>

          {/* 24h Low */}
          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Terendah 24j
            </span>
            <span className="text-xs sm:text-sm font-semibold font-mono text-white" suppressHydrationWarning>
              {formatIDR(selectedAsset.low_24h)}
            </span>
          </div>

          {/* 24h Volume */}
          <div className="hidden md:flex flex-col">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Volume 24j
            </span>
            <span className="text-xs sm:text-sm font-semibold font-mono text-amber-400" suppressHydrationWarning>
              {formatCompactIDR(selectedAsset.total_volume)}
            </span>
          </div>

          {/* Sandbox Recruiter Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Mode Sandbox Recruiter</span>
          </div>
        </div>
      </div>
    </div>
  );
}
