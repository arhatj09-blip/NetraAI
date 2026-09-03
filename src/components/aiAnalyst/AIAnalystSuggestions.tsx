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
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Sentiment Drivers',
      question: 'What is driving the sentiment?',
      icon: Heart,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Emotional Pulse',
      question: 'What emotion dominates?',
      icon: Smile,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Audience Cohorts',
      question: 'Which audience segment is most active?',
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Executive Brief',
      question: 'Summarize this analysis.',
      icon: FileText,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
  ];

  return (
    <div className="space-y-6 py-4">
      {/* Empty State Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900/60 border border-slate-700/60 shadow-inner space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Contextual Intelligence
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Ask questions about the current <span className="font-semibold text-blue-400">{platformUpper}</span> signal analysis, hashtag trends, or sentiment shifts.
        </p>
      </div>

      {/* Suggested Questions Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Suggested Inquiries
          </span>
          <span className="text-[10px] text-slate-400">Click to run</span>
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
                           bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-blue-500/40
                           text-left transition-all duration-200 group focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center ${item.color} shrink-0`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                      {item.question}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {item.title}
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
