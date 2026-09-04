import React, { useEffect, useState } from 'react';
import {
  Database,
  CheckCircle,
  RefreshCw,
  Twitter,
  Layers,
  Smile,
  Activity,
  Fingerprint,
  TrendingUp,
  Share2,
  Sparkles,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  initialIngestionLogs,
  pipelineStages,
} from '../../services/mockData';
import { apiService, PipelineStatus } from '../../services/apiService';

export const PipelineMonitorSection: React.FC = () => {
  const [pipelineData, setPipelineData] = useState<PipelineStatus | null>(null);

  useEffect(() => {
    let isMounted = true;
    apiService.getPipelineStatus()
      .then((data) => {
        if (isMounted) setPipelineData(data);
      })
      .catch((err) => {
        console.warn('Pipeline status API fallback:', err);
      });

    const interval = window.setInterval(() => {
      apiService.getPipelineStatus()
        .then((data) => {
          if (isMounted) setPipelineData(data);
        })
        .catch(() => {});
    }, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const getStageIcon = (iconName: string) => {
    switch (iconName) {
      case 'database':
        return <Database className="w-5 h-5" />;
      case 'smile':
        return <Smile className="w-5 h-5" />;
      case 'activity':
        return <Activity className="w-5 h-5" />;
      case 'fingerprint':
        return <Fingerprint className="w-5 h-5" />;
      case 'layers':
        return <Layers className="w-5 h-5" />;
      case 'trending-up':
        return <TrendingUp className="w-5 h-5" />;
      case 'share-2':
        return <Share2 className="w-5 h-5" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const totalRecords = pipelineData?.records_processed || 15000;
  const xRecords = pipelineData?.platform_records?.['x'] || 15000;

  return (
    <section id="pipeline-monitor" className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Pipeline Status Monitor
            </h2>
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              Near-real-time simulated pipeline (15-minute ingestion cycle)
            </p>
          </div>
        </div>

        <span className="px-5 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 status-pulse"></div>
          {pipelineData?.status ? pipelineData.status.toUpperCase() : 'OPERATIONAL'} (15-MIN BATCH CYCLE)
        </span>
      </div>

      {/* Row: Processing Distribution + Live Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Processing Distribution */}
        <div className="card-base rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-widest text-slate-500 dark:text-slate-400">
              Processing Distribution
            </h3>

            <div className="space-y-6">
              {/* X */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Twitter className="w-3.5 h-3.5 text-blue-500" /> X (Twitter) Historical Dataset
                  </span>
                  <span className="mono text-slate-900 dark:text-white">
                    {xRecords.toLocaleString()} (100%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/60">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              {/* Ingestion Info */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Last Cycle ID:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mono">{pipelineData?.last_completed_cycle || 'hist_15k_x'}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Ingestion Cadence:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">15-minute simulated</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Pipeline Health:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{pipelineData?.health_index || 100}% Optimal</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
              Total Ingested Records
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white mono">
              {totalRecords.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right: Ingestion Log */}
        <div className="lg:col-span-2 card-base rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase text-xs tracking-widest text-slate-500 dark:text-slate-400">
              Simulated Ingestion Batch Log
            </h3>
            <span className="text-[10px] uppercase font-bold text-emerald-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              All Ingestion Nodes Active
            </span>
          </div>

          <div className="space-y-3 max-h-[260px] overflow-y-auto custom-scrollbar pr-2">
            <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white mono">
                      {new Date().toISOString().replace('T', ' ').substring(0, 19)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
                      SIMULATED INGESTION SYNC
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                    Near-real-time 15-minute simulated window &bull; Fast-forward pipeline active
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mono">
                  {totalRecords.toLocaleString()}
                </span>
                <p className="text-[9px] uppercase font-bold text-emerald-500">Active</p>
              </div>
            </div>

            {initialIngestionLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between hover:border-blue-400 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white mono">
                        {log.timestamp}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                        {log.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {log.detail}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mono">
                    {log.recordCount}
                  </span>
                  <p className="text-[9px] uppercase font-bold text-slate-400">Sync OK</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 8-Stage Analysis Pipeline Orchestration Grid */}
      <div className="card-base rounded-[2.5rem] p-6 sm:p-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
          Analysis Pipeline Orchestration
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {pipelineStages.map((stage) => {
            const isProcessing = stage.status === 'processing';
            return (
              <div
                key={stage.id}
                className={`p-4 rounded-2xl flex items-center gap-3.5 transition-all ${
                  isProcessing
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : 'bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isProcessing
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                      : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {isProcessing ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    getStageIcon(stage.icon)
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {stage.name}
                  </p>
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isProcessing
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {isProcessing ? 'Recalculating...' : 'Complete'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

