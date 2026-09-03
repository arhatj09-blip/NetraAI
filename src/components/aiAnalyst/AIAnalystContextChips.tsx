import React from 'react';
import { Layers, Hash, Calendar } from 'lucide-react';
import { AIAnalystContext } from '../../types/aiAnalyst';

interface AIAnalystContextChipsProps {
  context?: AIAnalystContext;
}

export const AIAnalystContextChips: React.FC<AIAnalystContextChipsProps> = ({ context }) => {
  const platformLabel = (context?.platform || 'X').toUpperCase();
  const hashtagLabel = context?.hashtag || 'Overall Analysis';
  const isHashtagActive = !!context?.hashtag;

  // Format date range nicely
  const formatDateRange = (start?: string, end?: string) => {
    if (!start || !end) return 'Aug 01 – Aug 27';
    try {
      const s = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const e = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${s} – ${e}`;
    } catch {
      return `${start} – ${end}`;
    }
  };

  const dateSpan = formatDateRange(context?.startDate, context?.endDate);

  return (
    <div className="px-5 py-2.5 bg-slate-900/40 border-b border-slate-800/80 shrink-0">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-1 shrink-0">
          Context:
        </span>

        {/* Platform Chip */}
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold shrink-0">
          <Layers className="w-3 h-3" />
          <span>{platformLabel}</span>
        </span>

        {/* Hashtag / Subject Chip */}
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold shrink-0 border ${
            isHashtagActive
              ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
              : 'bg-slate-800 text-slate-300 border-slate-700/60'
          }`}
        >
          <Hash className="w-3 h-3" />
          <span>{hashtagLabel}</span>
        </span>

        {/* Date Range Chip */}
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60 font-medium shrink-0">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span>{dateSpan}</span>
        </span>
      </div>
    </div>
  );
};
