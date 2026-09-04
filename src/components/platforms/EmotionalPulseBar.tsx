import React, { useEffect, useMemo, useState } from 'react';
import { PlotlyChart } from '../charts/PlotlyChart';
import { emotionalPulseData as mockEmotionalPulseData } from '../../services/mockData';
import { apiService } from '../../services/apiService';

interface EmotionalPulseBarProps {
  isDark: boolean;
  height?: string;
  color?: string;
  /** 'h' = horizontal bars (default, legacy), 'v' = vertical bars */
  orientation?: 'h' | 'v';
}

// Emotion colour palette — one distinct colour per emotion
const EMOTION_COLORS = [
  '#3b82f6', // Excitement – blue
  '#8b5cf6', // Curiosity – violet
  '#10b981', // Support – emerald
  '#f59e0b', // Anxiety – amber
  '#ef4444', // Fear – red
  '#6366f1', // Sadness – indigo
  '#f97316', // Anger – orange
];

export const EmotionalPulseBar: React.FC<EmotionalPulseBarProps> = ({
  isDark,
  height = 'h-[240px]',
  color = '#3b82f6',
  orientation = 'h',
}) => {
  const [pulseData, setPulseData] = useState<Array<{ emotion: string; value: number }>>(mockEmotionalPulseData);

  useEffect(() => {
    let isMounted = true;
    apiService.getEmotions()
      .then((res) => {
        if (isMounted && res && res.summary && res.summary.length > 0) {
          setPulseData(res.summary.map(s => ({ emotion: s.emotion, value: s.percentage })));
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const chartData = useMemo(() => {
    if (orientation === 'v') {
      // Vertical bar chart — emotions on x-axis, values on y-axis
      return [
        {
          x: pulseData.map((d) => d.emotion),
          y: pulseData.map((d) => d.value),
          type: 'bar' as const,
          orientation: 'v' as const,
          marker: {
            color: pulseData.map((_, i) => EMOTION_COLORS[i % EMOTION_COLORS.length]),
            opacity: 0.9,
            line: {
              color: 'rgba(255,255,255,0.15)',
              width: 1,
            },
          },
          text: pulseData.map((d) => `${d.value}%`),
          textposition: 'outside' as const,
          textfont: {
            family: 'JetBrains Mono, monospace',
            size: 10,
            color: isDark ? '#f1f5f9' : '#1e293b',
          },
          hovertemplate: '<b>%{x}</b><br>%{y}%<extra></extra>',
        },
      ];
    }

    // Horizontal bars (original behaviour)
    const reversed = [...pulseData].reverse();
    return [
      {
        x: reversed.map((d) => d.value),
        y: reversed.map((d) => d.emotion),
        type: 'bar' as const,
        orientation: 'h' as const,
        marker: {
          color: color,
        },
        text: reversed.map((d) => `${d.value}%`),
        textposition: 'auto' as const,
        textfont: {
          family: 'JetBrains Mono, monospace',
          size: 10,
          color: '#ffffff',
        },
      },
    ];
  }, [color, orientation, isDark]);

  const layout = useMemo(() => {
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    if (orientation === 'v') {
      return {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
          color: textColor,
          family: 'Plus Jakarta Sans, sans-serif',
          size: 10,
        },
        margin: { l: 30, r: 15, t: 28, b: 55 },
        showlegend: false,
        xaxis: {
          gridcolor: 'transparent',
          zeroline: false,
          tickfont: { color: isDark ? '#cbd5e1' : '#334155', size: 10 },
          tickangle: -20,
        },
        yaxis: {
          gridcolor: gridColor,
          zeroline: false,
          tickfont: { color: textColor },
          range: [0, 100],
          ticksuffix: '%',
        },
        bargap: 0.28,
      };
    }

    return {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: {
        color: textColor,
        family: 'Plus Jakarta Sans, sans-serif',
        size: 10,
      },
      margin: { l: 80, r: 20, t: 10, b: 25 },
      showlegend: false,
      xaxis: {
        gridcolor: gridColor,
        zeroline: false,
        tickfont: { color: textColor },
        range: [0, 100],
      },
      yaxis: {
        gridcolor: 'transparent',
        zeroline: false,
        tickfont: { color: isDark ? '#f1f5f9' : '#1e293b', size: 11, weight: 600 },
      },
    };
  }, [isDark, orientation]);

  return (
    <div className={`w-full ${height}`}>
      <PlotlyChart data={chartData} layout={layout} className="w-full h-full" />
    </div>
  );
};
