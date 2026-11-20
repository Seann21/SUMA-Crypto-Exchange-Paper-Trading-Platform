import type { Metadata } from 'next';
import './globals.css';
import { MarketDataProvider } from '@/context/MarketDataContext';
import { TradingProvider } from '@/context/TradingContext';
import { Navbar } from '@/components/common/Navbar';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'SUMA - Crypto Exchange & Paper Trading Platform',
  description:
    'Platform Spot Paper Trading Kripto Indonesia real-time dengan grafik candlestick interaktif, order book dinamis, dan saldo virtual IDR 100.000.000 tanpa risiko.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <body
        className="min-h-screen bg-[#080b11] text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950 flex flex-col"
        suppressHydrationWarning
      >
        <MarketDataProvider>
          <TradingProvider>
            <Navbar />
            <main className="flex-1 w-full flex flex-col">{children}</main>
            <Toaster richColors position="top-right" theme="dark" />
          </TradingProvider>
        </MarketDataProvider>
      </body>
    </html>
  );
}
