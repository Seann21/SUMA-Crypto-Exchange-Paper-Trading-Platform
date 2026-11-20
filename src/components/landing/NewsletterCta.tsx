'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';

export function NewsletterCta() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Masukkan alamat email yang valid.');
      return;
    }
    setIsSubmitted(true);
    toast.success('Terima kasih telah berlangganan!', {
      description: 'Insight pasar kripto akan dikirimkan ke email Anda.',
    });
    setEmail('');
  };

  return (
    <section className="w-full py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#101726] via-[#121a2c] to-[#0c1220] border border-surface-border shadow-2xl relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Text info */}
            <div className="lg:col-span-7">
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                Tetap Terdepan di Pasar Kripto
              </h3>
              <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-xl">
                Dapatkan insight pergerakan BTC/IDR, ETH/IDR, dan strategi paper trading terbaru dari SUMA.
              </p>
            </div>

            {/* Email Form */}
            <div className="lg:col-span-5">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email Anda..."
                  className="w-full sm:flex-1 px-4 py-3.5 rounded-2xl bg-surface-subtle border border-surface-border text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex-shrink-0"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

