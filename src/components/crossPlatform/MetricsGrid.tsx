import React from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, Users, Zap, Smile } from 'lucide-react';
import { KPIMetric } from '../../types/intelligence';

interface MetricsGridProps {
  metrics: KPIMetric[];
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  const getIcon = (id: string, trendPositive?: boolean) => {
    if (id === '1') return <Activity className="w-3.5 h-3.5" />;
    if (id === '2') return <Smile className="w-3.5 h-3.5 text-emerald-500" />;
    if (id === '3') return <TrendingDown className="w-3.5 h-3.5 text-rose-500" />;
    if (id === '4') return <Zap className="w-3.5 h-3.5 text-amber-500" />;
    if (id === '5') return <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />;
    if (id === '6') return <Users className="w-3.5 h-3.5 text-purple-500" />;
    if (trendPositive !== undefined) {
      return trendPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />;
    }
    return <Minus className="w-3.5 h-3.5" />;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="card-base p-5 rounded-2xl transition-all hover:scale-[1.02] duration-200"
          style={{ borderLeftWidth: '4px', borderLeftColor: metric.accentColor }}
        >
          <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-1">
            {metric.label}
          </p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mono tracking-tight">
            {metric.value}
          </p>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-bold">
            {metric.trend && (
              <span
                className={`flex items-center gap-1 ${
                  metric.trendPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {getIcon(metric.id, metric.trendPositive)}
                {metric.trend}
              </span>
            )}
            {metric.statusText && !metric.trend && (
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                {getIcon(metric.id)}
                {metric.statusText}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
