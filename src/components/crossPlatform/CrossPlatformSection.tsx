import React, { useState } from 'react';
import { Twitter, MessageSquare, Send, Globe, TrendingUp } from 'lucide-react';
import { MetricsGrid } from './MetricsGrid';
import { Social3DMap } from './Social3DMap';
import { SentimentDonut } from './SentimentDonut';
import { SentimentTimeline } from './SentimentTimeline';
import { PlatformVarianceBar } from './PlatformVarianceBar';
import { BenchmarkTable } from './BenchmarkTable';
import { AIInsightCard } from './AIInsightCard';
import {
  getKPIMetrics,
  sentimentDistributionData,
  sentimentTimelineData,
  trendingTopicsData,
} from '../../services/mockData';
import { PlatformType } from '../../types/intelligence';

interface CrossPlatformSectionProps {
  isDark: boolean;
  onOpenReportModal: () => void;
}

export const CrossPlatformSection: React.FC<CrossPlatformSectionProps> = ({
  isDark,
  onOpenReportModal,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('all');
  const [timelineRange, setTimelineRange] = useState<'1H' | '6H' | '24H' | '7D'>('24H');

  const currentMetrics = getKPIMetrics(selectedPlatform);
  const currentSentiment = sentimentDistributionData[selectedPlatform] || sentimentDistributionData.all;
  const currentTimeline = sentimentTimelineData[timelineRange];

  return (
    <section id="cross-platform" className="space-y-8">
      {/* Header & Platform Filter Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Cross-Platform Intelligence
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Unified Social Signals Dashboard
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Continuous ingestion & signal vector space across X (Twitter) and social media platforms
          </p>
        </div>

        {/* Platform Selector Tabs */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <button
            onClick={() => setSelectedPlatform('all')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              selectedPlatform === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> All
          </button>
          <button
            onClick={() => setSelectedPlatform('x')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              selectedPlatform === 'x'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Twitter className="w-3.5 h-3.5 text-blue-400" /> X (Twitter)
          </button>
          <button
            onClick={() => setSelectedPlatform('social')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              selectedPlatform === 'social'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Social Feeds
          </button>
          <button
            onClick={() => setSelectedPlatform('telegram')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              selectedPlatform === 'telegram'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-sky-400" /> Telegram
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <MetricsGrid metrics={currentMetrics} />

      {/* 3D Social Intelligence Vector Map */}
      <div className="card-base rounded-[2.5rem] p-6 sm:p-8 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              3D Social Intelligence Vector Space Map
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Vector space mapping of trending clusters (Trend Velocity × Sentiment Score × Influence Index)
            </p>
          </div>
          <div className="flex items-center gap-4 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> X (Twitter)
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div> Reddit
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-sky-500"></div> Telegram
            </div>
          </div>
        </div>

        <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-slate-200 dark:border-slate-800 p-2 overflow-hidden shadow-inner">
          <Social3DMap platform={selectedPlatform} isDark={isDark} height="h-[520px]" />
        </div>
      </div>

      {/* Sentiment Dynamics: Donut + Timeline + Variance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Donut */}
        <div className="card-base rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Sentiment Distribution
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {selectedPlatform.toUpperCase()}
            </span>
          </div>

          <SentimentDonut distribution={currentSentiment} isDark={isDark} height="h-[230px]" />

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">Pos</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mono">{currentSentiment.positive}%</p>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/20">
              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase">Neu</p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mono">{currentSentiment.neutral}%</p>
            </div>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/20">
              <p className="text-[10px] text-rose-700 dark:text-rose-400 font-bold uppercase">Neg</p>
              <p className="text-lg font-bold text-rose-600 dark:text-rose-400 mono">{currentSentiment.negative}%</p>
            </div>
          </div>
        </div>

        {/* Sentiment Timeline */}
        <div className="card-base rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Sentiment Dynamics Flow
            </h3>
            <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
              {(['1H', '6H', '24H', '7D'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimelineRange(range)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    timelineRange === range
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <SentimentTimeline timeline={currentTimeline} isDark={isDark} height="h-[230px]" />

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span>Aggregated Spline Model</span>
            <span className="text-emerald-500 font-semibold">+8.4% Net Increase</span>
          </div>
        </div>

        {/* Platform Variance */}
        <div className="card-base rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Platform Positivity Index
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              Benchmark
            </span>
          </div>

          <PlatformVarianceBar isDark={isDark} height="h-[230px]" />

          <div className="text-xs text-slate-500 dark:text-slate-400 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            Telegram shows strongest enthusiasm; Reddit maintains critical scrutiny.
          </div>
        </div>
      </div>

      {/* Trending Topics & AI Insight Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-base rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Cross-Platform Trending Topics
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              Updated Live
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendingTopicsData.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                      {item.tag}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {item.mentions}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {item.growth}
                  </span>
                </div>
                {item.progressPercent && (
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-3">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.progressPercent}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight Card */}
        <AIInsightCard onRunReport={onOpenReportModal} />
      </div>

      {/* Cross-Platform Comparison Table */}
      <BenchmarkTable />
    </section>
  );
};
