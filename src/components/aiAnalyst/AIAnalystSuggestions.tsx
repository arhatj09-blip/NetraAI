import React from 'react';
import { Sparkles, ArrowRight, TrendingUp, Heart, Smile, Users, FileText } from 'lucide-react';

interface AIAnalystSuggestionsProps {
  onSelectSuggestion: (question: string) => void;
  platform?: string;
  hashtag?: string;
}

export const AIAnalystSuggestions: React.FC<AIAnalystSuggestionsProps> = ({
  onSelectSuggestion,
  platform = 'X',
  hashtag,
}) => {
  const targetTag = hashtag || '#AI';
  const platformUpper = platform.toUpperCase();

  const suggestionCards = [
    {
      title: 'Trend Velocity',
      question: `Why is ${targetTag} rising?`,
      icon: TrendingUp,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 border-blue-200/80 dark:bg-blue-500/10 dark:border-blue-500/20',
    },
    {
      title: 'Sentiment Drivers',
      question: 'What is driving the sentiment?',
      icon: Heart,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 border-emerald-200/80 dark:bg-emerald-500/10 dark:border-emerald-500/20',
    },
    {
      title: 'Emotional Pulse',
      question: 'What emotion dominates?',
      icon: Smile,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 border-amber-200/80 dark:bg-amber-500/10 dark:border-amber-500/20',
    },
    {
      title: 'Audience Cohorts',
      question: 'Which audience segment is most active?',
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 border-purple-200/80 dark:bg-purple-500/10 dark:border-purple-500/20',
    },
    {
      title: 'Executive Brief',
      question: 'Summarize this analysis.',
      icon: FileText,
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-50 border-cyan-200/80 dark:bg-cyan-500/10 dark:border-cyan-500/20',
    },
  ];

  return (
    <div className="space-y-4 py-2">
      {/* Empty State Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-b from-blue-50/80 to-indigo-50/40 dark:from-slate-800/60 dark:to-slate-900/60 border border-blue-100/90 dark:border-slate-700/60 shadow-2xs dark:shadow-inner space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Contextual Intelligence
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Ask questions about the current <span className="font-semibold text-blue-600 dark:text-blue-400">{platformUpper}</span> signal analysis, hashtag trends, or sentiment shifts.
        </p>
      </div>

      {/* Suggested Questions Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Suggested Inquiries
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-400">Click to run</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {suggestionCards.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectSuggestion(item.question)}
                className="w-full flex items-center justify-between p-3 rounded-xl
                           bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-blue-300 shadow-2xs
                           dark:bg-slate-800/40 dark:hover:bg-slate-800/80 dark:border-slate-700/50 dark:hover:border-blue-500/40
                           text-left transition-all duration-200 group focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className={`w-7 h-7 rounded-lg ${item.bg} border flex items-center justify-center ${item.color} shrink-0`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 dark:text-slate-200 dark:group-hover:text-white transition-colors truncate">
                      {item.question}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {item.title}
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
