import React from 'react';
import { createPortal } from 'react-dom';
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
  const content = (
    /* z-40: sits below the popup (z-50) but above dashboard content */
    <div className="fixed bottom-6 right-6 z-40 group select-none">
      {/* Tooltip — only when popup is closed */}
      {!isOpen && (
        <div className="absolute bottom-full right-0 mb-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/95 text-xs text-slate-200 font-medium border border-slate-700/60 shadow-lg backdrop-blur-md flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ask AI Analyst ({platform.toUpperCase()} Context)</span>
          </div>
        </div>
      )}

      {/* Floating Pill Button */}
      <button
        type="button"
        onClick={onClick}
        aria-label={isOpen ? 'AI Analyst is open' : 'Ask AI Analyst'}
        aria-expanded={isOpen}
        className={`
          relative flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full
          text-white
          border
          backdrop-blur-xl
          transition-all duration-300
          hover:scale-105 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-blue-400/40
          ${isOpen
            ? 'bg-blue-600/90 border-blue-400/60 shadow-[0_4px_20px_rgba(59,130,246,0.4)] scale-95'
            : 'bg-slate-900/90 dark:bg-slate-900/95 border-blue-500/30 hover:border-blue-400/80 shadow-[0_8px_30px_rgba(0,0,0,0.35),0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_8px_35px_rgba(0,0,0,0.45),0_0_25px_rgba(59,130,246,0.35)]'
          }
        `}
      >
        {/* Ambient idle glow ring — only when closed */}
        {!isOpen && (
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 blur-sm pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity" />
        )}

        {/* Icon */}
        <div className={`relative w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-400'}`}>
          <Sparkles className={`w-3.5 h-3.5 ${isOpen ? '' : 'animate-pulse'}`} />
        </div>

        {/* Label */}
        <span className="relative text-xs sm:text-sm font-bold tracking-wide text-slate-100 group-hover:text-white transition-colors">
          AI Analyst
        </span>

        {/* "Active" context badge */}
        {hasActiveContext && !isOpen && (
          <span className="relative px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/25 text-blue-300 border border-blue-400/30">
            Active
          </span>
        )}

        {/* Status dot */}
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen ? 'bg-white' : 'bg-emerald-400'}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isOpen ? 'bg-white' : 'bg-emerald-500'}`} />
        </span>
      </button>
    </div>
  );

  const mountTarget = document.getElementById('modal-root') ?? document.body;
  return createPortal(content, mountTarget);
};
