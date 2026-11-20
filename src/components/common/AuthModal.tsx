'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TigerLogo } from './TigerLogo';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { X, Sparkles, Mail, Lock, ArrowRight, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const [view, setView] = useState<'login' | 'signup' | 'verify_email'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailNotConfirmedError, setEmailNotConfirmedError] = useState(false);
  const [isResending, setIsResending] = useState(false);

  if (!isOpen) return null;

  const handleGuestLogin = () => {
    toast.success('Masuk sebagai Guest Recruiter!', {
      description: 'Saldo virtual Rp 100.000.000 telah diaktifkan untuk simulasi.',
    });
    onClose();
    router.push('/trade');
  };

  const handleResendConfirmation = async () => {
    if (!email || !supabase) return;
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      toast.success('Email Konfirmasi Dikirim Ulang!', {
        description: `Silakan periksa inbox atau spam di ${email}`,
      });
    } catch (err: any) {
      toast.error('Gagal mengirim ulang email', {
        description: err.message || 'Coba beberapa saat lagi.',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setEmailNotConfirmedError(false);

    if (!email || !password) {
      toast.error('Email dan kata sandi wajib diisi');
      setIsLoading(false);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      // Friendly fallback when Supabase keys are not set up
      toast.success('Mode Demo Aktif!', {
        description: `Berhasil login simulasi dengan email: ${email}`,
      });
      setIsLoading(false);
      onClose();
      router.push('/trade');
      return;
    }

    try {
      if (view === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        // If email confirmation is required by Supabase (no active session yet)
        if (data.user && !data.session) {
          setView('verify_email');
          toast.info('Pendaftaran Berhasil!', {
            description: 'Silakan periksa inbox email Anda untuk konfirmasi.',
          });
        } else {
          // If email confirmation is disabled in Supabase, session is ready immediately
          toast.success('Pendaftaran Berhasil!', {
            description: 'Akun Anda berhasil dibuat & saldo Rp 100 Jt aktif!',
          });
          onClose();
          router.push('/trade');
        }
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        toast.success('Login Berhasil!', {
          description: `Selamat datang kembali, ${data.user?.email}`,
        });
        setEmail('');
        setPassword('');
        setEmailNotConfirmedError(false);
        onClose();
        router.push('/trade');
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('email not confirmed')) {
        setEmailNotConfirmedError(true);
        toast.error('Email Belum Dikonfirmasi', {
          description: 'Buka email Anda dan klik link konfirmasi sebelum login.',
        });
      } else {
        toast.error('Gagal Autentikasi', {
          description: msg || 'Terjadi kesalahan saat masuk.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0e1422] border border-surface-border shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Glow accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* View: VERIFY EMAIL SCREEN */}
        {view === 'verify_email' ? (
          <div className="flex flex-col items-center text-center py-2 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
              <Mail className="w-8 h-8 animate-bounce" />
            </div>

            <h3 className="text-xl font-black text-white mb-2">
              Konfirmasi Email Anda 📩
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mb-4">
              Tautan konfirmasi pendaftaran akun telah dikirim ke:
              <strong className="block text-amber-400 font-mono mt-1 text-sm break-all">
                {email}
              </strong>
            </p>

            <div className="w-full p-4 rounded-xl bg-surface-subtle border border-surface-border text-left text-xs text-slate-300 space-y-2 mb-6">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>Buka inbox atau folder <strong>Spam</strong> pada email Anda.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>Klik tombol <strong>Confirm your mail</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <span>Kembali ke sini dan klik tombol <strong>"Saya Sudah Konfirmasi"</strong> di bawah.</span>
              </div>
            </div>

            <button
              onClick={() => {
                setView('login');
                setEmailNotConfirmedError(false);
              }}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] mb-3"
            >
              Saya Sudah Konfirmasi (Masuk Akun)
            </button>

            <button
              onClick={handleResendConfirmation}
              disabled={isResending}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>{isResending ? 'Mengirim ulang...' : 'Belum menerima email? Kirim ulang'}</span>
            </button>
          </div>
        ) : (
          /* View: LOGIN / SIGNUP FORM */
          <>
            {/* Logo and Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <TigerLogo size="lg" showText={false} className="mb-3" />
              <h3 className="text-xl font-extrabold text-white">
                {view === 'signup' ? 'Buat Akun SUMA' : 'Masuk ke SUMA Platform'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Uji simulasi trading crypto spot real-time dengan saldo dummy Rp 100.000.000
              </p>
            </div>

            {/* Warning Banner if Email Not Confirmed */}
            {emailNotConfirmedError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-rose-300 font-semibold mb-1">
                      Email Belum Dikonfirmasi!
                    </strong>
                    <p className="text-rose-400/90 leading-relaxed mb-2">
                      Silakan buka inbox email <span className="font-mono text-white">{email}</span> dan klik link konfirmasi Supabase.
                    </p>
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={isResending}
                      className="text-amber-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                      <span>Kirim ulang link konfirmasi</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick 1-Click Guest Button for Recruiters */}
            <div className="mb-5 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Mode Cepat untuk Recruiter
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mb-2.5">
                Buka platform langsung tanpa login/registrasi dengan modal virtual Rp 100 Jt.
              </p>
              <button
                onClick={handleGuestLogin}
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] transform active:scale-[0.99]"
              >
                <span>Masuk Auto Guest Demo (1-Klik)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="relative flex items-center justify-center mb-4">
              <div className="border-t border-surface-border w-full" />
              <span className="bg-[#0e1422] px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                atau login email
              </span>
              <div className="border-t border-surface-border w-full" />
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailNotConfirmedError(false);
                    }}
                    placeholder="recruiter@company.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-surface-subtle border border-surface-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setEmailNotConfirmedError(false);
                    }}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-surface-subtle border border-surface-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-surface-hover hover:bg-slate-700 border border-surface-border transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : view === 'signup' ? (
                  'Daftar Akun Baru'
                ) : (
                  'Masuk Akun'
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setView(view === 'signup' ? 'login' : 'signup');
                  setEmailNotConfirmedError(false);
                }}
                className="text-xs text-slate-400 hover:text-amber-400 transition-colors"
              >
                {view === 'signup'
                  ? 'Sudah punya akun? Masuk'
                  : 'Belum punya akun? Buat akun gratis'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
