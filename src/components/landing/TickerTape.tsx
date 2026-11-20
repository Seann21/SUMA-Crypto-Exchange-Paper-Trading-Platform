'use client';

import React from 'react';
import Link from 'next/link';
import { useMarketData } from '@/context/MarketDataContext';
import { formatIDR, formatPercent, formatCompactIDR } from '@/lib/utils';

export function TickerTape() {
  const { markets, setSelectedPair } = useMarketData();

  return (
    <div className="w-full py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#0b101b] border border-surface-border p-4 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-surface-border/60">
            {markets.map((asset) => {
              const isGain = asset.price_change_percentage_24h >= 0;

              return (
                <Link
                  key={asset.id}
                  href="/trade"
                  onClick={() => setSelectedPair(asset.pair)}
                  className="flex items-center justify-between p-3 sm:px-6 hover:bg-surface-hover/50 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
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
                      <span className="font-bold text-sm text-white block group-hover:text-amber-400 transition-colors">
                        {asset.pair}
                      </span>
                      <span
                        className="text-[11px] text-slate-400 font-mono"
                        suppressHydrationWarning
                      >
                        Vol 24j: {formatCompactIDR(asset.total_volume)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span
                      className="text-sm font-bold text-white block"
                      suppressHydrationWarning
                    >
                      {formatIDR(asset.current_price)}
                    </span>
                    <span
                      className={`text-xs font-semibold inline-flex items-center ${
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
      </div>
    </div>
  );
}
