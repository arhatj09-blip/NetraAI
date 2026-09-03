import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIAnalystTriggerProps {
  isOpen: boolean;
  onClick: () => void;
  platform?: string;
  hasActiveContext?: boolean;
}

export const AIAnalystTrigger: React.FC<AIAnalystTriggerProps> = ({
  isOpen,
  onClick,
  platform = 'x',
  hasActiveContext = false,
}) => {
  if (isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 group select-none">
      {/* Subtle tooltip on hover */}
      <div className="absolute bottom-full right-0 mb-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 dark:bg-slate-800/95 text-xs text-slate-200 font-medium border border-slate-700/60 shadow-lg backdrop-blur-md flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Ask AI Analyst ({platform.toUpperCase()} Context)</span>
        </div>
      </div>

      {/* Floating Pill Button */}
      <button
        type="button"
        onClick={onClick}
        aria-label="Ask AI Analyst"
        className="relative flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full
                   bg-slate-900/90 dark:bg-slate-900/95 text-white
                   border border-blue-500/30 hover:border-blue-400/80
                   shadow-[0_8px_30px_rgba(0,0,0,0.35),0_0_20px_rgba(59,130,246,0.2)]
                   hover:shadow-[0_8px_35px_rgba(0,0,0,0.45),0_0_25px_rgba(59,130,246,0.35)]
                   backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95
                   focus:outline-none focus:ring-2 focus:ring-blue-400/40"
      >
        {/* Ambient idle glow ring */}
        <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 blur-sm pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity" />

        {/* Sparkle Icon with micro-animation */}
        <div className="relative w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        </div>

        {/* Label */}
        <span className="relative text-xs sm:text-sm font-bold tracking-wide text-slate-100 group-hover:text-white transition-colors">
          AI Analyst
        </span>

        {/* Context badge if hashtag or specific filter active */}
        {hasActiveContext && (
          <span className="relative px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/25 text-blue-300 border border-blue-400/30">
            Active
          </span>
        )}

        {/* Green status ping */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      </button>
    </div>
  );
};
