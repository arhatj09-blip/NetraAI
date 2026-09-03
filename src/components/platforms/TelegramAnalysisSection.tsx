import React from 'react';
import { Send, ShieldCheck, Lock } from 'lucide-react';
import { DynamicSocialNetwork } from '../network/DynamicSocialNetwork';

interface TelegramAnalysisSectionProps {
  isDark: boolean;
  activeDateRange?: {
    startDate: string;
    endDate: string;
  };
}

export const TelegramAnalysisSection: React.FC<TelegramAnalysisSectionProps> = ({
  isDark,
  activeDateRange,
}) => {
  const dateRangeDisplay = activeDateRange
    ? `${activeDateRange.startDate} to ${activeDateRange.endDate}`
    : 'All Time';
  return (
    <section id="telegram-analysis" className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-sm">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Telegram Alpha Ingestion
            </h2>
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
              Encrypted Node Intelligence &amp; Alpha Signal Flow — {dateRangeDisplay}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5" /> 50 Alpha Channels Ingested
        </div>
      </div>

      <div className="card-base rounded-[2.5rem] p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Alpha Cluster Vector Topology (3D)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-confidence early signals identified in private developer channels
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <Lock className="w-3.5 h-3.5 text-sky-500" />
            <span>88% Net Sentiment Confidence</span>
          </div>
        </div>

        <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 overflow-hidden shadow-inner">
          <DynamicSocialNetwork isDark={isDark} startDate={activeDateRange?.startDate} endDate={activeDateRange?.endDate} />
        </div>
      </div>
    </section>
  );
};
