import React, { useMemo } from 'react';
import { PlotlyChart } from '../charts/PlotlyChart';
import { SentimentDistribution } from '../../types/intelligence';

interface SentimentDonutProps {
  distribution: SentimentDistribution;
  isDark: boolean;
  height?: string;
  hole?: number;
}

export const SentimentDonut: React.FC<SentimentDonutProps> = ({
  distribution,
  isDark,
  height = 'h-[280px]',
  hole = 0.68,
}) => {
  const chartData = useMemo(() => {
    return [
      {
        values: [distribution.positive, distribution.neutral, distribution.negative],
        labels: ['Positive', 'Neutral', 'Negative'],
        type: 'pie' as const,
        hole: hole,
        marker: {
          colors: ['#10b981', '#f59e0b', '#ef4444'],
        },
        textinfo: 'none' as const,
        hoverinfo: 'label+percent' as const,
      },
    ];
  }, [distribution, hole]);

  const layout = useMemo(() => {
    return {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: {
        color: isDark ? '#f1f5f9' : '#1e293b',
        family: 'Plus Jakarta Sans, sans-serif',
        size: 11,
      },
      margin: { l: 15, r: 15, t: 15, b: 15 },
      showlegend: false,
    };
  }, [isDark]);

  return (
    <div className={`w-full ${height} relative flex flex-col items-center justify-center`}>
      <PlotlyChart data={chartData} layout={layout} className="w-full h-full" />
    </div>
  );
};
