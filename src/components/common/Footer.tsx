import React from 'react';
import Link from 'next/link';
import { TigerLogo } from './TigerLogo';

export function Footer() {
  return (
    <footer className="w-full border-t border-surface-border bg-[#06080d] py-10 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-surface-border/50">
          <div className="flex items-center gap-3">
            <TigerLogo size="sm" showText={false} />
            <div>
              <span className="text-sm font-bold text-white tracking-wide">
                SUMA Crypto Exchange & Paper Trading
              </span>
              <p className="text-xs text-slate-500">
                Dirancang setajam insting Harimau Sumatra — Platform simulasi pasar kripto real-time Indonesia.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Home
            </Link>
            <Link href="/markets" className="hover:text-amber-400 transition-colors">
              Markets
            </Link>
            <Link href="/trade" className="hover:text-amber-400 transition-colors">
              Paper Trade
            </Link>
            <a href="/#fitur" className="hover:text-amber-400 transition-colors">
              Fitur
            </a>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-slate-500">
          <p>© 2026 SUMA Platform. Simulasi edukasi & portofolio trading.</p>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-surface-subtle border border-surface-border text-slate-400 font-mono text-[10px]">
              Next.js 14
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-subtle border border-surface-border text-slate-400 font-mono text-[10px]">
              TradingView Charts
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-subtle border border-surface-border text-slate-400 font-mono text-[10px]">
              CoinGecko API
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-subtle border border-surface-border text-slate-400 font-mono text-[10px]">
              Supabase
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

