import React from 'react';
import { SentimentDonut } from '../crossPlatform/SentimentDonut';
import { PlatformVarianceBar } from '../crossPlatform/PlatformVarianceBar';
import { SentimentTimeline } from '../crossPlatform/SentimentTimeline';
import { sentimentDistributionData, sentimentTimelineData } from '../../services/mockData';

interface MiniChatChartProps {
  chartType: 'sentiment-donut' | 'platform-variance' | 'sentiment-timeline' | 'topic-bars';
  isDark: boolean;
}

export const MiniChatChart: React.FC<MiniChatChartProps> = ({ chartType, isDark }) => {
  return (
    <div className="my-3 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {chartType === 'sentiment-donut' && (
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Aggregate Sentiment</span>
            <span className="text-xs font-bold text-emerald-500">72% Pos</span>
          </div>
          <SentimentDonut distribution={sentimentDistributionData.all} isDark={isDark} height="h-[180px]" hole={0.6} />
        </div>
      )}

      {chartType === 'platform-variance' && (
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Platform Positivity Variance</span>
            <span className="text-xs font-bold text-blue-500">Telegram Lead (88%)</span>
          </div>
          <PlatformVarianceBar isDark={isDark} height="h-[180px]" />
        </div>
      )}

      {chartType === 'sentiment-timeline' && (
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">24H Sentiment Flow</span>
            <span className="text-xs font-bold text-emerald-500">+12% Velocity</span>
          </div>
          <SentimentTimeline timeline={sentimentTimelineData['24H']} isDark={isDark} height="h-[180px]" />
        </div>
      )}

      {chartType === 'topic-bars' && (
        <div className="space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Trending Topic Acceleration</span>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>#AgentDev</span>
                <span className="text-emerald-500 font-bold">+124%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>#GPT5Architecture</span>
                <span className="text-emerald-500 font-bold">+82%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>#LLMOps</span>
                <span className="text-emerald-500 font-bold">+112%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '74%' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
