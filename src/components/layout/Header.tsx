import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Settings, BrainCircuit, FileText, RefreshCw } from 'lucide-react';
import { ThemeMode } from '../../hooks/useTheme';
import { apiService } from '../../services/apiService';

interface HeaderProps {
  theme: ThemeMode;
  onThemeToggle: (mode: ThemeMode) => void;
  onOpenSettings: () => void;
  onOpenReportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onThemeToggle,
  onOpenSettings,
  onOpenReportModal,
}) => {
  const isDark = theme === 'dark';
  const [newAnalysisReady, setNewAnalysisReady] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkStatus = () => {
    apiService.getPipelineStatus()
      .then((status) => {
        if (status && status.new_analysis_ready) {
          setNewAnalysisReady(true);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    try {
      await apiService.ackRefresh();
      setNewAnalysisReady(false);
      window.dispatchEvent(new CustomEvent('refresh-dashboard'));
    } catch (err) {
      console.error('Failed to acknowledge refresh:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 px-6 lg:px-8 flex items-center justify-between transition-colors duration-300">
      {/* Brand Identity */}
      <Link to="/dashboard" className="flex items-center gap-3 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
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
      </Link>

      {/* Center: Live Ingestion Pipeline Status / Refresh Banner */}
      {newAnalysisReady ? (
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 shadow-sm animate-pulse">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
            New X analysis is ready
          </span>
          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all shadow-sm"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Dashboard</span>
          </button>
        </div>
      ) : (
        <div className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 status-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            Pipeline Active
          </span>
        </div>
      )}

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
