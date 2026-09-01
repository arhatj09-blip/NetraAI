import React from 'react';
import { MessageSquare, MessageCircle } from 'lucide-react';
import { Social3DMap } from '../crossPlatform/Social3DMap';
import { SentimentTimeline } from '../crossPlatform/SentimentTimeline';
import { sentimentTimelineData } from '../../services/mockData';

interface RedditAnalysisSectionProps {
  isDark: boolean;
  activeDateRange?: {
    startDate: string;
    endDate: string;
  };
}

export const RedditAnalysisSection: React.FC<RedditAnalysisSectionProps> = ({
  isDark,
  activeDateRange,
}) => {
  const dateRangeDisplay = activeDateRange
    ? `${activeDateRange.startDate} to ${activeDateRange.endDate}`
    : 'All Time';
  return (
    <section id="reddit-analysis" className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-sm">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Reddit Discussion Vectors
          </h2>
          <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
            Thread Hierarchy &amp; Sentiment Depth Mining — {dateRangeDisplay}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reddit 3D Map */}
        <div className="card-base rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-orange-500" />
              Community Discussion Map (3D)
            </h3>
            <span className="text-[10px] uppercase font-bold text-orange-500">
              87.2K Records
            </span>
          </div>

          <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 overflow-hidden shadow-inner">
            <Social3DMap platform="social" isDark={isDark} height="h-[380px]" />
          </div>
        </div>

        {/* Reddit Sentiment Timeline */}
        <div className="card-base rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Subreddit Sentiment Timeline (24H)
            </h3>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
              Avg Positivity: 42%
            </span>
          </div>

          <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 overflow-hidden shadow-inner">
            <SentimentTimeline
              timeline={sentimentTimelineData['24H']}
              isDark={isDark}
              height="h-[380px]"
              lineColor="#f97316"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
