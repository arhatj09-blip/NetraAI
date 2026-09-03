/**
 * HashtagTrendModal
 *
 * Opens as a centered modal overlay when the user clicks a rising hashtag
 * on the X Analysis page. Displays pre-computed trend intelligence for the
 * selected hashtag — no fresh NLP inference is triggered.
 *
 * Sections (in order):
 *   1. Trend Information     — header stats row
 *   2. Trend Growth Timeline — Plotly line chart, respects active date range
 *   3. Sentiment Analysis    — positive / neutral / negative with bar visuals
 *   4. Emotional Analysis    — emotion distribution (vertical bars via Plotly)
 *   5. Demographic Analysis  — gender / age / region tabs with donut charts
 *                              (all demographic values are clearly marked synthetic)
 *
 * Design: mirrors the existing X Analysis page card styling — card-base,
 * CSS variables, slate/blue palette, glassmorphism backdrop, rounded corners.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Heart,
  Users,
  AlertTriangle,
  BarChart2,
  Info,
} from 'lucide-react';
import { PlotlyChart } from '../charts/PlotlyChart';
import {
  XRisingHashtag,
  HashtagTrendData,
} from '../../services/mockData';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HashtagTrendModalProps {
  hashtag: XRisingHashtag;
  data: HashtagTrendData;
  dateRange: { startDate: string; endDate: string };
  isDark: boolean;
  onClose: () => void;
}

type DemoTab = 'gender' | 'age' | 'region';

const LazyPlotlyChart: React.FC<{
  data: Plotly.Data[];
  layout: Partial<Plotly.Layout>;
  className?: string;
  style?: React.CSSProperties;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}> = ({ data, layout, className, style, scrollContainerRef }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    const chart = chartRef.current;
    const scrollContainer = scrollContainerRef.current;
    if (!chart || !scrollContainer) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsNearViewport(true);
        observer.disconnect();
      }
    }, { root: scrollContainer, rootMargin: '160px 0px' });
    observer.observe(chart);
    return () => observer.disconnect();
  }, [scrollContainerRef]);

  return (
    <div ref={chartRef} className={className} style={style}>
      {isNearViewport ? (
        <PlotlyChart data={data} layout={layout} className="w-full h-full" />
      ) : (
        <div className="w-full h-full min-h-[210px] rounded-xl bg-slate-100/40 dark:bg-slate-800/30" aria-hidden="true" />
      )}
    </div>
  );
};

// ─── Shared helpers ───────────────────────────────────────────────────────────

const EMOTION_COLORS = [
  '#3b82f6', // Excitement
  '#8b5cf6', // Curiosity
  '#10b981', // Support
  '#f59e0b', // Anxiety
  '#ef4444', // Fear
  '#6366f1', // Sadness
  '#f97316', // Anger
];

const STATUS_META: Record<
  XRisingHashtag['status'],
  { label: string; color: string; bg: string; Icon: typeof TrendingUp }
> = {
  Spiking:   { label: 'Spiking',   color: 'text-rose-500',   bg: 'bg-rose-500/10 border-rose-500/20',    Icon: TrendingUp   },
  Rising:    { label: 'Rising',    color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', Icon: TrendingUp },
  Stable:    { label: 'Stable',    color: 'text-amber-500',   bg: 'bg-amber-500/10 border-amber-500/20',  Icon: Minus        },
  Declining: { label: 'Declining', color: 'text-slate-400',   bg: 'bg-slate-200/50 border-slate-300/40',  Icon: TrendingDown },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

// Section card shell matching existing card-base style
const SectionCard: React.FC<{
  title: string;
  subtitle?: string;
  Icon: React.FC<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, Icon, iconColor, iconBg, children, className = '' }) => (
  <div
    className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
                rounded-2xl p-5 sm:p-6 shadow-sm ${className}`}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{title}</h3>
        {subtitle && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</p>
        )}
      </div>
    </div>
    {children}
  </div>
);

// Donut chart (replicated from DemographicsPanelV2 pattern)
const DonutChart: React.FC<{
  data: { label: string; value: number; color: string }[];
  isDark: boolean;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}> = ({ data, isDark, scrollContainerRef }) => {
  const plotlyData = useMemo(
    () => [
      {
        type: 'pie' as const,
        hole: 0.62,
        values: data.map((d) => d.value),
        labels: data.map((d) => d.label),
        marker: {
          colors: data.map((d) => d.color),
          line: { color: isDark ? '#0f172a' : '#ffffff', width: 3 },
        },
        textinfo: 'none' as const,
        hovertemplate: '<b>%{label}</b><br>%{value}%<extra></extra>',
        rotation: -90,
      },
    ],
    [data, isDark]
  );

  const layout = useMemo(
    () => ({
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: { l: 0, r: 0, t: 0, b: 0 },
      showlegend: false,
    }),
    []
  );

  const dominant = data.reduce((a, b) => (a.value > b.value ? a : b));

  return (
    <div className="relative flex items-center justify-center">
      <div className="w-full" style={{ maxWidth: 200, height: 190, margin: '0 auto' }}>
        <LazyPlotlyChart
          data={plotlyData}
          layout={layout}
          className="w-full h-full"
          scrollContainerRef={scrollContainerRef}
        />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-extrabold" style={{ color: dominant.color }}>
          {dominant.value}%
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-0.5">
          {dominant.label}
        </span>
      </div>
    </div>
  );
};

// Legend rows (same as DemographicsPanelV2)
const Legend: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({
  data,
}) => (
  <div className="space-y-2 mt-3">
    {data.map((item) => (
      <div key={item.label} className="flex items-center gap-3">
        <span
          className="shrink-0 w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
            {item.label}
          </span>
          <span className="text-xs font-bold mono shrink-0" style={{ color: item.color }}>
            {item.value}%
          </span>
        </div>
        <div className="shrink-0 w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${item.value}%`, backgroundColor: item.color }}
          />
        </div>
      </div>
    ))}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const HashtagTrendModal: React.FC<HashtagTrendModalProps> = ({
  hashtag,
  data,
  dateRange,
  isDark,
  onClose,
}) => {
  const [demoTab, setDemoTab] = useState<DemoTab>('age');
  const [isClosing, setIsClosing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const requestClose = () => setIsClosing(true);

  const handleModalAnimationEnd = (event: React.AnimationEvent<HTMLDivElement>) => {
    if (isClosing && event.animationName === 'hashtagModalOut') onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock the document without losing the user's underlying scroll position.
  useEffect(() => {
    const scrollY = window.scrollY;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.scrollTo(0, scrollY);
    };
  }, []);

  useEffect(() => {
    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !scrollRef.current) return;
      const focusable = scrollRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, []);

  const statusMeta = STATUS_META[hashtag.status];
  const StatusIcon = statusMeta.Icon;

  // ── 1. Trend Growth Timeline chart data ──────────────────────────────────
  const timelineChartData = useMemo(() => {
    const timeline = data.timeline;
    return [
      {
        x: timeline.map((p) => p.time),
        y: timeline.map((p) => p.value),
        type: 'scatter' as const,
        mode: 'lines+markers' as const,
        line: { color: '#3b82f6', width: 3, shape: 'spline' as const },
        marker: { size: 6, color: '#3b82f6' },
        fill: 'tozeroy' as const,
        fillcolor: isDark
          ? 'rgba(59,130,246,0.10)'
          : 'rgba(59,130,246,0.08)',
        hovertemplate: '<b>%{x}</b><br>%{y} mentions<extra></extra>',
      },
    ];
  }, [data.timeline, isDark]);

  const timelineLayout = useMemo(() => {
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    return {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: textColor, family: 'Plus Jakarta Sans, sans-serif', size: 10 },
      margin: { l: 38, r: 12, t: 16, b: 36 },
      showlegend: false,
      xaxis: {
        gridcolor: gridColor,
        zeroline: false,
        tickfont: { color: textColor, size: 9 },
        tickangle: -20,
      },
      yaxis: {
        gridcolor: gridColor,
        zeroline: false,
        tickfont: { color: textColor },
        ticksuffix: '',
        title: { text: 'Mentions (K)', font: { color: textColor, size: 9 } },
      },
    };
  }, [isDark]);

  // Peak value for stat display
  const peakMentions = Math.max(...data.timeline.map((p) => p.value));
  const firstVal = data.timeline[0]?.value ?? 0;
  const lastVal  = data.timeline[data.timeline.length - 1]?.value ?? 0;
  const netGrowth = lastVal - firstVal;
  const netGrowthPct = firstVal > 0
    ? Math.round((netGrowth / firstVal) * 100)
    : 0;

  // ── 2. Emotion chart data ─────────────────────────────────────────────────
  const emotionChartData = useMemo(() => {
    const emotions = data.emotions;
    return [
      {
        x: emotions.map((e) => e.emotion),
        y: emotions.map((e) => e.value),
        type: 'bar' as const,
        orientation: 'v' as const,
        marker: {
          color: emotions.map((_, i) => EMOTION_COLORS[i % EMOTION_COLORS.length]),
          opacity: 0.9,
          line: { color: 'rgba(255,255,255,0.12)', width: 1 },
        },
        text: emotions.map((e) => `${e.value}%`),
        textposition: 'outside' as const,
        textfont: {
          family: 'JetBrains Mono, monospace',
          size: 9,
          color: isDark ? '#f1f5f9' : '#1e293b',
        },
        hovertemplate: '<b>%{x}</b><br>%{y}%<extra></extra>',
      },
    ];
  }, [data.emotions, isDark]);

  const emotionLayout = useMemo(() => {
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    return {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: textColor, family: 'Plus Jakarta Sans, sans-serif', size: 10 },
      margin: { l: 28, r: 12, t: 22, b: 58 },
      showlegend: false,
      xaxis: {
        gridcolor: 'transparent',
        zeroline: false,
        tickfont: { color: isDark ? '#cbd5e1' : '#334155', size: 9 },
        tickangle: -22,
      },
      yaxis: {
        gridcolor: gridColor,
        zeroline: false,
        tickfont: { color: textColor },
        range: [0, 110],
        ticksuffix: '%',
      },
      bargap: 0.28,
    };
  }, [isDark]);

  // ── 3. Demographics data for current tab ─────────────────────────────────
  const demoData = useMemo(() => {
    const demo = data.syntheticDemographics;
    if (demoTab === 'gender')
      return demo.gender.map((g) => ({
        label: g.label,
        value: g.value,
        color: g.color,
      }));
    if (demoTab === 'region')
      return demo.regions.map((r) => ({
        label: r.region,
        value: r.percentage,
        color: r.color,
      }));
    // age (default)
    const AGE_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'];
    return demo.ageGroups.map((a, i) => ({
      label: a.range,
      value: a.percentage,
      color: AGE_COLORS[i % AGE_COLORS.length],
    }));
  }, [data.syntheticDemographics, demoTab]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return createPortal((
    // Backdrop — click outside to close
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center
             bg-slate-900/50 dark:bg-black/60
             px-3 py-4 sm:px-4 sm:py-6 overflow-hidden hashtag-modal-backdrop
             ${isClosing ? 'hashtag-modal-backdrop--closing' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) requestClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Trend Intelligence: ${hashtag.tag}`}
    >
      {/* Modal panel */}
      <div
        ref={scrollRef}
        className={`relative w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden
                   bg-[var(--bg-primary)] text-[var(--text-primary)]
                   border border-slate-200 dark:border-slate-700
                   rounded-3xl shadow-2xl
             hashtag-modal-panel ${isClosing ? 'hashtag-modal-panel--closing' : ''}`}
        onAnimationEnd={handleModalAnimationEnd}
        style={{ '--tw-shadow': '0 24px 64px rgba(0,0,0,0.22)' } as React.CSSProperties}
      >

        {/* ── Modal Header ─────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10
                        bg-white/95 dark:bg-slate-900/95 backdrop-blur-md
                        border-b border-slate-200 dark:border-slate-800
                        rounded-t-3xl px-5 sm:px-7 py-4
                        flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Blue X brand dot */}
            <div className="shrink-0 w-9 h-9 rounded-xl
                            bg-blue-500/10 dark:bg-blue-500/20
                            border border-blue-500/25
                            flex items-center justify-center">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-widest
                                 text-blue-600 dark:text-blue-400">
                  Trend Intelligence
                </span>
                <span className="text-[10px] text-slate-400">·</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mono truncate">
                  {dateRange.startDate} → {dateRange.endDate}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white
                             tracking-tight leading-tight truncate">
                {hashtag.tag}
              </h2>
            </div>
          </div>

          {/* Close button */}
          <button
            ref={closeButtonRef}
            onClick={requestClose}
            aria-label="Close"
            className="shrink-0 w-9 h-9 rounded-xl
                       flex items-center justify-center
                       bg-slate-100 dark:bg-slate-800
                       border border-slate-200 dark:border-slate-700
                       text-slate-500 dark:text-slate-400
                       hover:bg-slate-200 dark:hover:bg-slate-700
                       hover:text-slate-900 dark:hover:text-white
                       transition-all"
          >
            <X className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* ── Scrollable body ──────────────────────────────────────────── */}
        <div ref={contentRef} className="min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-7 py-5 sm:py-6 space-y-5">

          {/* ━━━ SECTION 1: Trend Information ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="bg-white dark:bg-slate-900
                          border border-slate-200 dark:border-slate-800
                          rounded-2xl p-5 shadow-sm">
            {/* Hashtag name + status badge row */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {hashtag.tag}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                                text-xs font-bold uppercase tracking-wider border
                                ${statusMeta.bg} ${statusMeta.color}`}>
                <StatusIcon className="w-3 h-3" />
                {statusMeta.label}
              </span>
            </div>

            {/* Stats grid — 4 columns on sm+, 2 on mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Mentions */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50
                              border border-slate-200 dark:border-slate-700/60">
                <div className="text-[10px] font-bold uppercase tracking-widest
                                text-slate-500 dark:text-slate-400 mb-2">
                  Mentions
                </div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white mono">
                  {hashtag.mentions}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  in date range
                </div>
              </div>

              {/* Growth */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50
                              border border-slate-200 dark:border-slate-700/60">
                <div className="text-[10px] font-bold uppercase tracking-widest
                                text-slate-500 dark:text-slate-400 mb-2">
                  Growth
                </div>
                <div className="text-xl font-extrabold text-emerald-500 mono">
                  {hashtag.growth}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  vs prior period
                </div>
              </div>

              {/* Trend Velocity */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50
                              border border-slate-200 dark:border-slate-700/60">
                <div className="text-[10px] font-bold uppercase tracking-widest
                                text-slate-500 dark:text-slate-400 mb-2">
                  Velocity
                </div>
                <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mono">
                  {hashtag.velocity}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  current rate
                </div>
              </div>

              {/* Peak mentions in period */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50
                              border border-slate-200 dark:border-slate-700/60">
                <div className="text-[10px] font-bold uppercase tracking-widest
                                text-slate-500 dark:text-slate-400 mb-2">
                  Period Peak
                </div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white mono">
                  {peakMentions}K
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  max daily mentions
                </div>
              </div>
            </div>
          </div>

          {/* ━━━ SECTION 2: Trend Growth Timeline ━━━━━━━━━━━━━━━━━━━━━━ */}
          <SectionCard
            title="Trend Growth Over Time"
            subtitle={`${dateRange.startDate} — ${dateRange.endDate} · net change: ${netGrowthPct >= 0 ? '+' : ''}${netGrowthPct}%`}
            Icon={TrendingUp}
            iconColor="text-blue-600 dark:text-blue-400"
            iconBg="bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20"
          >
            {/* Numeric callout */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white mono">
                  {lastVal}K
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">mentions (end)</span>
              </div>
              <span className={`text-sm font-bold mono ${netGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {netGrowth >= 0 ? '+' : ''}{netGrowth}K
              </span>
            </div>

            {/* Chart */}
            <div className="bg-slate-50/50 dark:bg-slate-900/30
                            rounded-2xl border border-slate-200 dark:border-slate-800
                            p-2 overflow-hidden shadow-inner">
              <LazyPlotlyChart
                data={timelineChartData}
                layout={timelineLayout}
                className="w-full h-full"
                style={{ minHeight: 220 }}
                scrollContainerRef={contentRef}
              />
            </div>
          </SectionCard>

          {/* ━━━ SECTION 3: Sentiment Analysis ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <SectionCard
            title="Sentiment Analysis"
            subtitle="Positive / Neutral / Negative distribution for this hashtag"
            Icon={Heart}
            iconColor="text-rose-500"
            iconBg="bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20"
          >
            <div className="space-y-3">
              {/* Positive */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Positive</span>
                  <span className="text-sm font-extrabold text-emerald-500 mono">
                    {data.sentiment.positive}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${data.sentiment.positive}%` }}
                  />
                </div>
              </div>

              {/* Neutral */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Neutral</span>
                  <span className="text-sm font-extrabold text-slate-400 dark:text-slate-400 mono">
                    {data.sentiment.neutral}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-400 transition-all duration-700"
                    style={{ width: `${data.sentiment.neutral}%` }}
                  />
                </div>
              </div>

              {/* Negative */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Negative</span>
                  <span className="text-sm font-extrabold text-rose-500 mono">
                    {data.sentiment.negative}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-rose-500 transition-all duration-700"
                    style={{ width: `${data.sentiment.negative}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Net sentiment callout */}
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10
                            border border-emerald-500/15 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Net Sentiment</span>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mono">
                +{data.sentiment.positive - data.sentiment.negative}%
              </span>
            </div>
          </SectionCard>

          {/* ━━━ SECTION 4: Emotional Analysis ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <SectionCard
            title="Emotional Analysis"
            subtitle="Emotion distribution for posts containing this hashtag"
            Icon={BarChart2}
            iconColor="text-violet-500"
            iconBg="bg-violet-500/10 dark:bg-violet-500/20 border border-violet-500/20"
          >
            <div className="bg-slate-50/50 dark:bg-slate-900/30
                            rounded-2xl border border-slate-200 dark:border-slate-800
                            p-2 overflow-hidden shadow-inner">
              <LazyPlotlyChart
                data={emotionChartData}
                layout={emotionLayout}
                className="w-full h-full"
                style={{ minHeight: 210 }}
                scrollContainerRef={contentRef}
              />
            </div>

            {/* Dominant emotion highlight */}
            {(() => {
              const top = data.emotions.reduce((a, b) => (a.value > b.value ? a : b));
              const topColor = EMOTION_COLORS[data.emotions.findIndex(e => e.emotion === top.emotion) % EMOTION_COLORS.length];
              return (
                <div className="mt-4 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40
                                border border-slate-200 dark:border-slate-700/60
                                flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Dominant Emotion
                  </span>
                  <span className="text-sm font-extrabold mono" style={{ color: topColor }}>
                    {top.emotion} · {top.value}%
                  </span>
                </div>
              );
            })()}
          </SectionCard>

          {/* ━━━ SECTION 5: Demographic Analysis ━━━━━━━━━━━━━━━━━━━━━━━ */}
          <SectionCard
            title="Demographic Analysis"
            subtitle="Audience breakdown for this hashtag"
            Icon={Users}
            iconColor="text-indigo-500"
            iconBg="bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20"
          >
            {/* ⚠️ Synthetic data warning — always visible, cannot be dismissed */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl
                            bg-amber-50 dark:bg-amber-500/10
                            border border-amber-300 dark:border-amber-500/30
                            mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-0.5">
                  Synthetic Data
                </p>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                  This demographic data is synthetically generated for prototype
                  demonstration and does not represent actual user data. Gender and
                  Region fields are not present in the current X dataset.
                </p>
              </div>
            </div>

            {/* Segmented tab control */}
            <div className="flex gap-1 p-1 rounded-xl
                            bg-slate-100 dark:bg-slate-800
                            border border-slate-200 dark:border-slate-700 mb-4">
              {(['age', 'gender', 'region'] as DemoTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDemoTab(tab)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold
                              uppercase tracking-wide transition-all duration-200
                              ${demoTab === tab
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-600'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                              }`}
                >
                  {tab === 'age' ? 'Age Group' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Chart + legend */}
            <DonutChart data={demoData} isDark={isDark} scrollContainerRef={contentRef} />
            <Legend data={demoData} />

            {/* Summary strip */}
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {(() => {
                const dominant = demoData.reduce((a, b) => (a.value > b.value ? a : b));
                const total    = demoData.reduce((s, d) => s + d.value, 0);
                return (
                  <>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50
                                    border border-slate-200 dark:border-slate-700/60 text-center">
                      <div className="text-[10px] uppercase font-bold tracking-widest
                                      text-slate-400 mb-1">Groups</div>
                      <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {demoData.length}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50
                                    border border-slate-200 dark:border-slate-700/60 text-center">
                      <div className="text-[10px] uppercase font-bold tracking-widest
                                      text-slate-400 mb-1">Dominant</div>
                      <div className="text-xs font-extrabold truncate"
                           style={{ color: dominant.color }}>
                        {dominant.label}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50
                                    border border-slate-200 dark:border-slate-700/60 text-center">
                      <div className="text-[10px] uppercase font-bold tracking-widest
                                      text-slate-400 mb-1">Coverage</div>
                      <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                        {total}%
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Inference note for age (only actually inferred tab) */}
            {demoTab === 'age' && (
              <div className="mt-4 flex items-start gap-2 p-3
                              bg-blue-500/5 border border-blue-500/10 rounded-xl">
                <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Age distribution is AI-inferred from aggregate linguistic and behavioural
                  signals. These are statistical estimates, not verified identities.
                </p>
              </div>
            )}
          </SectionCard>

          {/* Bottom spacing */}
          <div className="h-2" />
        </div>
      </div>
    </div>
  ), document.getElementById('modal-root') ?? document.body);
};
