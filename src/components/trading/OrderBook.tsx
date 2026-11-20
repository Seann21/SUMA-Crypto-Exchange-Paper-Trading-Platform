'use client';

import React from 'react';
import { useMarketData } from '@/context/MarketDataContext';
import { formatIDR, formatCrypto } from '@/lib/utils';

interface OrderBookProps {
  onSelectPrice?: (price: number) => void;
}

export function OrderBook({ onSelectPrice }: OrderBookProps) {
  const { orderBook, selectedAsset, livePrice } = useMarketData();
  const symbol = selectedAsset.symbol;

  return (
    <div className="flex flex-col h-full bg-[#0d1320] border border-surface-border rounded-2xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-surface-border/80 flex items-center justify-between bg-[#0a0e18]/80">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>Order Book</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </h3>
        <span className="text-[10px] text-slate-400 font-mono">
          Kedalaman Pasar
        </span>
      </div>

      {/* Column Titles */}
      <div className="grid grid-cols-3 px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-surface-border/40 bg-surface-subtle/30">
        <div className="text-left">Harga (IDR)</div>
        <div className="text-right">Jumlah ({symbol})</div>
        <div className="text-right">Total</div>
      </div>

      {/* Asks (Sell Orders - Red) */}
      <div className="flex-1 flex flex-col justify-end overflow-hidden space-y-[1px] py-1">
        {orderBook.asks.slice(-7).map((ask, i) => (
          <div
            key={`ask-${i}`}
            onClick={() => onSelectPrice && onSelectPrice(ask.price)}
            className="group relative grid grid-cols-3 px-3 py-0.5 text-xs font-mono cursor-pointer hover:bg-rose-500/10 transition-colors"
          >
            {/* Depth fill background */}
            <div
              className="absolute inset-y-0 right-0 bg-rose-500/15 group-hover:bg-rose-500/25 transition-all pointer-events-none"
              style={{ width: `${ask.depthPercentage}%` }}
            />
            <div className="relative text-rose-400 font-medium truncate">
              {formatIDR(ask.price, { hideSymbol: true })}
            </div>
            <div className="relative text-right text-slate-300 truncate">
              {ask.amount}
            </div>
            <div className="relative text-right text-slate-400 truncate">
              {ask.total}
            </div>
          </div>
        ))}
      </div>

      {/* Spread Bar & Live Mid Price */}
      <div className="px-3 py-2 my-1 border-y border-surface-border/60 bg-surface-subtle/40 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold text-white">
            {formatIDR(livePrice)}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span>Spread:</span>
          <span className="text-amber-400 font-semibold">
            {formatIDR(orderBook.spread, { hideSymbol: true })} ({orderBook.spreadPercentage}%)
          </span>
        </div>
      </div>

      {/* Bids (Buy Orders - Green) */}
      <div className="flex-1 flex flex-col justify-start overflow-hidden space-y-[1px] py-1">
        {orderBook.bids.slice(0, 7).map((bid, i) => (
          <div
            key={`bid-${i}`}
            onClick={() => onSelectPrice && onSelectPrice(bid.price)}
            className="group relative grid grid-cols-3 px-3 py-0.5 text-xs font-mono cursor-pointer hover:bg-emerald-500/10 transition-colors"
          >
            {/* Depth fill background */}
            <div
              className="absolute inset-y-0 right-0 bg-emerald-500/15 group-hover:bg-emerald-500/25 transition-all pointer-events-none"
              style={{ width: `${bid.depthPercentage}%` }}
            />
            <div className="relative text-emerald-400 font-medium truncate">
              {formatIDR(bid.price, { hideSymbol: true })}
            </div>
            <div className="relative text-right text-slate-300 truncate">
              {bid.amount}
            </div>
            <div className="relative text-right text-slate-400 truncate">
              {bid.total}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

