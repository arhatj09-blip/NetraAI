import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  ArrowRight,
  Activity,
  Heart,
  Hash,
  TrendingUp,
  Network,
  Users,
  ChevronRight,
  Sun,
  Moon,
  Database,
  Cpu,
  BarChart3,
  Layers,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { Social3DMap } from '../components/crossPlatform/Social3DMap';

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS & CONFIG
───────────────────────────────────────────────────────────────────────────── */

const CAPABILITIES = [
  {
    icon: Activity,
    label: 'Sentiment Analysis',
    desc: 'Classify positive, negative, and neutral signals at scale across all communication channels.',
    color: 'text-emerald-500',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Heart,
    label: 'Emotion Detection',
    desc: 'Identify nuanced emotional tones — fear, trust, anger, anticipation — across public discourse.',
    color: 'text-rose-500',
    border: 'border-rose-500/20',
    bg: 'bg-rose-500/10',
  },
  {
    icon: Hash,
    label: 'Topic Extraction',
    desc: 'Surface dominant narratives, emerging discussions, and recurring themes from unstructured data.',
    color: 'text-blue-500',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/10',
  },
  {
    icon: TrendingUp,
    label: 'Trend & Emerging Topic Analysis',
    desc: 'Identify evolving topics, velocity shifts, and emerging narratives across analyzed signals.',
    color: 'text-amber-500',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Network,
    label: 'Network Analysis',
    desc: 'Map influence topology, key opinion leaders, and information propagation pathways.',
    color: 'text-violet-500',
    border: 'border-violet-500/20',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Users,
    label: 'Audience Intelligence',
    desc: 'Infer demographic profiles, community clusters, and engagement patterns across social streams.',
    color: 'text-cyan-500',
    border: 'border-cyan-500/20',
    bg: 'bg-cyan-500/10',
  },
] as const;

const PIPELINE_STEPS = [
  {
    icon: Database,
    label: 'Data',
    detail: 'Timestamped datasets — X (Twitter) & social platforms',
    color: 'bg-blue-600',
    connector: true,
  },
  {
    icon: Layers,
    label: 'Preprocessing',
    detail: 'Normalise, deduplicate, tokenise & embed',
    color: 'bg-indigo-600',
    connector: true,
  },
  {
    icon: Cpu,
    label: 'AI / ML',
    detail: 'Sentiment, emotion, topic & entity models',
    color: 'bg-violet-600',
    connector: true,
  },
  {
    icon: BarChart3,
    label: 'Analytics',
    detail: 'Aggregate, trend-detect, vectorise',
    color: 'bg-purple-600',
    connector: true,
  },
  {
    icon: BrainCircuit,
    label: 'Intelligence',
    detail: 'Actionable insights, 3D space & Q&A agent',
    color: 'bg-fuchsia-600',
    connector: false,
  },
] as const;

const PLATFORMS = [
  { id: 'platforms', label: 'Platforms', value: 'X • Reddit • Telegram', color: 'bg-blue-500' },
  { id: 'dimensions', label: 'Analytical Dimensions', value: 'Sentiment • Emotion • Topics • Trends • Network • Audience', color: 'bg-indigo-500' },
  { id: 'processing', label: 'Processing', value: 'Structured Dataset Analysis', color: 'bg-cyan-500' },
] as const;

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATED ENTRANCE WRAPPER
───────────────────────────────────────────────────────────────────────────── */
const Reveal: React.FC<{ delay?: number; className?: string; children: React.ReactNode }> = ({
  delay = 0,
  className = '',
  children,
}) => (
  <div
    className={`land-fade-up ${className}`}
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
  >
    {children}
  </div>
);

