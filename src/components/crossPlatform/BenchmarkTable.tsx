import React from 'react';
import { TableProperties, Twitter, MessageSquare, Send } from 'lucide-react';
import { benchmarkComparisonData } from '../../services/mockData';

export const BenchmarkTable: React.FC = () => {
  return (
    <div className="card-base rounded-[2rem] p-6 sm:p-8 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TableProperties className="w-5 h-5 text-blue-500" />
          Cross-Platform Intelligence Benchmark
        </h3>
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">
          Aggregate Real-Time Feed
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-widest">
              <th className="pb-4 pl-3">Metric / Vector</th>
              <th className="pb-4">
                <span className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                  <Twitter className="w-4 h-4 text-blue-500" /> X (Twitter)
                </span>
              </th>
              <th className="pb-4">
                <span className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                  <MessageSquare className="w-4 h-4 text-orange-500" /> Reddit
                </span>
              </th>
              <th className="pb-4">
                <span className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                  <Send className="w-4 h-4 text-sky-500" /> Telegram
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {benchmarkComparisonData.map((row, index) => (
              <tr
                key={index}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <td className="py-4 pl-3 font-semibold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                  {row.metric}
                </td>
                <td className="py-4 font-bold text-slate-900 dark:text-white mono text-xs sm:text-sm">
                  {row.xValue}
                </td>
                <td className="py-4 font-bold text-slate-900 dark:text-white mono text-xs sm:text-sm">
                  {row.redditValue}
                </td>
                <td className="py-4 font-bold text-slate-900 dark:text-white mono text-xs sm:text-sm">
                  {row.telegramValue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
