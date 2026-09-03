import React from 'react';
import { Sparkles, User, ExternalLink } from 'lucide-react';
import { AIAnalystChatMessage, AIActionChip } from '../../types/aiAnalyst';

interface AIAnalystMessageProps {
  message: AIAnalystChatMessage;
  onActionClick?: (action: AIActionChip) => void;
}

export const AIAnalystMessage: React.FC<AIAnalystMessageProps> = ({
  message,
  onActionClick,
}) => {
  const isUser = message.sender === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-gradient-to-r from-blue-50 to-indigo-50/80 text-slate-900 border border-blue-200/80 dark:bg-blue-600 dark:text-white dark:border-transparent px-4 py-3 rounded-2xl rounded-tr-sm shadow-2xs dark:shadow-md space-y-1">
          <div className="flex items-center justify-end gap-1.5 text-[10px] uppercase font-bold text-blue-600 dark:text-blue-100">
            <User className="w-3 h-3" />
            <span>You • {message.timestamp}</span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-white">
            {message.text}
          </p>
        </div>
      </div>
    );
  }

  // AI Message - Analytical Card Format
  return (
    <div className="flex justify-start">
      <div className="max-w-[95%] w-full bg-[#F5F7FB] dark:bg-slate-900/90 p-4 sm:p-5 rounded-2xl rounded-tl-sm border border-slate-200/90 dark:border-slate-700/60 border-l-4 border-l-blue-600 dark:border-l-blue-500 shadow-2xs dark:shadow-lg space-y-3.5 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-700/40 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              NETRAAI ANALYST
            </span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-400 mono">
            {message.timestamp}
          </span>
        </div>

        {/* Analytical Paragraph */}
        <p className="text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
          {message.text}
        </p>

        {/* Highlighted Metric Blocks */}
        {message.metrics && message.metrics.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {message.metrics.map((m, idx) => {
              const borderBg =
                m.color === 'emerald'
                  ? 'border-emerald-200/90 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400'
                  : m.color === 'purple'
                  ? 'border-purple-200/90 bg-purple-50 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400'
                  : m.color === 'amber'
                  ? 'border-amber-200/90 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400'
                  : 'border-blue-200/90 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400';

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border ${borderBg} flex flex-col justify-between`}
                >
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                    {m.label}
                  </span>
                  <div className="my-0.5">
                    <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-inherit">
                      {m.value}
                    </span>
                  </div>
                  {m.subtext && (
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                      {m.subtext}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bullet Points */}
        {message.bulletPoints && message.bulletPoints.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {message.bulletPoints.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0 mt-1.5" />
                <span className="leading-snug">{point}</span>
              </div>
            ))}
          </div>
        )}

        {/* Analyst Summary Quote */}
        {message.summaryQuote && (
          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-slate-900/70 border border-blue-200/70 dark:border-slate-700/50">
            <span className="text-[9px] font-bold text-blue-700 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Key Deduction
            </span>
            <p className="text-xs text-slate-800 dark:text-slate-300 italic leading-relaxed">
              "{message.summaryQuote}"
            </p>
          </div>
        )}

        {/* Action Chips */}
        {message.actionChips && message.actionChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/70 dark:border-slate-700/40">
            {message.actionChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => onActionClick?.(chip)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
                           bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700
                           border border-slate-200 hover:border-blue-300 shadow-2xs
                           dark:bg-slate-700/50 dark:hover:bg-blue-600/20 dark:text-slate-300 dark:hover:text-blue-300
                           dark:border-slate-600/50 dark:hover:border-blue-500/40 text-[11px] font-semibold
                           transition-all focus:outline-none"
              >
                <span>{chip.label}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
