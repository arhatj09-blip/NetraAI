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
    <header className="px-5 py-4 border-b border-slate-700/50 bg-slate-900/60 dark:bg-slate-950/60 backdrop-blur-md flex items-center justify-between shrink-0">
      {/* Brand & Status */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight">
              AI Analyst
            </h3>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Ready
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
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
            className="w-8 h-8 rounded-lg hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center focus:outline-none"
            title="Reset conversation"
            aria-label="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg hover:bg-slate-800/80 text-slate-400 hover:text-white transition-colors flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-slate-600"
          title="Close panel (ESC)"
          aria-label="Close AI Analyst panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
