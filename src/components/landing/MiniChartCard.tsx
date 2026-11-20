'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMarketData } from '@/context/MarketDataContext';
import { useTrading } from '@/context/TradingContext';
import { formatIDR, formatPercent } from '@/lib/utils';
import { TigerLogo } from '../common/TigerLogo';
import { TrendingUp } from 'lucide-react';

export function MiniChartCard() {
  const { markets, livePrice } = useMarketData();
  const { portfolio } = useTrading();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const btc = markets.find((m) => m.symbol === 'BTC') || markets[0];
  const eth = markets.find((m) => m.symbol === 'ETH') || markets[1];
  const sol = markets.find((m) => m.symbol === 'SOL') || markets[2];

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Floating Pill Badge Top Left */}
      <div className="absolute -top-4 -left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111726]/90 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.3)] backdrop-blur-md">
        <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center">
          ₿
        </span>
        <div>
          <span className="text-xs font-bold text-white block leading-none">BTC/IDR</span>
          <span className="text-[10px] text-emerald-400 font-bold leading-none" suppressHydrationWarning>
            {formatPercent(btc.price_change_percentage_24h)}
          </span>
        </div>
      </div>

      {/* Floating Pill Badge Right */}
      <div className="absolute top-1/2 -right-5 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111726]/90 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.25)] backdrop-blur-md">
        <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-black text-[11px] flex items-center justify-center">
          Ξ
        </span>
        <div>
          <span className="text-xs font-bold text-white block leading-none">ETH/IDR</span>
          <span className="text-[10px] text-cyan-400 font-bold leading-none" suppressHydrationWarning>
            {formatPercent(eth.price_change_percentage_24h)}
          </span>
        </div>
      </div>

      {/* Main Glass Card Frame */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#131b2e] to-[#0a0e18] p-6 border border-surface-border shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Glow corner */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">
              Virtual Demo
            </span>
            <span
              className="text-2xl font-black font-mono text-white tracking-tight"
              suppressHydrationWarning
            >
              {mounted ? formatIDR(portfolio.cashIdr) : 'Rp 100.000.000'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400">
                +4.18% (BTC 24j)
              </span>
            </div>
          </div>
          <TigerLogo size="sm" showText={false} />
        </div>

        {/* Live Mini Chart Preview */}
        <div className="p-3.5 rounded-2xl bg-[#090d15] border border-surface-border/70 mb-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-white">BTC / IDR Live</span>
            <span className="font-mono font-bold text-amber-400" suppressHydrationWarning>
              {formatIDR(livePrice)}
            </span>
          </div>

          {/* Golden Sparkline Wave SVG */}
          <div className="w-full h-20 relative">
            <svg
              viewBox="0 0 300 80"
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0 65 L40 58 L80 62 L120 40 L160 48 L200 32 L240 22 L280 26 L300 12 L300 80 L0 80 Z"
                fill="url(#chartGradient)"
              />
              <path
                d="M0 65 L40 58 L80 62 L120 40 L160 48 L200 32 L240 22 L280 26 L300 12"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="300" cy="12" r="4" fill="#fbbf24" className="animate-ping" />
              <circle cx="300" cy="12" r="3.5" fill="#f59e0b" />
            </svg>
          </div>
        </div>

        {/* Quick Demo Action Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <Link
            href="/trade"
            className="py-1.5 text-center text-xs font-bold rounded-lg bg-surface-subtle hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-surface-border transition-colors"
          >
            Buy
          </Link>
          <Link
            href="/trade"
            className="py-1.5 text-center text-xs font-bold rounded-lg bg-surface-subtle hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-surface-border transition-colors"
          >
            Sell
          </Link>
          <Link
            href="/trade"
            className="py-1.5 text-center text-xs font-bold rounded-lg bg-surface-subtle hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 border border-surface-border transition-colors"
          >
            Limit
          </Link>
          <Link
            href="/trade"
            className="py-1.5 text-center text-xs font-bold rounded-lg bg-surface-subtle hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 border border-surface-border transition-colors"
          >
            PnL
          </Link>
        </div>

        {/* Watchlist Live in Card */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 px-1">
            <span>Watchlist Live</span>
            <span className="text-[10px] text-amber-500">Klik untuk Trade</span>
          </div>

          <Link
            href="/trade"
            className="flex items-center justify-between p-2.5 rounded-xl bg-surface-subtle/70 hover:bg-surface-hover border border-surface-border transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                BTC
              </span>
              <div>
                <span className="text-xs font-bold text-white block">Bitcoin</span>
                <span className="text-[10px] text-slate-400">BTC/IDR</span>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-xs font-bold text-white block" suppressHydrationWarning>
                {formatIDR(btc.current_price)}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold" suppressHydrationWarning>
                {formatPercent(btc.price_change_percentage_24h)}
              </span>
            </div>
          </Link>

          <Link
            href="/trade"
            className="flex items-center justify-between p-2.5 rounded-xl bg-surface-subtle/70 hover:bg-surface-hover border border-surface-border transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                ETH
              </span>
              <div>
                <span className="text-xs font-bold text-white block">Ethereum</span>
                <span className="text-[10px] text-slate-400">ETH/IDR</span>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-xs font-bold text-white block" suppressHydrationWarning>
                {formatIDR(eth.current_price)}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold" suppressHydrationWarning>
                {formatPercent(eth.price_change_percentage_24h)}
              </span>
            </div>
          </Link>

          <Link
            href="/trade"
            className="flex items-center justify-between p-2.5 rounded-xl bg-surface-subtle/70 hover:bg-surface-hover border border-surface-border transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                SOL
              </span>
              <div>
                <span className="text-xs font-bold text-white block">Solana</span>
                <span className="text-[10px] text-slate-400">SOL/IDR</span>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-xs font-bold text-white block" suppressHydrationWarning>
                {formatIDR(sol.current_price)}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold" suppressHydrationWarning>
                {formatPercent(sol.price_change_percentage_24h)}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
