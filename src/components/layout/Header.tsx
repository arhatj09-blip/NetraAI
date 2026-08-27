import React from 'react';
import { Sun, Moon, Settings, BrainCircuit, FileText } from 'lucide-react';
import { ThemeMode } from '../../hooks/useTheme';

interface HeaderProps {
  theme: ThemeMode;
  onThemeToggle: (mode: ThemeMode) => void;
  lastSync: string;
  nextSync: string;
  onOpenSettings: () => void;
  onOpenReportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onThemeToggle,
  lastSync,
  nextSync,
  onOpenSettings,
  onOpenReportModal,
}) => {
  const isDark = theme === 'dark';

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 px-6 lg:px-8 flex items-center justify-between transition-colors duration-300">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <BrainCircuit className="w-5 h-5" />
        </div>
        <div>
          <span className="font-extrabold tracking-tight text-sm uppercase text-slate-900 dark:text-white">
            NetraAI
          </span>
          <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            v2.4 Live
          </span>
        </div>
      </div>

      {/* Center: Live Ingestion Pipeline Status Pill */}
      <div className="hidden md:flex items-center gap-4 px-5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 status-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            Pipeline Active
          </span>
        </div>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
        <div className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <span>
            Last: <strong className="text-slate-900 dark:text-slate-200 ml-1 mono">{lastSync}</strong>
          </span>
          <span>
            Next: <strong className="text-slate-900 dark:text-slate-200 ml-1 mono">{nextSync}</strong>
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Generate Report Quick Button */}
        <button
          onClick={onOpenReportModal}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-all shadow-sm"
          title="Generate Intelligence Report"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Report</span>
        </button>

        {/* Theme Toggle Group */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
          <button
            onClick={() => onThemeToggle('light')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              !isDark
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-wider font-bold">Light</span>
          </button>
          <button
            onClick={() => onThemeToggle('dark')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              isDark
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-wider font-bold">Dark</span>
          </button>
        </div>

        {/* Settings Modal Button */}
        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all bg-white dark:bg-slate-800/60 shadow-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};
