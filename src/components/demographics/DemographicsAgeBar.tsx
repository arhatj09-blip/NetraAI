import React, { useMemo } from 'react';
import { PlotlyChart } from '../charts/PlotlyChart';
import { inferredDemographicsData } from '../../services/mockData';

interface DemographicsAgeBarProps {
  isDark: boolean;
  height?: string;
}

export const DemographicsAgeBar: React.FC<DemographicsAgeBarProps> = ({
  isDark,
  height = 'h-[180px]',
}) => {
  const chartData = useMemo(() => {
    return [
      {
        x: inferredDemographicsData.ageGroups.map((d) => d.range),
        y: inferredDemographicsData.ageGroups.map((d) => d.percentage),
        type: 'bar' as const,
        marker: {
          color: '#6366f1',
        },
        text: inferredDemographicsData.ageGroups.map((d) => `${d.percentage}%`),
        textposition: 'outside' as const,
        textfont: {
          family: 'JetBrains Mono, monospace',
          size: 10,
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
        size: 9,
      },
      margin: { l: 25, r: 15, t: 20, b: 25 },
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
        range: [0, 55],
      },
    };
  }, [isDark]);

  return (
    <div className={`w-full ${height}`}>
      <PlotlyChart data={chartData} layout={layout} className="w-full h-full" />
    </div>
  );
};
