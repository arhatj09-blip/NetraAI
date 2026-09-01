import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Zap, Sparkles } from 'lucide-react';
import { PlatformType } from '../../types/intelligence';

export const SearchSection: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('#AI');
  const [targetPlatform, setTargetPlatform] = useState<PlatformType>('all');

  const handleSearch = (queryToSearch?: string) => {
    const q = queryToSearch || searchQuery;
    if (!q.trim()) return;
    
    // Navigate to analysis results page
    const encodedQuery = encodeURIComponent(q);
    navigate(`/dashboard/analysis/${targetPlatform}/${encodedQuery}`);
  };

  return (
    <section id="search-section" className="space-y-8">
      <div className="card-base rounded-[3rem] p-8 lg:p-12 relative overflow-hidden transition-colors">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-[35rem] h-[35rem] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-200 dark:border-blue-800 mb-3 shadow-sm">
              <Sparkles className="w-3 h-3" /> Entity Signal Detector
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
              Search &amp; Analyze Social Signals
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Identify entity patterns and sentiment propagation across decentralized communication nodes
            </p>
          </div>

          {/* Search Input Bar */}
          <div className="relative mb-6">
            <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[2rem] p-2 pl-6 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-500 transition-all">
              <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search a keyword or hashtag across all platforms..."
                className="w-full bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 text-base sm:text-lg py-2.5"
              />
              <button
                onClick={() => handleSearch()}
                className="px-6 sm:px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center gap-2 shrink-0 active:scale-[0.985]"
              >
                <span>Analyze</span>
                <Zap className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Target & Trending Pills */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Target Node:
              </span>
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
                {(['all', 'x', 'social', 'telegram'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setTargetPlatform(p)}
                    className={`px-3 py-1 rounded-lg uppercase tracking-wider transition-all ${
                      targetPlatform === p
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {p === 'social' ? 'Social' : p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Trending:
              </span>
              {['#AI', 'AI Agents', 'OpenAI', 'LLMOps', '#AgentDev'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag);
                    handleSearch(tag);
                  }}
                  className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
