import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, AlertTriangle, Target, Flame, MessageCircle, ShieldCheck, Lock, Twitter, Calendar, RefreshCw } from 'lucide-react';
import { Social3DMap } from '../components/crossPlatform/Social3DMap';
import { SentimentTimeline } from '../components/crossPlatform/SentimentTimeline';
import { EmotionalPulseBar } from '../components/platforms/EmotionalPulseBar';
import { sentimentTimelineData } from '../services/mockData';

export const AnalysisResults: React.FC = () => {
  const { platform, query } = useParams<{ platform?: string; query?: string }>();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-27');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateRange = () => {
    setIsUpdating(true);
    setTimeout(() => setIsUpdating(false), 800);
  };

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

  // Render platform-specific main analysis section
  const renderMainAnalysisSection = () => {
    const normalizedPlatform = platform?.toLowerCase();

    // X (Twitter) Platform Analysis
    if (normalizedPlatform === 'x') {
      return (
        <div className="space-y-6">
          {/* Date Range Picker for X */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                  <Twitter className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    X Signal Clustering Analysis
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    High-velocity public node infiltration and repost dynamics
                  </p>
                </div>
              </div>

              {/* Date Range Picker */}
              <div className="flex items-center gap-3 p-2 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div className="flex flex-col">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">From</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-transparent text-xs text-slate-900 dark:text-white mono outline-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent text-xs text-slate-900 dark:text-white mono outline-none cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleUpdateRange}
                  disabled={isUpdating}
                  className="ml-2 p-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Apply</span>
                </button>
              </div>
            </div>
          </div>

          {/* X-Specific Stats and Hashtags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Metrics */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Key X Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Total Posts Analyzed</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">124.4K</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Avg Engagement Rate</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">5.8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Retweet Velocity</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">+242/hr</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Active Communities</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">184</span>
                </div>
              </div>
            </div>

            {/* Trending Hashtags */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Rising Hashtags
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">#AgentDev</span>
                  <span className="text-sm font-bold text-emerald-500 mono">+242%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">#AI_Safety</span>
                  <span className="text-sm font-bold text-emerald-500 mono">+184%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">#GPTNext</span>
                  <span className="text-sm font-bold text-emerald-500 mono">+112%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">#LLMOps</span>
                  <span className="text-sm font-bold text-emerald-500 mono">+98%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Reddit Platform Analysis
    if (normalizedPlatform === 'reddit') {
      return (
        <div className="space-y-6">
          {/* Reddit Header */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-sm">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Reddit Discussion Vectors
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Thread hierarchy and sentiment depth mining across subreddits
                </p>
              </div>
            </div>

            {/* Reddit Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Threads Analyzed</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">87.2K</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Avg Upvote Rate</div>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">84.2%</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Active Subreddits</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">78</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Avg Sentiment</div>
                <div className="text-xl font-bold text-orange-600 dark:text-orange-400">42.0%</div>
              </div>
            </div>
          </div>

          {/* Top Subreddits */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Most Active Subreddits
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">r/MachineLearning</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">High debate activity</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">24.8K posts</div>
                  <div className="text-xs text-orange-600 dark:text-orange-400">58% positive</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">r/artificial</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Technical discussions</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">18.2K posts</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400">72% positive</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">r/LocalLLaMA</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Community support</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">15.4K posts</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400">81% positive</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Telegram Platform Analysis
    if (normalizedPlatform === 'telegram') {
      return (
        <div className="space-y-6">
          {/* Telegram Header */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Telegram Alpha Ingestion
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Encrypted node intelligence and early alpha signal detection
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 text-xs font-bold text-sky-600 dark:text-sky-400">
                <Lock className="w-3.5 h-3.5" />
                50 Alpha Channels
              </div>
            </div>

            {/* Telegram Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Alpha Messages</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">62.8K</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Confidence Score</div>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">88.0%</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Private Channels</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">50</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Signal Velocity</div>
                <div className="text-xl font-bold text-sky-600 dark:text-sky-400">+42%</div>
              </div>
            </div>
          </div>

          {/* Top Alpha Channels */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-sky-500" />
              High-Confidence Alpha Channels
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-xl border border-sky-200 dark:border-sky-800/60">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Alpha Leaks Group</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Early project announcements</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">94.2% positive</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">12.4K members</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Dev Insider Network</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Technical alpha signals</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">86.7% positive</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">8.2K members</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">AI Research Hub</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Research breakthroughs</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">91.5% positive</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">15.8K members</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

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

        {/* 1. Main Analysis Section - Platform Specific */}
        {renderMainAnalysisSection()}

        {/* 2. Sentiment Dynamics Timeline */}
        <div className="mt-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Sentiment Dynamics Timeline
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Historical sentiment flow across the selected platform
            </p>
          </div>
          <SentimentTimeline 
            isDark={isDark} 
            timeline={sentimentTimelineData['24H']}
            lineColor={platform === 'reddit' ? '#f97316' : platform === 'telegram' ? '#0ea5e9' : '#3b82f6'}
          />
        </div>

        {/* 3. Emotional Pulse Distribution */}
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

        {/* 4. 3D Intelligence Vector Space Map */}
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
    </div>
  );
};
