import React from 'react';
import { X, Sliders, Shield, RefreshCw, Moon, Sun } from 'lucide-react';
import { ThemeMode } from '../../hooks/useTheme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onThemeToggle: (mode: ThemeMode) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onThemeToggle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="card-base rounded-[2rem] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 dark:border-slate-700">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Platform Settings</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">NetraAI Cluster Telemetry Configuration</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Theme Preference */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Interface Theme
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onThemeToggle('light')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  theme === 'light'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                <Sun className="w-4 h-4" /> Light Mode
              </button>
              <button
                onClick={() => onThemeToggle('dark')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  theme === 'dark'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                <Moon className="w-4 h-4" /> Dark Mode
              </button>
            </div>
          </div>

          {/* Sync Interval */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-blue-500" /> Auto-Ingestion Refresh Rate
            </label>
            <select className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none">
              <option value="15">Every 15 Minutes (Default Continuous Engine)</option>
              <option value="5">Every 5 Minutes (High Frequency Infiltration)</option>
              <option value="30">Every 30 Minutes (Consolidated)</option>
              <option value="60">Every 1 Hour (Batch Archives)</option>
            </select>
          </div>

          {/* Security Protocols */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Encrypted Node Anonymization</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                All PII across X, Reddit, and Telegram alpha channels is stripped before vector indexing.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
