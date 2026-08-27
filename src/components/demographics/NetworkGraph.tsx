import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

interface NetworkGraphProps {
  isDark: boolean;
  height?: string;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  isDark,
  height = 'h-48',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const nodeColor = isDark ? '#38bdf8' : '#0284c7';
    const edgeColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)';
    const textColor = isDark ? '#f1f5f9' : '#1e293b';

    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        { data: { id: 'a', label: 'TechGuru' } },
        { data: { id: 'b', label: 'Voyager' } },
        { data: { id: 'c', label: 'Analyst' } },
        { data: { id: 'd', label: 'Alpha' } },
        { data: { id: 'e', label: 'ML_Node' } },
        { data: { id: 'f', label: 'DevLead' } },
        { data: { id: 'ab', source: 'a', target: 'b' } },
        { data: { id: 'bc', source: 'b', target: 'c' } },
        { data: { id: 'cd', source: 'c', target: 'd' } },
        { data: { id: 'da', source: 'd', target: 'a' } },
        { data: { id: 'ea', source: 'e', target: 'a' } },
        { data: { id: 'fb', source: 'f', target: 'b' } },
        { data: { id: 'fc', source: 'f', target: 'c' } },
      ],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': nodeColor,
            label: 'data(label)',
            color: textColor,
            'font-size': '9px',
            'font-family': 'Plus Jakarta Sans, sans-serif',
            width: 14,
            height: 14,
            'text-valign': 'bottom',
            'text-margin-y': 4,
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1.5,
            'line-color': edgeColor,
            'curve-style': 'bezier',
            opacity: 0.8,
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: false,
        padding: 20,
      },
      userZoomingEnabled: false,
      userPanningEnabled: false,
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      className={`w-full ${height} rounded-2xl overflow-hidden bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800`}
    />
  );
};
