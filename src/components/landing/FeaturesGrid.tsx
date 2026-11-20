import React from 'react';
import { Shield, Zap, Clock, UserCheck } from 'lucide-react';

export function FeaturesGrid() {
  const features = [
    {
      icon: Shield,
      title: 'Bebas Risiko',
      desc: 'Latihan trading dengan dana virtual.',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      icon: Zap,
      title: 'Eksekusi Instan',
      desc: 'Market & Limit Order real-time.',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10 border-orange-500/20',
    },
    {
      icon: Clock,
      title: 'Live PnL Tracker',
      desc: 'Hitung persentase profit otomatis.',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      icon: UserCheck,
      title: 'Akses 1-Klik',
      desc: 'Demo cepat untuk recruiter.',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20',
    },
  ];

  return (
    <div className="w-full py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex items-start gap-3.5 p-4 rounded-2xl bg-surface-subtle/50 border border-surface-border/60 hover:bg-surface-subtle transition-all"
            >
              <div className={`p-2.5 rounded-xl border ${f.bgColor} ${f.color} flex-shrink-0`}>
                <f.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-snug">{f.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-normal">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

