import React from 'react';
import { ArrowRight } from 'lucide-react';

interface PlatformCardProps {
  platform: 'X' | 'Reddit' | 'Telegram';
  icon: React.ReactNode;
  title: string;
  description: string;
  stats: {
    label: string;
    value: string;
  }[];
  accentColor: string;
  onClick: () => void;
}

export const PlatformCard: React.FC<PlatformCardProps> = ({
  icon,
  title,
  description,
  stats,
  accentColor,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
    >
      {/* Platform Icon */}
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${accentColor}`}
      >
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        {description}
      </p>

      {/* Stats Grid */}
      <div className="space-y-3 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {stat.label}
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* View Analysis Button */}
      <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-semibold text-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
        <span>View Analysis</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};
