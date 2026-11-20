'use client';

import React, { useState, useEffect } from 'react';
import { useMarketData } from '@/context/MarketDataContext';
import { useTrading } from '@/context/TradingContext';
import { OrderSide, OrderType } from '@/types/trading';
import { formatIDR, formatCrypto } from '@/lib/utils';
import { Wallet, Info, ArrowDown, ArrowUp, Zap, Clock } from 'lucide-react';

interface OrderFormProps {
  externalPrice?: number;
}

export function OrderForm({ externalPrice }: OrderFormProps) {
  const { selectedAsset, selectedPair, livePrice } = useMarketData();
  const { portfolio, placeOrder, getHolding } = useTrading();

  const symbol = selectedAsset.symbol;
  const holding = getHolding(symbol);

  const [side, setSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [limitPrice, setLimitPrice] = useState<number>(livePrice);
  const [amount, setAmount] = useState<string>('');
  const [totalIdr, setTotalIdr] = useState<string>('');

  // Update limit price if external price selected from orderbook
  useEffect(() => {
    if (externalPrice) {
      setLimitPrice(externalPrice);
      if (amount && parseFloat(amount) > 0) {
        setTotalIdr((parseFloat(amount) * externalPrice).toFixed(0));
      }
    }
  }, [externalPrice]);

  // Keep limit price updated with live price if user hasn't edited it yet
  useEffect(() => {
    if (orderType === 'market') {
      setLimitPrice(livePrice);
      if (amount && parseFloat(amount) > 0) {
        setTotalIdr((parseFloat(amount) * livePrice).toFixed(0));
      }
    }
  }, [livePrice, orderType]);

  // Handle amount change
  const handleAmountChange = (val: string) => {
    setAmount(val);
    const parsedAmount = parseFloat(val);
    const effectivePrice = orderType === 'market' ? livePrice : limitPrice;

    if (!isNaN(parsedAmount) && parsedAmount > 0) {
      const calculatedTotal = parsedAmount * effectivePrice;
      setTotalIdr(Math.round(calculatedTotal).toString());
    } else {
      setTotalIdr('');
    }
  };

  // Handle total IDR change
  const handleTotalIdrChange = (val: string) => {
    setTotalIdr(val);
    const parsedTotal = parseFloat(val);
    const effectivePrice = orderType === 'market' ? livePrice : limitPrice;

    if (!isNaN(parsedTotal) && parsedTotal > 0 && effectivePrice > 0) {
      const calculatedAmount = parsedTotal / effectivePrice;
      setAmount(calculatedAmount.toFixed(symbol === 'BTC' ? 6 : symbol === 'ETH' ? 5 : 3));
    } else {
      setAmount('');
    }
  };

  // Handle percentage shortcut clicks (25%, 50%, 75%, 100%)
  const handlePercentageClick = (percentage: number) => {
    const effectivePrice = orderType === 'market' ? livePrice : limitPrice;

    if (side === 'buy') {
      const availableCash = portfolio.cashIdr;
      const targetCash = Math.floor(availableCash * (percentage / 100));
      setTotalIdr(targetCash.toString());
      if (effectivePrice > 0) {
        const calculatedAmount = targetCash / effectivePrice;
        setAmount(calculatedAmount.toFixed(symbol === 'BTC' ? 6 : symbol === 'ETH' ? 5 : 3));
      }
    } else {
      // Sell
      const availableCrypto = holding.amount;
      const targetCrypto = availableCrypto * (percentage / 100);
      setAmount(targetCrypto.toFixed(symbol === 'BTC' ? 6 : symbol === 'ETH' ? 5 : 3));
      setTotalIdr(Math.round(targetCrypto * effectivePrice).toString());
    }
  };

  // Submit order
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectivePrice = orderType === 'market' ? livePrice : limitPrice;
    const numAmount = parseFloat(amount);
    const numTotal = parseFloat(totalIdr);

    if (isNaN(numAmount) || numAmount <= 0 || isNaN(numTotal) || numTotal <= 0) {
      return;
    }

    const result = placeOrder({
      pair: selectedPair,
      side,
      type: orderType,
      price: effectivePrice,
      amount: numAmount,
      totalIdr: numTotal,
    });

    if (result.success) {
      setAmount('');
      setTotalIdr('');
    }
  };

  return (
    <div className="flex flex-col bg-[#0d1320] border border-surface-border rounded-2xl overflow-hidden shadow-lg p-4">
      {/* Side Toggle: BUY (Green) / SELL (Red) */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface-subtle border border-surface-border rounded-xl mb-4">
        <button
          type="button"
          onClick={() => setSide('buy')}
          className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            side === 'buy'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>Beli {symbol}</span>
        </button>

        <button
          type="button"
          onClick={() => setSide('sell')}
          className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            side === 'sell'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowDown className="w-3.5 h-3.5" />
          <span>Jual {symbol}</span>
        </button>
      </div>

      {/* Order Type Tabs: Market / Limit */}
      <div className="flex items-center gap-2 mb-4 border-b border-surface-border/60 pb-3">
        <button
          type="button"
          onClick={() => setOrderType('market')}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            orderType === 'market'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3 h-3" />
          <span>Market Order</span>
        </button>

        <button
          type="button"
          onClick={() => setOrderType('limit')}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            orderType === 'limit'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>Limit Order</span>
        </button>
      </div>

      {/* Available Balance display */}
      <div className="flex items-center justify-between text-xs mb-3 px-1">
        <span className="text-slate-400 flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5 text-amber-400" />
          <span>Tersedia:</span>
        </span>
        <span className="font-mono font-bold text-white">
          {side === 'buy'
            ? formatIDR(portfolio.cashIdr)
            : formatCrypto(holding.amount, symbol)}
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Limit Price Input (if limit order) */}
        {orderType === 'limit' && (
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Target Harga (IDR)</span>
              <button
                type="button"
                onClick={() => setLimitPrice(livePrice)}
                className="text-amber-400 hover:underline"
              >
                Gunakan Harga Pasar
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                value={limitPrice || ''}
                onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-subtle border border-surface-border rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                IDR
              </span>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">
            Jumlah Beli/Jual ({symbol})
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-full bg-surface-subtle border border-surface-border rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              {symbol}
            </span>
          </div>
        </div>

        {/* Quick Percentage Buttons */}
        <div className="grid grid-cols-4 gap-1.5">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => handlePercentageClick(pct)}
              className="py-1 text-[11px] font-bold rounded-lg bg-surface-subtle hover:bg-surface-hover border border-surface-border text-slate-400 hover:text-amber-400 transition-colors"
            >
              {pct}%
            </button>
          ))}
        </div>

        {/* Total IDR Input */}
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">
            Total Nilai (IDR)
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              placeholder="0"
              value={totalIdr}
              onChange={(e) => handleTotalIdrChange(e.target.value)}
              className="w-full bg-surface-subtle border border-surface-border rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
              IDR
            </span>
          </div>
        </div>

        {/* Order Summary & Fee */}
        <div className="p-2.5 rounded-xl bg-surface-subtle/50 border border-surface-border/50 text-[11px] text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>Biaya Trading (Fee):</span>
            <span className="text-emerald-400 font-mono font-semibold">0% (Demo Bebas Biaya)</span>
          </div>
          <div className="flex justify-between">
            <span>Estimasi Eksekusi:</span>
            <span className="text-white font-mono">
              {orderType === 'market' ? 'Instan' : `Ketika harga menyentuh`}
            </span>
          </div>
        </div>

        {/* Submit Execution Button */}
        <button
          type="submit"
          className={`w-full py-3 rounded-xl font-extrabold text-sm text-white transition-all transform active:scale-[0.99] shadow-lg ${
            side === 'buy'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-950/50'
              : 'bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 shadow-rose-950/50'
          }`}
        >
          {side === 'buy'
            ? `Beli ${symbol} (${orderType === 'market' ? 'Instan' : 'Limit'})`
            : `Jual ${symbol} (${orderType === 'market' ? 'Instan' : 'Limit'})`}
        </button>
      </form>
    </div>
  );
}

