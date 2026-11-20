'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMarketData } from '@/context/MarketDataContext';
import { formatIDR, formatPercent, formatCompactIDR } from '@/lib/utils';
import { Footer } from '@/components/common/Footer';
import { Search, ArrowUpRight, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';

export default function MarketsPage() {
  const { markets, setSelectedPair } = useMarketData();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'gainers' | 'volume'>('all');

  const filtered = markets
    .filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.symbol.toLowerCase().includes(search.toLowerCase()) ||
      m.pair.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (filter === 'gainers') return b.price_change_percentage_24h - a.price_change_percentage_24h;
      if (filter === 'volume') return b.total_volume - a.total_volume;
      return 0;
    });

  return (
    <div className="flex-1 w-full flex flex-col bg-[#080b11]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pasar Kripto Indonesia</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Semua Pasar Kripto (IDR)
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Pantau pergerakan harga real-time BTC/IDR, ETH/IDR, dan SOL/IDR dengan feed CoinGecko terpercaya.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari aset (contoh: BTC, Solana)..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface-subtle border border-surface-border rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === 'all'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-surface-subtle text-slate-400 hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter('gainers')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === 'gainers'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'bg-surface-subtle text-slate-400 hover:text-white'
              }`}
            >
              Top Gainers
            </button>
            <button
              onClick={() => setFilter('volume')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === 'volume'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-surface-subtle text-slate-400 hover:text-white'
              }`}
            >
              Volume Terbesar
            </button>
          </div>
        </div>

        {/* Markets Table */}
        <div className="rounded-2xl bg-[#0d1320] border border-surface-border overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border text-xs text-slate-400 uppercase tracking-wider bg-surface-subtle/50">
                  <th className="py-3.5 px-4 font-semibold">Aset</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Harga Terkini</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Perubahan 24j</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Tertinggi 24j</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Terendah 24j</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Volume 24j</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/40 font-mono">
                {filtered.map((asset) => {
                  const isGain = asset.price_change_percentage_24h >= 0;

                  return (
                    <tr
                      key={asset.id}
                      className="hover:bg-surface-hover/40 transition-colors group"
                    >
                      <td className="py-4 px-4 font-sans">
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
                            <span className="font-bold text-white block group-hover:text-amber-400 transition-colors">
                              {asset.name}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              {asset.pair}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right font-bold text-white text-base">
                        {formatIDR(asset.current_price)}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                            isGain
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isGain ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {formatPercent(asset.price_change_percentage_24h)}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right text-slate-300">
                        {formatIDR(asset.high_24h)}
                      </td>

                      <td className="py-4 px-4 text-right text-slate-300">
                        {formatIDR(asset.low_24h)}
                      </td>

                      <td className="py-4 px-4 text-right text-amber-400 font-semibold">
                        {formatCompactIDR(asset.total_volume)}
                      </td>

                      <td className="py-4 px-4 text-center font-sans">
                        <Link
                          href="/trade"
                          onClick={() => setSelectedPair(asset.pair)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 transition-all shadow-sm"
                        >
                          <span>Trade</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

