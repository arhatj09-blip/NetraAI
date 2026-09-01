import React from 'react';
import { Flame } from 'lucide-react';
import { Social3DMap } from '../crossPlatform/Social3DMap';
import { EmotionalPulseBar } from './EmotionalPulseBar';

interface XAnalysisSectionProps {
  isDark: boolean;
  activeDateRange?: {
    startDate: string;
    endDate: string;
  };
}

export const XAnalysisSection: React.FC<XAnalysisSectionProps> = ({
  isDark,
  activeDateRange,
}) => {
  const dateRangeDisplay = activeDateRange
    ? `${activeDateRange.startDate} to ${activeDateRange.endDate}`
    : 'All Time';

  return (
    <section id="x-analysis" className="space-y-8">
      {/* 3D Map for X */}
      <div className="lg:col-span-2 card-base rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              X Signal Clustering Map
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Vector coordinates of public discussions and repost velocity — {dateRangeDisplay}
            </p>
          </div>
          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-blue-200 dark:border-blue-800">
            124.4K Posts Analyzed
          </span>
        </div>

        <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 overflow-hidden shadow-inner">
          <Social3DMap platform="x" isDark={isDark} height="h-[460px]" />
        </div>
      </div>

      {/* Emotional Pulse & X Trends */}
      <div className="space-y-6 flex flex-col justify-between">
        <div className="card-base rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Emotional Pulse
            </h3>
            <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest border border-blue-200 dark:border-blue-800">
              Top: Excitement
            </span>
          </div>
          <EmotionalPulseBar isDark={isDark} height="h-[220px]" color="#3b82f6" />
        </div>

        <div className="card-base rounded-[2rem] p-6 sm:p-8">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            X-Specific Rising Hashtags
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <span className="text-xs font-bold text-slate-900 dark:text-white">#AgentDev</span>
              <span className="text-xs font-bold text-emerald-500 mono">+242%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <span className="text-xs font-bold text-slate-900 dark:text-white">#AI_Safety</span>
              <span className="text-xs font-bold text-emerald-500 mono">+184%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <span className="text-xs font-bold text-slate-900 dark:text-white">#GPTNext</span>
              <span className="text-xs font-bold text-emerald-500 mono">+112%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
