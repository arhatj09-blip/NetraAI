import React, { useMemo } from 'react';
import { PlotlyChart } from '../charts/PlotlyChart';
import { vectorSpaceData } from '../../services/mockData';
import { PlatformType } from '../../types/intelligence';

interface Social3DMapProps {
  platform?: PlatformType;
  isDark: boolean;
  height?: string;
  customTitle?: string;
}

export const Social3DMap: React.FC<Social3DMapProps> = ({
  platform = 'all',
  isDark,
  height = 'h-[500px]',
}) => {
  const filteredData = useMemo(() => {
    if (platform === 'all') return vectorSpaceData;
    return vectorSpaceData.filter((item) => item.platform === platform);
  }, [platform]);

  const chartData = useMemo(() => {
    const defaultColors: Record<string, string> = {
      x: '#3b82f6',
      reddit: '#f97316',
      telegram: '#0ea5e9',
    };

    const trace: any = {
      x: filteredData.map((d) => d.trend),
      y: filteredData.map((d) => d.sentiment),
      z: filteredData.map((d) => d.influence),
      mode: 'text+markers',
      type: 'scatter3d',
      text: filteredData.map((d) => d.topic),
      textposition: 'top center',
      textfont: {
        family: 'Plus Jakarta Sans, sans-serif',
        size: 10,
        color: isDark ? '#f1f5f9' : '#1e293b',
      },
      marker: {
        size: 8,
        color: filteredData.map((d) => (platform === 'all' ? defaultColors[d.platform] || '#3b82f6' : defaultColors[platform] || '#3b82f6')),
        opacity: 0.85,
      },
      hoverinfo: 'text+x+y+z',
    };

    return [trace];
  }, [filteredData, platform, isDark]);

  const layout = useMemo(() => {
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    return {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: { l: 10, r: 10, t: 10, b: 10 },
      showlegend: false,
      scene: {
        xaxis: {
          title: 'Trend Velocity',
          gridcolor: gridColor,
          zeroline: false,
          color: textColor,
          backgroundcolor: 'rgba(0,0,0,0)',
        },
        yaxis: {
          title: 'Sentiment Score',
          gridcolor: gridColor,
          zeroline: false,
          color: textColor,
          backgroundcolor: 'rgba(0,0,0,0)',
        },
        zaxis: {
          title: 'Influence Index',
          gridcolor: gridColor,
          zeroline: false,
          color: textColor,
          backgroundcolor: 'rgba(0,0,0,0)',
        },
        camera: {
          eye: { x: 1.5, y: 1.5, z: 1.2 },
        },
      },
    };
  }, [isDark]);

  return (
    <div className={`w-full ${height} rounded-2xl overflow-hidden`}>
      <PlotlyChart data={chartData} layout={layout} className="w-full h-full" />
    </div>
  );
};
