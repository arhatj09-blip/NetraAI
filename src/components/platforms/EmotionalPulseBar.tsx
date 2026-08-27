import React, { useMemo } from 'react';
import { PlotlyChart } from '../charts/PlotlyChart';
import { emotionalPulseData } from '../../services/mockData';

interface EmotionalPulseBarProps {
  isDark: boolean;
  height?: string;
  color?: string;
}

export const EmotionalPulseBar: React.FC<EmotionalPulseBarProps> = ({
  isDark,
  height = 'h-[240px]',
  color = '#3b82f6',
}) => {
  const chartData = useMemo(() => {
    // Reverse for horizontal bars from top to bottom
    const reversed = [...emotionalPulseData].reverse();
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
  }, [color]);

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
  }, [isDark]);

  return (
    <div className={`w-full ${height}`}>
      <PlotlyChart data={chartData} layout={layout} className="w-full h-full" />
    </div>
  );
};
