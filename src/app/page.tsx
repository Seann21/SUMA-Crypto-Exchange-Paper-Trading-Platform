import React from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { TickerTape } from '@/components/landing/TickerTape';
import { BentoFeatures } from '@/components/landing/BentoFeatures';
import { MarketOverviewSection } from '@/components/landing/MarketOverviewSection';
import { StatsBanner } from '@/components/landing/StatsBanner';
import { NewsletterCta } from '@/components/landing/NewsletterCta';
import { Footer } from '@/components/common/Footer';

export default function HomePage() {
  return (
    <div className="w-full flex flex-col flex-1">
      {/* 1. Hero Section matching Screenshot 1 */}
      <HeroSection />

      {/* 2. 4 Features & Live Ticker Strip matching Screenshot 2 */}
      <FeaturesGrid />
      <TickerTape />

      {/* 3. Bento Features & Market Overview matching Screenshot 3 */}
      <BentoFeatures />
      <MarketOverviewSection />

      {/* 4. Stats Banner & Newsletter CTA matching Screenshot 4 */}
      <StatsBanner />
      <NewsletterCta />

      {/* 5. Footer matching Screenshot 4 */}
      <Footer />
    </div>
  );
}

