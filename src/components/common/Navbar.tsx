'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TigerLogo } from './TigerLogo';
import { AuthModal } from './AuthModal';
import { useTrading } from '@/context/TradingContext';
import { formatIDR } from '@/lib/utils';
import { ArrowRight, Wallet, RotateCcw, LogOut, User } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { portfolio, resetPortfolio, user, signOut } = useTrading();
  const isTradingPage = pathname === '/trade';

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-surface-border/80 bg-[#080b11]/90 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="hover:opacity-95 transition-opacity">
            <TigerLogo size="md" />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                pathname === '/' ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              href="/markets"
              className={`text-sm font-medium transition-colors ${
                pathname === '/markets' ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Markets
            </Link>
            <Link
              href="/trade"
              className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                pathname === '/trade' ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Paper Trade
              <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                PRO
              </span>
            </Link>
            <a
              href="/#fitur"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Fitur
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {isTradingPage ? (
              // In Trading Page: Show Virtual Demo Balance pill & Quick Reset
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-subtle border border-surface-border text-xs">
                  <Wallet className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-400">Saldo Demo:</span>
                  <span className="font-bold text-white font-mono" suppressHydrationWarning>
                    {mounted ? formatIDR(portfolio.cashIdr) : 'Rp 100.000.000'}
                  </span>
                </div>
                <button
                  onClick={resetPortfolio}
                  title="Reset Saldo ke Rp 100 Jt"
                  className="p-1.5 rounded-lg bg-surface-subtle hover:bg-surface-hover border border-surface-border text-slate-400 hover:text-amber-400 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null}

            {user ? (
              // If Logged in with Supabase
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle border border-surface-border text-xs text-slate-300">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span className="max-w-[140px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  title="Keluar / Logout"
                  className="p-2 rounded-lg bg-surface-subtle hover:bg-rose-500/20 border border-surface-border text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              // If Guest
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-surface-hover rounded-lg transition-colors border border-transparent hover:border-surface-border"
                >
                  Log In
                </button>

                {!isTradingPage && (
                  <Link
                    href="/trade"
                    className="group relative inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-700 animate-ping" />
                    <span>Auto Guest Demo</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
