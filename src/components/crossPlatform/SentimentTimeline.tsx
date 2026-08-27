import React, { useMemo } from 'react';
import { PlotlyChart } from '../charts/PlotlyChart';
import { SentimentTimelinePoint } from '../../types/intelligence';

interface SentimentTimelineProps {
  timeline: SentimentTimelinePoint[];
  isDark: boolean;
  height?: string;
  lineColor?: string;
}

export const SentimentTimeline: React.FC<SentimentTimelineProps> = ({
  timeline,
  isDark,
  height = 'h-[280px]',
  lineColor = '#3b82f6',
}) => {
  const chartData = useMemo(() => {
    return [
      {
        x: timeline.map((p) => p.time),
        y: timeline.map((p) => p.value),
        type: 'scatter' as const,
        mode: 'lines+markers' as const,
        line: {
          color: lineColor,
          width: 3.5,
          shape: 'spline' as const,
        },
        marker: {
          size: 6,
          color: lineColor,
        },
        fill: 'tozeroy' as const,
        fillcolor: 'rgba(59, 130, 246, 0.12)',
        hoverinfo: 'x+y' as const,
      },
    ];
  }, [timeline, lineColor]);

  const layout = useMemo(() => {
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    return {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: {
        color: textColor,
        family: 'Plus Jakarta Sans, sans-serif',
        size: 10,
      },
      margin: { l: 35, r: 15, t: 20, b: 35 },
      showlegend: false,
      xaxis: {
        gridcolor: gridColor,
        zeroline: false,
        tickfont: { color: textColor },
      },
      yaxis: {
        gridcolor: gridColor,
        zeroline: false,
        tickfont: { color: textColor },
        range: [30, 100],
      },
    };
  }, [isDark]);

  return (
    <div className={`w-full ${height}`}>
      <PlotlyChart data={chartData} layout={layout} className="w-full h-full" />
    </div>
  );
};
