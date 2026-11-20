import React from 'react';
import { Wallet, Globe2, Timer, ShieldCheck } from 'lucide-react';

export function StatsBanner() {
  const stats = [
    {
      icon: Wallet,
      value: 'Rp 100 Jt',
      label: 'Saldo Virtual Demo',
      color: 'text-amber-400',
    },
    {
      icon: Globe2,
      value: '3 Pair IDR',
      label: 'BTC, ETH & SOL Live',
      color: 'text-orange-400',
    },
    {
      icon: Timer,
      value: '1.4 Detik',
      label: 'Update Tick Real-Time',
      color: 'text-rose-400',
    },
    {
      icon: ShieldCheck,
      value: '100%',
      label: 'Aman & Bebas Risiko',
      color: 'text-emerald-400',
    },
  ];

  return (
    <div className="w-full py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-[#0c111e] border border-surface-border shadow-xl">
          {stats.map((s, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-surface-subtle border border-surface-border ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black font-mono text-white block tracking-tight">
                  {s.value}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

