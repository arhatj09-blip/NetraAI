import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { Social3DMap } from '../components/crossPlatform/Social3DMap';
import { SentimentTimeline } from '../components/crossPlatform/SentimentTimeline';
import { EmotionalPulseBar } from '../components/platforms/EmotionalPulseBar';
import { sentimentTimelineData } from '../services/mockData';

export const AnalysisResults: React.FC = () => {
  const { platform, query } = useParams<{ platform?: string; query?: string }>();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Detect theme from document
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const getPlatformDisplay = (platform?: string) => {
    if (!platform) return 'All Platforms';
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  const displayQuery = query ? decodeURIComponent(query) : '';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pt-8 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back to Dashboard</span>
        </button>

        {/* Header Section */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-4">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Entity Signal Diagnostics
            </span>
          </div>

          {displayQuery ? (
            <>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
                Query Results: <span className="text-blue-600 dark:text-blue-400">{displayQuery}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Platform: <strong className="text-slate-900 dark:text-white">{getPlatformDisplay(platform)}</strong>
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 dark:text-slate-400">
                  Matched: <strong className="text-emerald-600 dark:text-emerald-400">48,392</strong> signals
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 dark:text-slate-400">
                  Active Signals: <strong className="text-blue-600 dark:text-blue-400">1,284</strong>
                </span>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
                {getPlatformDisplay(platform)} Analysis
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Comprehensive intelligence insights and signal analysis
              </p>
            </>
          )}
        </div>

        {/* Key Insights Cards */}
        {displayQuery && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Most Positive Node */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                    Most Positive Node
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Telegram: Alpha Leaks Group
                  </h3>
                </div>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                94.2% Sentiment Rating with strong buy/build consensus.
              </p>
            </div>

            {/* Risk Vector Detected */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center text-white">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
                    Risk Vector Detected
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Reddit: r/MachineLearning Ethics
                  </h3>
                </div>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Elevated FUD Score: 78.1 regarding regulatory scrutiny.
              </p>
            </div>

            {/* Trend Pivot Point */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-white">
                  <Target className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                    Trend Pivot Point
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    X: @TechCrunch Feature
                  </h3>
                </div>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Propagation Velocity: 1,200 mentions/hr viral surge.
              </p>
            </div>
          </div>
        )}

        {/* 3D Vector Space Visualization */}
        <div className="mb-12">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Intelligence Vector Space Map
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  3D spatial clustering: Trend Velocity × Sentiment Score × Influence Index
                </p>
              </div>
            </div>
            <Social3DMap isDark={isDark} platform={platform as any || 'all'} />
          </div>
        </div>

        {/* Sentiment Timeline */}
        <div className="mb-12">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Sentiment Dynamics Timeline
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Historical sentiment flow across the selected platform
              </p>
            </div>
            <SentimentTimeline isDark={isDark} timeline={sentimentTimelineData['24H']} />
          </div>
        </div>

        {/* Emotional Pulse */}
        <div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Emotional Pulse Distribution
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Emotional sentiment breakdown across detected signals
              </p>
            </div>
            <EmotionalPulseBar isDark={isDark} />
          </div>
        </div>
      </div>
    </div>
  );
};
