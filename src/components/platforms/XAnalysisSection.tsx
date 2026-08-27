import React, { useState } from 'react';
import { Twitter, RefreshCw, Calendar, Flame } from 'lucide-react';
import { Social3DMap } from '../crossPlatform/Social3DMap';
import { EmotionalPulseBar } from './EmotionalPulseBar';

interface XAnalysisSectionProps {
  isDark: boolean;
}

export const XAnalysisSection: React.FC<XAnalysisSectionProps> = ({ isDark }) => {
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-27');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateRange = () => {
    setIsUpdating(true);
    setTimeout(() => setIsUpdating(false), 800);
  };

  return (
    <section id="x-analysis" className="space-y-8">
      {/* Header with Date Range Picker */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
            <Twitter className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              X (Twitter) Signal Vector Space
            </h2>
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
              High-Velocity Public Node Infiltration
            </p>
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="flex items-center gap-3 p-2 px-4 rounded-2xl card-base shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div className="flex flex-col">
              <label className="text-[9px] font-bold text-slate-400 uppercase">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs text-slate-900 dark:text-white mono outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

          <div className="flex flex-col">
            <label className="text-[9px] font-bold text-slate-400 uppercase">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-xs text-slate-900 dark:text-white mono outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleUpdateRange}
            disabled={isUpdating}
            className="ml-2 p-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Apply</span>
          </button>
        </div>
      </div>

      {/* Grid: 3D Visualization + Emotional Pulse & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Map for X */}
        <div className="lg:col-span-2 card-base rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                X Signal Clustering Map
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Vector coordinates of public discussions and repost velocity
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
      </div>
    </section>
  );
};
