import React, { useMemo } from 'react';
import { PlotlyChart } from '../charts/PlotlyChart';
import { platformVarianceData } from '../../services/mockData';

interface PlatformVarianceBarProps {
  isDark: boolean;
  height?: string;
}

export const PlatformVarianceBar: React.FC<PlatformVarianceBarProps> = ({
  isDark,
  height = 'h-[280px]',
}) => {
  const chartData = useMemo(() => {
    return [
      {
        x: platformVarianceData.map((d) => d.platform),
        y: platformVarianceData.map((d) => d.positivity),
        type: 'bar' as const,
        marker: {
          color: platformVarianceData.map((d) => d.color),
          borderRadius: 8,
        },
        text: platformVarianceData.map((d) => `${d.positivity}%`),
        textposition: 'outside' as const,
        textfont: {
          family: 'JetBrains Mono, monospace',
          size: 11,
          color: isDark ? '#f1f5f9' : '#1e293b',
        },
      },
    ];
  }, [isDark]);

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
      margin: { l: 30, r: 15, t: 25, b: 35 },
      showlegend: false,
      xaxis: {
        gridcolor: 'transparent',
        zeroline: false,
        tickfont: { color: textColor },
      },
      yaxis: {
        gridcolor: gridColor,
        zeroline: false,
        tickfont: { color: textColor },
        range: [0, 105],
      },
    };
  }, [isDark]);

  return (
    <div className={`w-full ${height}`}>
      <PlotlyChart data={chartData} layout={layout} className="w-full h-full" />
    </div>
  );
};
