import React from 'react';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

interface PipelineHeroProps {
  formattedTime: string;
  strokeDashoffset: number;
  totalCircumference: number;
  recordsCount: number;
  lastSync: string;
  isRefreshing: boolean;
}

export const PipelineHero: React.FC<PipelineHeroProps> = ({
  formattedTime,
  strokeDashoffset,
  totalCircumference,
  recordsCount,
  lastSync,
  isRefreshing,
}) => {
  return (
    <section id="pipeline-hero" className="relative">
      <div className="card-base rounded-[2.5rem] p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between relative overflow-hidden transition-colors">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="z-10 flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-3 h-3" />
              System Operational
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">
              Continuous Ingestion Engine v2.4
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
            Pipeline Ingestion Active
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-xl text-sm leading-relaxed">
            Real-time analysis is currently processing synchronized data batches across decentralized social media platforms (X, Telegram, and public communication feeds). Next recalculation scheduled automatically.
          </p>

          <div className="grid grid-cols-3 gap-6 sm:gap-10 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="border-l-2 border-blue-500 pl-4 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
                Last Ingestion
              </p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mono">
                {lastSync}
              </p>
            </div>
            <div className="border-l-2 border-indigo-500 pl-4 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
                Records Processed
              </p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mono">
                {recordsCount.toLocaleString()}
              </p>
            </div>
            <div className="border-l-2 border-emerald-500 pl-4 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
                API Health
              </p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mono">
                99.8%
              </p>
            </div>
          </div>
        </div>

        {/* Circular Countdown SVG Animation */}
        <div className="z-10 mt-10 lg:mt-0 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            <svg className="w-48 h-48 sm:w-52 sm:h-52 transform -rotate-90">
              {/* Background Track Circle */}
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="10"
              />
              {/* Animated Progress Circle */}
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="10"
                strokeDasharray={totalCircumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mono tracking-tight">
                {formattedTime}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mt-1">
                Till Refresh
              </span>
            </div>
          </div>

          <p className="mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Recalculating Signals...' : 'Synchronizing Nodes'}
          </p>
        </div>
      </div>
    </section>
  );
};
