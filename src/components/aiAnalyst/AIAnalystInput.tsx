import React from 'react';
import { Send, AlertCircle, RefreshCw } from 'lucide-react';

interface AIAnalystInputProps {
  inputValue: string;
  onChange: (val: string) => void;
  onSubmit: (text?: string) => void;
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  platform?: string;
}

export const AIAnalystInput: React.FC<AIAnalystInputProps> = ({
  inputValue,
  onChange,
  onSubmit,
  isLoading,
  error,
  onRetry,
  platform = 'X',
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && inputValue.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <footer className="p-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/80 backdrop-blur-md shrink-0 space-y-2">
      {/* Error Banner */}
      {error && (
        <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 flex items-center justify-between text-xs text-red-700 dark:text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 dark:text-red-300 hover:underline ml-2"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Typing Indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 px-1 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce [animation-delay:0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce [animation-delay:0.3s]" />
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Analyst synthesizing {platform.toUpperCase()} telemetry...
          </span>
        </div>
      )}

      {/* Input Field and Send Button */}
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 focus-within:border-blue-500/80 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/15 dark:bg-slate-800/80 dark:border-slate-700/70 dark:focus-within:border-blue-500/60 dark:focus-within:ring-blue-500/20 rounded-xl p-1.5 pl-3 transition-all shadow-2xs dark:shadow-none">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder={`Ask about ${platform.toUpperCase()} trends, sentiment, or network...`}
          className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder-slate-400 dark:text-slate-100 dark:placeholder-slate-400 py-1.5 disabled:opacity-50"
          aria-label="Ask about analysis"
        />

        <button
          type="button"
          onClick={() => onSubmit()}
          disabled={isLoading || !inputValue.trim()}
          aria-label="Send query"
          className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 dark:disabled:bg-slate-700 text-white disabled:text-slate-400 dark:disabled:text-slate-500 flex items-center justify-center transition-all shrink-0 focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Micro Status Label */}
      <div className="flex items-center justify-between px-1 text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
        <span>NetraAI Contextual Agent</span>
        <span>Phase 1 Prototype</span>
      </div>
    </footer>
  );
};
