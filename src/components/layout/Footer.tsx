import React from 'react';
import { Server, Shield, Lock, FileCode } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 py-12 px-8 bg-white dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors mt-20">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-wrap items-center justify-center gap-8">
          <p className="text-slate-700 dark:text-slate-300">© 2026 NETRAAI</p>
          <a href="#pipeline-monitor" className="hover:text-blue-600 dark:hover:text-white transition-colors flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5" /> Pipeline Status
          </a>
          <a href="#demographics" className="hover:text-blue-600 dark:hover:text-white transition-colors flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Analytic Methodology
          </a>
          <a href="#cross-platform" className="hover:text-blue-600 dark:hover:text-white transition-colors flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Data Ethics & Compliance
          </a>
        </div>
        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>NODE ID: US-WEST-04 (ACTIVE)</span>
          </div>
          <span>•</span>
          <span className="flex items-center gap-1">
            <FileCode className="w-3.5 h-3.5 text-blue-500" /> PROD CLUSTER 01
          </span>
        </div>
      </div>
    </footer>
  );
};
