/**
 * AnalyticsTriPanel
 *
 * Two-column analytics section:
 *   LEFT  (top)    → Sentiment Dynamics Timeline
 *   LEFT  (bottom) → Emotional Pulse Distribution (vertical bar chart)
 *   RIGHT (full)   → Demographics panel with Gender / Age / Region tabs
 *
 * Desktop:  two-column grid  (left 3fr / right 2fr)
 * Tablet:   single column, three cards stacked
 * Mobile:   single column, three cards stacked
 */
import React, { useEffect, useState } from 'react';
import { Activity, BarChart2 } from 'lucide-react';
import { SentimentTimeline } from '../crossPlatform/SentimentTimeline';
import { EmotionalPulseBar } from '../platforms/EmotionalPulseBar';
import { DemographicsPanelV2 } from '../demographics/DemographicsPanelV2';
import { sentimentTimelineData as mockSentimentTimeline } from '../../services/mockData';
import { apiService } from '../../services/apiService';
import { SentimentTimelinePoint } from '../../types/intelligence';

interface AnalyticsTriPanelProps {
  isDark: boolean;
  platform?: string;
}

/** Pick a line colour matching the current platform */
const getPlatformColor = (platform?: string): string => {
  switch (platform?.toLowerCase()) {
    case 'social':
    case 'reddit':
      return '#6366f1';
    case 'telegram':
      return '#0ea5e9';
    default:
      return '#3b82f6';
  }
};

// ─── Shared card shell ────────────────────────────────────────────────────────
const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = '',
  children,
}) => (
  <div
    className={`
      bg-white dark:bg-slate-900
      border border-slate-200 dark:border-slate-800
      rounded-2xl p-5 sm:p-6
      shadow-sm hover:shadow-md
      transition-shadow duration-300
      ${className}
    `}
  >
    {children}
  </div>
);

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accentColor: string;
}> = ({ icon, title, subtitle, accentColor }) => (
  <div className="flex items-center gap-3 mb-4">
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
      style={{
        backgroundColor: `${accentColor}18`,
        border: `1px solid ${accentColor}35`,
        color: accentColor,
      }}
    >
      {icon}
    </div>
    <div>
      <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
        {title}
      </h2>
      <p className="text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</p>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export const AnalyticsTriPanel: React.FC<AnalyticsTriPanelProps> = ({ isDark, platform }) => {
  const lineColor = getPlatformColor(platform);
  const [timelinePoints, setTimelinePoints] = useState<SentimentTimelinePoint[]>(mockSentimentTimeline['24H']);

  useEffect(() => {
    let isMounted = true;
    apiService.getSentiment()
      .then((res) => {
        if (isMounted && res && res.timeline && res.timeline.length > 0) {
          const points: SentimentTimelinePoint[] = res.timeline.map((item) => ({
            time: new Date(item.time_period).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            value: Math.round(item.positive_percentage),
          }));
          setTimelinePoints(points.slice(-20));
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  return (
    <section aria-label="Analytics — Sentiment, Emotion, Demographics" className="mt-12">
      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-[3fr_2fr]
          gap-6
          items-stretch
        "
      >
        {/* ── LEFT COLUMN ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          {/* TOP ROW: Sentiment Dynamics Timeline */}
          <Card className="flex flex-col">
            <SectionHeader
              icon={<Activity style={{ width: 16, height: 16 }} />}
              title="Sentiment Dynamics Timeline"
              subtitle="Historical sentiment flow across the selected platform"
              accentColor={lineColor}
            />
            <SentimentTimeline
              isDark={isDark}
              timeline={timelinePoints}
              lineColor={lineColor}
              height="h-[240px]"
            />
          </Card>

          {/* BOTTOM ROW: Emotional Pulse Distribution */}
          <Card className="flex flex-col">
            <SectionHeader
              icon={<BarChart2 style={{ width: 16, height: 16 }} />}
              title="Emotional Pulse Distribution"
              subtitle="Emotional sentiment breakdown across detected signals"
              accentColor="#8b5cf6"
            />
            <EmotionalPulseBar
              isDark={isDark}
              orientation="v"
              height="h-[220px]"
            />
          </Card>
        </div>

        {/* ── RIGHT COLUMN: Demographics ───────────────────────────────────── */}
        <Card className="flex flex-col">
          <DemographicsPanelV2 isDark={isDark} />
        </Card>
      </div>
    </section>
  );
};
