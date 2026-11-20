'use client';

import React from 'react';
import { useMarketData } from '@/context/MarketDataContext';
import { formatIDR } from '@/lib/utils';
import { Activity } from 'lucide-react';

export function RecentTrades() {
  const { recentTrades, selectedAsset } = useMarketData();
  const symbol = selectedAsset.symbol;

  return (
    <div className="flex flex-col h-full bg-[#0d1320] border border-surface-border rounded-2xl overflow-hidden shadow-lg">
      <div className="px-4 py-3 border-b border-surface-border/80 flex items-center justify-between bg-[#0a0e18]/80">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span>Transaksi Terkini</span>
        </h3>
        <span className="text-[10px] text-slate-400 font-mono">
          Eksekusi Pasar
        </span>
      </div>

      <div className="grid grid-cols-3 px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-surface-border/40 bg-surface-subtle/30">
        <div className="text-left">Harga (IDR)</div>
        <div className="text-right">Jumlah ({symbol})</div>
        <div className="text-right">Waktu</div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[300px] divide-y divide-surface-border/10 py-1">
        {recentTrades.map((t) => (
          <div
            key={t.id}
            className="grid grid-cols-3 px-3 py-1 text-xs font-mono hover:bg-surface-hover/40 transition-colors"
          >
            <div
              className={`text-left font-medium ${
                t.type === 'buy' ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatIDR(t.price, { hideSymbol: true })}
            </div>
            <div className="text-right text-slate-300 font-medium">
              {t.amount}
            </div>
            <div className="text-right text-slate-500 text-[11px]">
              {t.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

