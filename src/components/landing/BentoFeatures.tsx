import React from 'react';
import { BarChart3, Wallet, Layers, Activity } from 'lucide-react';

export function BentoFeatures() {
  const cards = [
    {
      icon: BarChart3,
      title: 'Live Candlestick',
      desc: 'Grafik 1M hingga 4J untuk BTC, ETH & SOL/IDR.',
      iconColor: 'text-amber-400',
    },
    {
      icon: Wallet,
      title: 'Saldo Rp 100 Jt',
      desc: 'Dana virtual siap pakai untuk simulasi spot.',
      iconColor: 'text-orange-400',
    },
    {
      icon: Layers,
      title: 'Market & Limit',
      desc: 'Order book interaktif & eksekusi otomatis.',
      iconColor: 'text-rose-400',
    },
    {
      icon: Activity,
      title: 'Real-Time PnL',
      desc: 'Pantau persentase untung/rugi setiap detik.',
      iconColor: 'text-emerald-400',
    },
  ];

  return (
    <section id="fitur" className="w-full py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-snug">
            Semua yang Anda Butuhkan dalam{' '}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
              Satu Platform SUMA
            </span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
            Dirancang setajam insting Harimau Sumatra — cepat, presisi, dan mudah digunakan untuk simulasi trading profesional.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-gradient-to-b from-[#111728] to-[#0d121f] border border-surface-border hover:border-amber-500/40 transition-all group"
            >
              <div className={`p-3 rounded-xl bg-surface-subtle w-fit border border-surface-border mb-4 ${c.iconColor} group-hover:scale-110 transition-transform`}>
                <c.icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{c.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

