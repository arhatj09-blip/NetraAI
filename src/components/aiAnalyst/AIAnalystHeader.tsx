import React from 'react';
import { Sparkles, X, RotateCcw } from 'lucide-react';

interface AIAnalystHeaderProps {
  onClose: () => void;
  onClear: () => void;
  hasMessages: boolean;
}

export const AIAnalystHeader: React.FC<AIAnalystHeaderProps> = ({
  onClose,
  onClear,
  hasMessages,
}) => {
  return (
    <header className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/60 backdrop-blur-md flex items-center justify-between shrink-0">
      {/* Brand & Status */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 dark:bg-gradient-to-br dark:from-blue-500/20 dark:to-indigo-500/20 dark:border-blue-500/30 dark:text-blue-400 flex items-center justify-center shadow-2xs dark:shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              AI Analyst
            </h3>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20 px-1.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              Ready
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Context-aware intelligence
          </p>
        </div>
      </div>

      {/* Actions: Clear Chat & Close */}
      <div className="flex items-center gap-1.5">
        {hasMessages && (
          <button
            type="button"
            onClick={onClear}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 dark:hover:bg-slate-800/80 dark:text-slate-400 dark:hover:text-slate-200 transition-colors flex items-center justify-center focus:outline-none"
            title="Reset conversation"
            aria-label="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 dark:hover:bg-slate-800/80 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600"
          title="Close panel (ESC)"
          aria-label="Close AI Analyst panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
