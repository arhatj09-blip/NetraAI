import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

const DEFAULT_PLOTLY_CONFIG: Partial<Plotly.Config> = {
  responsive: true,
  displayModeBar: false,
};

export interface PlotlyChartProps {
  data: Plotly.Data[];
  layout: Partial<Plotly.Layout>;
  config?: Partial<Plotly.Config>;
  className?: string;
  style?: React.CSSProperties;
}

export const PlotlyChart: React.FC<PlotlyChartProps> = ({
  data,
  layout,
  config = DEFAULT_PLOTLY_CONFIG,
  className = 'w-full h-full min-h-[250px]',
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    Plotly.newPlot(el, data, layout, {
      ...config,
      responsive: true,
    });

    const handleResize = () => {
      Plotly.Plots.resize(el);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      Plotly.purge(el);
    };
  }, [data, layout, config]);

  return <div ref={containerRef} className={className} style={style} />;
};
