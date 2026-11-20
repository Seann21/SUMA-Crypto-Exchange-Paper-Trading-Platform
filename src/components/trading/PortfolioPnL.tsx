'use client';

import React, { useState, useEffect } from 'react';
import { useTrading } from '@/context/TradingContext';
import { useMarketData } from '@/context/MarketDataContext';
import { formatIDR, formatCrypto, formatPercent } from '@/lib/utils';
import { INITIAL_DEMO_BALANCE_IDR } from '@/lib/constants';
import { TrendingUp, TrendingDown, RotateCcw, PieChart } from 'lucide-react';

export function PortfolioPnL() {
  const { portfolio, totalPortfolioValueIdr, totalPnLIdr, totalPnLPercentage, resetPortfolio } = useTrading();
  const { markets, livePrice, selectedPair } = useMarketData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isProfit = totalPnLIdr >= 0;

  // Calculate stats for each crypto holding
  const holdingsList = Object.values(portfolio.holdings).map((holding) => {
    const market = markets.find((m) => m.symbol === holding.symbol);
    const currentPrice =
      holding.symbol === selectedPair.split('/')[0] ? livePrice : market?.current_price || 0;
    
    const currentValIdr = holding.amount * currentPrice;
    const investedIdr = holding.totalInvestedIdr;
    const pnlIdr = currentValIdr - investedIdr;
    const pnlPct = investedIdr > 0 ? (pnlIdr / investedIdr) * 100 : 0;

    return {
      ...holding,
      currentPrice,
      currentValIdr,
      pnlIdr,
      pnlPct,
    };
  });

  return (
    <div className="flex flex-col bg-[#0d1320] border border-surface-border rounded-2xl overflow-hidden shadow-lg p-5">
      {/* Portfolio Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-surface-border/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">
              Portofolio & Tracker PnL Real-Time
            </h3>
            <p className="text-[11px] text-slate-400">
              Modal Awal: {formatIDR(INITIAL_DEMO_BALANCE_IDR)}
            </p>
          </div>
        </div>

        <button
          onClick={resetPortfolio}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border text-xs text-slate-300 hover:text-amber-400 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Saldo Rp 100 Jt</span>
        </button>
      </div>

      {/* Main KPI metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        {/* Total Portfolio Value */}
        <div className="p-3.5 rounded-xl bg-surface-subtle/70 border border-surface-border">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Estimasi Aset
          </span>
          <span
            className="text-lg sm:text-xl font-black font-mono text-white"
            suppressHydrationWarning
          >
            {mounted ? formatIDR(totalPortfolioValueIdr) : 'Rp 100.000.000'}
          </span>
        </div>

        {/* Total Profit / Loss (IDR) */}
        <div className="p-3.5 rounded-xl bg-surface-subtle/70 border border-surface-border">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Untung / Rugi Bersih (PnL)
          </span>
          <div className="flex items-center gap-1.5">
            {isProfit ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
            <span
              className={`text-lg sm:text-xl font-black font-mono ${
                isProfit ? 'text-emerald-400' : 'text-rose-400'
              }`}
              suppressHydrationWarning
            >
              {mounted ? `${isProfit ? '+' : ''}${formatIDR(totalPnLIdr)}` : 'Rp 0'}
            </span>
          </div>
        </div>

        {/* PnL Percentage */}
        <div className="p-3.5 rounded-xl bg-surface-subtle/70 border border-surface-border">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Return Portofolio
          </span>
          <span
            className={`text-lg sm:text-xl font-black font-mono ${
              isProfit ? 'text-emerald-400' : 'text-rose-400'
            }`}
            suppressHydrationWarning
          >
            {mounted ? formatPercent(totalPnLPercentage) : '0.00%'}
          </span>
        </div>
      </div>

      {/* Asset Allocation Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
          <span>Alokasi Saldo Tunai & Kripto</span>
          <span className="font-mono text-slate-300" suppressHydrationWarning>
            {mounted && totalPortfolioValueIdr > 0 ? (
              <>
                Cash: {((portfolio.cashIdr / totalPortfolioValueIdr) * 100).toFixed(1)}% | Kripto: {(
                  ((totalPortfolioValueIdr - portfolio.cashIdr) / totalPortfolioValueIdr) * 100
                ).toFixed(1)}%
              </>
            ) : (
              'Cash: 100.0% | Kripto: 0.0%'
            )}
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-800 flex overflow-hidden">
          <div
            className="bg-amber-400 transition-all duration-500"
            style={{ width: mounted && totalPortfolioValueIdr > 0 ? `${Math.min(100, (portfolio.cashIdr / totalPortfolioValueIdr) * 100)}%` : '100%' }}
            title="IDR Cash"
          />
          <div
            className="bg-emerald-500 transition-all duration-500"
            style={{ width: mounted && totalPortfolioValueIdr > 0 ? `${Math.min(100, ((totalPortfolioValueIdr - portfolio.cashIdr) / totalPortfolioValueIdr) * 100)}%` : '0%' }}
            title="Crypto Assets"
          />
        </div>
      </div>

      {/* Holdings Table */}
      <div className="border border-surface-border/80 rounded-xl overflow-hidden">
        <div className="px-3.5 py-2 bg-[#0a0e18] border-b border-surface-border text-xs font-bold text-white flex items-center justify-between">
          <span>Aset Saya</span>
          <span className="text-[10px] font-normal text-slate-400">
            Nilai dihitung berdasarkan live ticker
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-border/40 text-[10px] text-slate-400 uppercase tracking-wider bg-surface-subtle/30">
                <th className="py-2.5 px-3 font-semibold">Aset</th>
                <th className="py-2.5 px-3 font-semibold text-right">Saldo Dimiliki</th>
                <th className="py-2.5 px-3 font-semibold text-right">Harga Beli Rata-Rata</th>
                <th className="py-2.5 px-3 font-semibold text-right">Nilai Sekarang</th>
                <th className="py-2.5 px-3 font-semibold text-right">PnL (Untung/Rugi)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/30 font-mono">
              {/* IDR Cash Row */}
              <tr className="hover:bg-surface-hover/30 transition-colors">
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                      Rp
                    </span>
                    <div>
                      <span className="font-bold text-white font-sans">Rupiah (IDR)</span>
                      <span className="block text-[10px] text-slate-400 font-sans">Kas Virtual</span>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-right text-white font-bold" suppressHydrationWarning>
                  {formatIDR(portfolio.cashIdr)}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-400">-</td>
                <td className="py-2.5 px-3 text-right text-white" suppressHydrationWarning>
                  {formatIDR(portfolio.cashIdr)}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-400">-</td>
              </tr>

              {/* Crypto Assets Rows */}
              {holdingsList.map((h) => {
                const hasBalance = h.amount > 0;
                const isHoldingProfit = h.pnlIdr >= 0;

                return (
                  <tr
                    key={h.symbol}
                    className={`hover:bg-surface-hover/30 transition-colors ${
                      hasBalance ? 'bg-surface-subtle/10' : 'opacity-60'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-surface-subtle border border-surface-border text-white flex items-center justify-center font-bold text-[10px]">
                          {h.symbol}
                        </span>
                        <div>
                          <span className="font-bold text-white font-sans">{h.name}</span>
                          <span className="block text-[10px] text-slate-400 font-sans">{h.symbol}/IDR</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right text-white font-semibold" suppressHydrationWarning>
                      {formatCrypto(h.amount, h.symbol)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300" suppressHydrationWarning>
                      {hasBalance ? formatIDR(h.avgBuyPriceIdr) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-white font-semibold" suppressHydrationWarning>
                      {formatIDR(h.currentValIdr)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {hasBalance ? (
                        <div className={isHoldingProfit ? 'text-emerald-400' : 'text-rose-400'}>
                          <span className="font-bold" suppressHydrationWarning>
                            {isHoldingProfit ? '+' : ''}{formatIDR(h.pnlIdr)}
                          </span>
                          <span className="block text-[10px]" suppressHydrationWarning>
                            ({formatPercent(h.pnlPct)})
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
