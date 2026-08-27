import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface AIInsightCardProps {
  onRunReport?: () => void;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ onRunReport }) => {
  return (
    <div className="rounded-[2rem] p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl relative overflow-hidden transition-all duration-300">
      {/* Background Icon Watermark */}
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Sparkles className="w-40 h-40 text-white" />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white backdrop-blur-sm">
              Intelligence Summary
            </span>
          </div>

          <h4 className="text-2xl lg:text-3xl font-extrabold leading-tight mb-4 tracking-tight">
            #AI is experiencing rapid growth across all three primary platforms.
          </h4>

          <p className="text-blue-100 text-sm leading-relaxed mb-6 opacity-95">
            Telegram currently shows the strongest positive sentiment (+88%), primarily driven by alpha leaks in private groups. Volume on X remains 3x larger than other platforms, with Reddit hosting deeper regulatory debates.
          </p>
        </div>

        <button
          onClick={onRunReport}
          className="w-full py-3.5 px-6 bg-white text-blue-700 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
          Run Comparative Report <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
