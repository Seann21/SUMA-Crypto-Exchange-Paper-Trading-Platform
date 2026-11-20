'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MiniChartCard } from './MiniChartCard';
import { AuthModal } from '../common/AuthModal';
import { useTrading } from '@/context/TradingContext';
import { ArrowUpRight, User, CheckCircle2 } from 'lucide-react';

export function HeroSection() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user } = useTrading();

  return (
    <>
      <section className="relative w-full pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        {/* Subtle background glow blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-amber-500/10 via-orange-600/10 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold mb-6 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <span>🔥</span>
                <span>Masa Depan Simulasi Trading Kripto Indonesia</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
                Beli, Trading & <br />
                Kuasai Pasar <br />
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                  Kripto
                </span>
              </h1>

              {/* Description Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mb-8">
                Platform <strong className="text-white font-semibold">Spot Paper Trading</strong> real-time dengan grafik candlestick interaktif, order book dinamis, dan saldo virtual <strong className="text-amber-400 font-bold font-mono">IDR 100.000.000</strong> siap pakai tanpa risiko.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                <Link
                  href="/trade"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base text-slate-950 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 shadow-[0_0_30px_rgba(245,158,11,0.45)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Auto Guest Demo (Rp 100 Jt)</span>
                  <ArrowUpRight className="w-5 h-5" />
                </Link>

                {user ? (
                  // If logged in, show User Status button instead of Login Akun
                  <Link
                    href="/trade"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all text-center"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Masuk Akun Saya</span>
                  </Link>
                ) : (
                  // If not logged in, show Login Akun button
                  <button
                    type="button"
                    onClick={() => setIsAuthOpen(true)}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base text-white bg-surface-subtle hover:bg-surface-hover border border-surface-border transition-colors text-center"
                  >
                    Login Akun
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Hero Mock Card Preview */}
            <div className="lg:col-span-5 w-full flex justify-center">
              <MiniChartCard />
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