/** Section badge pill */
const SectionBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest">
    {children}
  </span>
);

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [mapVisible, setMapVisible] = useState(false);
  const mapSentinelRef = useRef<HTMLDivElement>(null);

  // Lazy-render 3-D map when scrolling near
  useEffect(() => {
    const el = mapSentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setMapVisible(true); },
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const enterDashboard = () => navigate('/dashboard');

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 overflow-x-hidden">

      {/* ── TOPBAR ───────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-6 lg:px-12
                         bg-white/80 dark:bg-slate-900/80 backdrop-blur-md
                         border-b border-slate-200/70 dark:border-slate-800/70
                         land-fade-in" style={{ animationDuration: '0.4s' }}>
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/25">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white uppercase">
            NetraAI
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Intelligence Suite
          </span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => toggleTheme('light')}
              aria-label="Light mode"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                !isDark ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Sun className="w-3 h-3" />
              <span className="hidden sm:inline">Light</span>
            </button>
            <button
              onClick={() => toggleTheme('dark')}
              aria-label="Dark mode"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                isDark ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Moon className="w-3 h-3" />
              <span className="hidden sm:inline">Dark</span>
            </button>
          </div>

          {/* Enter dashboard */}
          <button
            onClick={enterDashboard}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full
                       bg-slate-900 dark:bg-white text-white dark:text-slate-900
                       text-xs font-bold uppercase tracking-wider
                       hover:opacity-90 transition-opacity shadow-sm"
          >
            Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-14 sm:pt-28 sm:pb-16 px-4 overflow-hidden">
        {/* Dot grid */}
        <div className="absolute inset-0 land-grid-bg opacity-50 pointer-events-none" />

        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[400px] rounded-full
                        bg-blue-500/10 dark:bg-blue-600/8 blur-[100px]
                        pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Status pill */}
          <Reveal delay={60}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
                            bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-sm
                            border border-slate-200 dark:border-slate-700
                            text-[10px] font-bold uppercase tracking-widest
                            text-slate-600 dark:text-slate-400 mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 land-dot-blink" />
              Cross-Platform Social Intelligence Platform
            </div>
          </Reveal>

          {/* Logo & Name */}
          <Reveal delay={120}>
            <div className="flex items-center justify-center gap-3.5 mb-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl
                              bg-gradient-to-tr from-blue-600 to-indigo-500
                              flex items-center justify-center text-white
                              shadow-lg shadow-blue-500/30 land-float">
                <BrainCircuit className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight
                             text-slate-900 dark:text-white leading-none">
                NetraAI
              </h1>
            </div>
          </Reveal>

          {/* Tagline */}
          <Reveal delay={180}>
            <p className="text-xl sm:text-2xl font-semibold text-slate-700 dark:text-slate-300
                          tracking-tight mb-4 italic">
              "See beyond the conversation."
            </p>
          </Reveal>

          {/* Description */}
          <Reveal delay={240}>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-400
                          leading-relaxed mb-8">
              A cross-platform social intelligence system that transforms fragmented public discourse across social platforms into structured, analyzable intelligence.
            </p>
          </Reveal>

          {/* Primary CTA button */}
          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={enterDashboard}
                className="land-cta-btn flex items-center gap-2.5 px-8 py-3.5
                           text-white font-bold text-xs uppercase tracking-widest
                           rounded-2xl group shadow-lg"
              >
                Enter Intelligence Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#capabilities"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('capabilities')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl
                           border border-slate-300 dark:border-slate-700
                           text-slate-700 dark:text-slate-300
                           font-semibold text-xs uppercase tracking-wider
                           hover:border-blue-400 dark:hover:border-blue-600
                           hover:text-blue-600 dark:hover:text-blue-400
                           transition-all"
              >
                Explore Capabilities <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </Reveal>

          {/* System summary strip */}
          <Reveal delay={380}>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-700
                            land-glass rounded-2xl overflow-hidden max-w-3xl mx-auto border border-slate-200/70 dark:border-slate-800/70">
              {PLATFORMS.map((p) => (
                <div key={p.id} className="flex flex-col items-center justify-center py-4 px-3 text-center">
                  <div className={`w-2 h-2 rounded-full ${p.color} mb-2`} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-1.5">
                    {p.label}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                    {p.value}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PROBLEM STATEMENT ────────────────────────────────────────────────── */}
      <section className="px-4 py-10 sm:py-12 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="land-glass rounded-3xl p-6 sm:p-10 border border-amber-500/20 shadow-sm">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20
                                flex items-center justify-center text-amber-500">
                  <AlertCircle className="w-6 h-6" />
                </div>

                <div>
                  <SectionBadge>The Problem</SectionBadge>
                  <h2 className="mt-3 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white
                                 tracking-tight leading-snug">
                    Social media intelligence is scattered, noisy, and difficult to synthesize at scale.
                  </h2>
                  <p className="mt-3 text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed max-w-3xl">
                    Public information is distributed across multiple platforms, formats, and communities. Analysts must monitor these sources, identify emerging narratives, and connect signals across platforms. This makes meaningful patterns difficult to detect consistently at scale.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['Cross-platform fragmentation', 'Manual monitoring overhead', 'Delayed signal detection', 'No unified vector layer'].map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700
                                   text-[11px] font-semibold text-slate-600 dark:text-slate-400
                                   bg-slate-50 dark:bg-slate-800/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── KEY CAPABILITIES ─────────────────────────────────────────────────── */}
      <section id="capabilities" className="px-4 py-12 sm:py-14 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <SectionBadge>Key Capabilities</SectionBadge>
              <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Every signal layer, unified.
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-xs sm:text-sm">
                NetraAI combines six analytical dimensions into a single coherent intelligence surface.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {CAPABILITIES.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <Reveal key={cap.label} delay={i * 50}>
                  <div className={`land-glass rounded-2xl p-5 sm:p-6 border ${cap.border} h-full
                                  hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
                    <div className={`w-10 h-10 rounded-xl ${cap.bg} border ${cap.border}
                                    flex items-center justify-center mb-3.5`}>
                      <Icon className={`w-5 h-5 ${cap.color}`} />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                      {cap.label}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3-D VECTOR SPACE HIGHLIGHT ───────────────────────────────────────── */}
      <section className="px-4 py-12 sm:py-14 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

            {/* Left: copy */}
            <div>
              <Reveal>
                <SectionBadge>Differentiating Feature</SectionBadge>
                <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white
                               tracking-tight leading-snug">
                  3D Intelligence<br />Vector Space
                </h2>
              </Reveal>
              <Reveal delay={60}>
                <p className="mt-3 text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Every processed topic is mapped in a three-dimensional coordinate space defined by{' '}
                  <strong className="text-slate-800 dark:text-slate-200">Trend Velocity</strong>,{' '}
                  <strong className="text-slate-800 dark:text-slate-200">Sentiment Score</strong>, and{' '}
                  <strong className="text-slate-800 dark:text-slate-200">Influence Index</strong>.
                </p>
                <p className="mt-2 text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Spatial clustering exposes relationships that flat dashboards cannot — revealing which narratives are gaining velocity, which carry high emotion, and where authority nodes converge.
                </p>
              </Reveal>

              <Reveal delay={120}>
                <div className="mt-6 space-y-2.5">
                  {[
                    { axis: 'X axis', label: 'Trend Velocity', color: 'bg-blue-500' },
                    { axis: 'Y axis', label: 'Sentiment Score', color: 'bg-emerald-500' },
                    { axis: 'Z axis', label: 'Influence Index', color: 'bg-violet-500' },
                  ].map((item) => (
                    <div key={item.axis} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${item.color}`} />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-14">
                        {item.axis}
                      </span>
                      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={180}>
                <button
                  onClick={enterDashboard}
                  className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400
                             hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
                >
                  Explore in dashboard
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Reveal>
            </div>

            {/* Right: 3-D map container */}
            <Reveal delay={100}>
              <div
                ref={mapSentinelRef}
                className="relative land-glass rounded-2xl overflow-hidden border border-blue-500/20 shadow-sm"
                style={{ minHeight: '380px' }}
              >
                {/* Header bar */}
                <div className="flex items-center justify-between px-4 py-3
                                border-b border-slate-200/60 dark:border-slate-700/60
                                bg-slate-50/80 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 land-dot-blink" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Analytical Vector Space
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] uppercase font-bold text-slate-400">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> X (Twitter)</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Social</span>
                  </div>
                </div>

                {/* Map */}
                <div className="p-2">
                  {mapVisible ? (
                    <Social3DMap isDark={isDark} platform="all" height="h-[330px]" />
                  ) : (
                    <div className="h-[330px] flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="px-4 py-12 sm:py-14 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <SectionBadge>How It Works</SectionBadge>
              <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                From raw data to intelligence.
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-lg mx-auto text-xs sm:text-sm">
                Five processing stages transform platform-specific data into structured intelligence.
              </p>
            </div>
          </Reveal>

          {/* Pipeline steps */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {PIPELINE_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.label} delay={i * 60}>
                  <div className="flex flex-col items-center text-center p-4 rounded-2xl land-glass border border-slate-200/70 dark:border-slate-800/70 h-full group hover:border-blue-500/30 transition-all">
                    <div className={`w-11 h-11 rounded-xl ${step.color}
                                    flex items-center justify-center text-white
                                    shadow-md transition-transform group-hover:scale-105 duration-200`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="mt-2.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Step {i + 1}
                    </span>
                    <h3 className="mt-0.5 font-bold text-xs text-slate-900 dark:text-white">
                      {step.label}
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {step.detail}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ANALYST WORKFLOW ─────────────────────────────────────────────────── */}
      <section className="px-4 py-12 sm:py-14 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <SectionBadge>Analyst Workflow</SectionBadge>
              <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                From signal discovery to actionable insight.
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm">
                Explore processed social signals, apply filters, compare platforms, and investigate emerging narratives through a unified analytical workflow.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'Search', description: 'Find keywords, hashtags, topics or entities.' },
              { step: '02', title: 'Filter', description: 'Refine by date, platform, demographics and other available attributes.' },
              { step: '03', title: 'Analyze', description: 'Explore sentiment, emotion, topics, trends and audience patterns.' },
              { step: '04', title: 'Compare', description: 'Compare signals across X, Reddit and Telegram.' },
              { step: '05', title: 'Investigate', description: 'Use network analysis and AI-assisted insights to understand relationships and patterns.' },
            ].map((item, index) => (
              <Reveal key={item.step} delay={index * 60}>
                <div className="land-glass rounded-2xl p-5 border border-slate-200/70 dark:border-slate-800/70 h-full">
                  <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400 mb-3">
                    {item.step}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANALYTICAL CONTEXT ───────────────────────────────────────────────── */}
      <section className="px-4 py-12 sm:py-14 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-8">
              <SectionBadge>Analytical Context</SectionBadge>
              <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Understand the data behind every insight.
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Source', value: 'X • Reddit • Telegram' },
              { label: 'Analysis Period', value: 'User-selected date range' },
              { label: 'Processing Status', value: 'Processed / Analysis available' },
              { label: 'Confidence', value: 'Model confidence where applicable' },
            ].map((item, index) => (
              <Reveal key={item.label} delay={index * 50}>
                <div className="land-glass rounded-2xl p-4 border border-slate-200/70 dark:border-slate-800/70 h-full">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-2">
                    {item.label}
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                    {item.value}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={80}>
            <p className="mt-6 text-center text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
              Insights are generated from processed public-domain social data and analytical models.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── FINAL CTA BANNER ─────────────────────────────────────────────────── */}
      <section className="relative px-4 py-14 sm:py-16 border-t border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2
                        w-[500px] h-[250px] rounded-full
                        bg-blue-500/10 dark:bg-blue-600/8 blur-[90px]
                        pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <Reveal>
            <div className="land-glass rounded-3xl border border-blue-500/20 px-6 sm:px-12 py-10 sm:py-12 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500
                              flex items-center justify-center text-white
                              shadow-lg shadow-blue-500/25 mx-auto mb-4 land-float">
                <BrainCircuit className="w-6 h-6" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white
                             tracking-tight mb-3">
                Ready to explore the intelligence?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-md mx-auto mb-8 leading-relaxed">
                Open the dashboard to explore pipeline status, platform analytics, the analytical vector space,
                and the search interface across processed social signals.
              </p>

              <button
                onClick={enterDashboard}
                className="land-cta-btn inline-flex items-center gap-2.5 px-8 py-3.5
                           text-white font-bold text-xs uppercase tracking-widest
                           rounded-2xl group shadow-lg"
              >
                ENTER INTELLIGENCE DASHBOARD
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3
                        text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded bg-gradient-to-tr from-blue-600 to-indigo-500
                            flex items-center justify-center text-white">
              <BrainCircuit className="w-2.5 h-2.5" />
            </div>
            <span>© 2026 NetraAI</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span>Social Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-2">
            <Radio className="w-3 h-3 text-emerald-500" />
            <span>Multi-Source Signal Intelligence</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
