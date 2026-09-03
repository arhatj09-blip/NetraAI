import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, AlertTriangle, Target, Flame, MessageCircle, ShieldCheck, Lock, Twitter, BarChart3, Heart, Users, Shield } from 'lucide-react';
import { DateRangeFilter } from '../components/analysis/DateRangeFilter';
import { DynamicSocialNetwork } from '../components/network/DynamicSocialNetwork';
import { AnalyticsTriPanel } from '../components/platforms/AnalyticsTriPanel';
import { HashtagTrendModal } from '../components/platforms/HashtagTrendModal';
import { AIAnalyst } from '../components/aiAnalyst';
import { AIAnalystContext } from '../types/aiAnalyst';
import { xRisingHashtags, hashtagTrendIntelligence, XRisingHashtag } from '../services/mockData';

export const AnalysisResults: React.FC = () => {
  const { platform, query } = useParams<{ platform?: string; query?: string }>();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  
  // Hashtag Trend Intelligence modal state (X platform only)
  const [selectedHashtag, setSelectedHashtag] = useState<XRisingHashtag | null>(null);

  const openHashtagModal = (hashtag: XRisingHashtag) => setSelectedHashtag(hashtag);
  const closeHashtagModal = () => setSelectedHashtag(null);
  
  // Universal date range state for entire analysis page
  const [activeDateRange, setActiveDateRange] = useState({
    startDate: '2026-08-01',
    endDate: '2026-08-27',
  });

  const handleApplyDateRange = (startDate: string, endDate: string) => {
    setActiveDateRange({ startDate, endDate });
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
  
  // Context object for the embedded AI Analyst assistant
  const aiContext: AIAnalystContext = {
    platform: platform || 'x',
    hashtag: selectedHashtag ? selectedHashtag.tag : (displayQuery ? (displayQuery.startsWith('#') ? displayQuery : `#${displayQuery}`) : undefined),
    startDate: activeDateRange.startDate,
    endDate: activeDateRange.endDate,
    section: 'platform-analysis',
  };

  // Render platform-specific main analysis section
  const renderMainAnalysisSection = () => {
    const normalizedPlatform = platform?.toLowerCase();

    // X (Twitter) Platform Analysis
    if (normalizedPlatform === 'x') {
      return (
        <div className="space-y-6">
          <div id="network-canvas" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm scroll-mt-24">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Dynamic 3D Social Interaction Network
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Interactive visualization of user interactions and relationship propagation across the selected period.
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-blue-200 dark:border-blue-800">
                X Network
              </span>
            </div>
            <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 overflow-hidden shadow-inner">
              <DynamicSocialNetwork isDark={isDark} startDate={activeDateRange.startDate} endDate={activeDateRange.endDate} />
            </div>
          </div>

          {/* X Platform Header */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
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
            <div id="rising-hashtags" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm scroll-mt-24">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Rising Hashtags
              </h3>
              <div className="space-y-3">
                {xRisingHashtags.map((ht) => (
                  <button
                    key={ht.tag}
                    onClick={() => openHashtagModal(ht)}
                    className="w-full flex justify-between items-center p-3
                               bg-slate-50 dark:bg-slate-800/40 rounded-xl
                               border border-slate-200 dark:border-slate-700/60
                               hover:border-blue-400 dark:hover:border-blue-500
                               hover:bg-blue-50/50 dark:hover:bg-blue-500/10
                               hover:shadow-sm
                               transition-all duration-200 group text-left"
                    title={`View trend intelligence for ${ht.tag}`}
                  >
                    <span className="text-sm font-bold text-slate-900 dark:text-white
                                     group-hover:text-blue-600 dark:group-hover:text-blue-400
                                     transition-colors">
                      {ht.tag}
                    </span>
                    <span className="text-sm font-bold text-emerald-500 mono shrink-0">
                      {ht.growth}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                Click any hashtag to view detailed trend intelligence
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Social Media Platform Analysis
    if (normalizedPlatform === 'social' || normalizedPlatform === 'reddit') {
      return (
        <div className="space-y-6">
          {/* Social Feeds Header */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Social Media Discussion Vectors
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Channel hierarchy and sentiment depth mining across social media platforms
                </p>
              </div>
            </div>

            {/* Social Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Signals Analyzed</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">90.0K</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Avg Engagement</div>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">76.4%</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Active Channels</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">112</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Avg Sentiment</div>
                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">58.0%</div>
              </div>
            </div>
          </div>

          {/* Top Channels */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Most Active Discussion Nodes
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Machine Learning &amp; AI Ethics</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">High debate activity</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">24.8K posts</div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400">58% positive</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Autonomous Agent Architecture</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Technical discussions</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">18.2K posts</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400">72% positive</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Local LLM &amp; Open Models</div>
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
    <>
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pt-8 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
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
              <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
                    {getPlatformDisplay(platform)} Analysis
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    Comprehensive intelligence insights and signal analysis
                  </p>
                </div>
                
                {/* Global Date Range Filter */}
                <div className="w-full lg:w-auto">
                  <DateRangeFilter
                    startDate={activeDateRange.startDate}
                    endDate={activeDateRange.endDate}
                    onApply={handleApplyDateRange}
                  />
                </div>
              </div>
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
                    Social Feeds: AI Ethics Vector
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

        {/* Shared vector-space overview remains available to non-X platform views. */}
        {platform?.toLowerCase() !== 'x' && <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] gap-6 mb-12">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Dynamic 3D Social Interaction Network
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Interactive visualization of user relationships and interaction propagation across processed signals
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> X (Twitter)
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div> Social Media
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-500"></div> Telegram
                </div>
              </div>
            </div>
            <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 overflow-hidden shadow-inner">
              <DynamicSocialNetwork isDark={isDark} />
            </div>
          </div>

          <div id="key-platform-metrics" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm scroll-mt-24">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 dark:bg-blue-500/25 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Key Platform Metrics
              </h2>
            </div>

            {/* Metrics Grid - 2x2 Layout */}
            <div className="grid grid-cols-2 gap-6">
              {/* Influence Index */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-50/50 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-200 dark:border-slate-700/60 hover:border-blue-400 dark:hover:border-blue-500 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 dark:bg-blue-500/25 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
                  Influence Index
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                  92.4
                </div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>+6.2%</span>
                </div>
              </div>

              {/* Net Sentiment */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-50/50 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-200 dark:border-slate-700/60 hover:border-red-400 dark:hover:border-red-500 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 dark:bg-red-500/25 flex items-center justify-center text-red-600 dark:text-red-400">
                    <Heart className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
                  Net Sentiment
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                  +8.4%
                </div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12.1%</span>
                </div>
              </div>

              {/* Activity Volume */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-50/50 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-200 dark:border-slate-700/60 hover:border-purple-400 dark:hover:border-purple-500 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 dark:bg-purple-500/25 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
                  Activity Volume
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                  48.3K
                </div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>+24.7%</span>
                </div>
              </div>

              {/* Signal Confidence */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-50/50 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 dark:bg-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Shield className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
                  Signal Confidence
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                  89%
                </div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>+3.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>}

        {/* 2. Main Analysis Section - Platform Specific */}
        {renderMainAnalysisSection()}

        {/* 3 & 4 & Demographics ─ two-column analytics panel */}
        <div id="sentiment-analytics" className="scroll-mt-24">
          <AnalyticsTriPanel isDark={isDark} platform={platform} />
        </div>
      </div>
    </div>

    {/* ── Hashtag Trend Intelligence Modal (X platform only) ────────────────── */}
    {selectedHashtag && hashtagTrendIntelligence[selectedHashtag.tag] && (
      <HashtagTrendModal
        hashtag={selectedHashtag}
        data={hashtagTrendIntelligence[selectedHashtag.tag]}
        dateRange={activeDateRange}
        isDark={isDark}
        onClose={closeHashtagModal}
      />
    )}

    {/* ── Contextual Embedded AI Analyst Assistant ───────────────────────────── */}
    <AIAnalyst
      platform={platform || 'x'}
      context={aiContext}
    />
    </>
  );
};
