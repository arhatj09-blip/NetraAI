import React from 'react';
import { PipelineHero } from '../components/hero/PipelineHero';
import { PlatformCardsSection } from '../components/platforms/PlatformCardsSection';
import { SearchSection } from '../components/search/SearchSection';
import { usePipelineCountdown } from '../hooks/usePipelineCountdown';

export const Home: React.FC = () => {
  const {
    formattedTime,
    strokeDashoffset,
    totalCircumference,
    recordsCount,
    lastSync,
    isRefreshing,
  } = usePipelineCountdown(522); // ~08:42 countdown

  return (
    <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-8 py-8 sm:py-10 space-y-16 sm:space-y-20">
      {/* Section 1: Pipeline Ingestion Status */}
      <PipelineHero
        formattedTime={formattedTime}
        strokeDashoffset={strokeDashoffset}
        totalCircumference={totalCircumference}
        recordsCount={recordsCount}
        lastSync={lastSync}
        isRefreshing={isRefreshing}
      />

      {/* Section 2: Platform Cards */}
      <PlatformCardsSection />

      {/* Section 3: Search & Analyze */}
      <SearchSection />
    </main>
  );
};
