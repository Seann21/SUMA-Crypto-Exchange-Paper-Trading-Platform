'use client';

import React, { useState } from 'react';
import { useTrading } from '@/context/TradingContext';
import { formatIDR, formatCrypto } from '@/lib/utils';
import { Clock, CheckCircle2, XCircle, Ban, ListOrdered } from 'lucide-react';

export function OrderHistoryModal() {
  const { portfolio, cancelOrder } = useTrading();
  const [tab, setTab] = useState<'open' | 'history'>('open');

  const pendingOrders = portfolio.orders.filter((o) => o.status === 'pending');
  const pastOrders = portfolio.orders.filter((o) => o.status !== 'pending');

  return (
    <div className="flex flex-col bg-[#0d1320] border border-surface-border rounded-2xl overflow-hidden shadow-lg p-5">
      {/* Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-border/70 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('open')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              tab === 'open'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Order Terbuka ({pendingOrders.length})</span>
          </button>

          <button
            onClick={() => setTab('history')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              tab === 'history'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Riwayat Transaksi ({pastOrders.length})</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        {tab === 'open' ? (
          pendingOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Tidak ada order terbuka saat ini. Buat Limit Order untuk melihatnya di sini.
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-surface-border/40 text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="py-2 px-3">Waktu</th>
                  <th className="py-2 px-3">Pair</th>
                  <th className="py-2 px-3">Tipe</th>
                  <th className="py-2 px-3">Sisi</th>
                  <th className="py-2 px-3 text-right">Target Harga</th>
                  <th className="py-2 px-3 text-right">Jumlah</th>
                  <th className="py-2 px-3 text-right">Total IDR</th>
                  <th className="py-2 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/20">
                {pendingOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-surface-hover/30 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {new Date(o.createdAt).toLocaleTimeString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">{o.pair}</td>
                    <td className="py-2.5 px-3 uppercase text-[10px] text-amber-400 font-bold">
                      {o.type}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          o.side === 'buy'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {o.side}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-white">
                      {formatIDR(o.price)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {o.amount}
                    </td>
                    <td className="py-2.5 px-3 text-right text-white font-bold">
                      {formatIDR(o.totalIdr)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => cancelOrder(o.id)}
                        className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-sans font-medium transition-colors"
                      >
                        Batalkan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          pastOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Belum ada riwayat transaksi. Coba klik Buy atau Sell untuk simulasi!
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-surface-border/40 text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="py-2 px-3">Waktu</th>
                  <th className="py-2 px-3">Pair</th>
                  <th className="py-2 px-3">Tipe</th>
                  <th className="py-2 px-3">Sisi</th>
                  <th className="py-2 px-3 text-right">Harga Eksekusi</th>
                  <th className="py-2 px-3 text-right">Jumlah</th>
                  <th className="py-2 px-3 text-right">Total IDR</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/20">
                {pastOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-surface-hover/30 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {new Date(o.filledAt || o.createdAt).toLocaleTimeString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">{o.pair}</td>
                    <td className="py-2.5 px-3 uppercase text-[10px] text-slate-400">
                      {o.type}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          o.side === 'buy'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {o.side}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-white">
                      {formatIDR(o.price)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {o.amount}
                    </td>
                    <td className="py-2.5 px-3 text-right text-white font-bold">
                      {formatIDR(o.totalIdr)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {o.status === 'filled' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Berhasil</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium bg-slate-800 px-2 py-0.5 rounded">
                          <XCircle className="w-3 h-3" />
                          <span>Dibatalkan</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}

