import React, { useEffect, useMemo, useState } from 'react';
import { Pause, Play, RefreshCw } from 'lucide-react';
import { PlotlyChart } from '../charts/PlotlyChart';

interface NetworkNode {
  id: string;
  username: string;
  activity: number;
  connections: number;
  followers: number | null;
  verified: boolean | null;
  x: number;
  y: number;
  z: number;
  activity_ratio: number;
}

interface NetworkEvent {
  event_id: string;
  source: string;
  target: string;
  interaction_type: string;
  timestamp: string | null;
  simulation_bin: number;
  post_id: string | null;
}

interface NetworkResponse {
  nodes: NetworkNode[];
  events: NetworkEvent[];
  simulation: {
    duration_seconds: number;
    bin_seconds: number;
    frame_count: number;
    source_timestamps_available: boolean;
  };
}

interface DynamicSocialNetworkProps {
  isDark: boolean;
  startDate?: string;
  endDate?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

export const DynamicSocialNetwork: React.FC<DynamicSocialNetworkProps> = ({ isDark, startDate, endDate }) => {
  const [network, setNetwork] = useState<NetworkResponse | null>(null);
  const [currentBin, setCurrentBin] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);

    setIsPlaying(false);
    setCurrentBin(0);
    setError(null);
    fetch(`${API_BASE_URL}/api/x/network${params.size ? `?${params.toString()}` : ''}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Network request failed (${response.status})`);
        return response.json() as Promise<NetworkResponse>;
      })
      .then(setNetwork)
      .catch((requestError: Error) => {
        if (requestError.name !== 'AbortError') setError(requestError.message);
      });

    return () => controller.abort();
  }, [startDate, endDate]);

  useEffect(() => {
    if (!isPlaying || !network) return;
    const timer = window.setInterval(() => {
      setCurrentBin((previous) => {
        if (previous >= network.simulation.frame_count - 1) {
          setIsPlaying(false);
          return previous;
        }
        return previous + 1;
      });
    }, 500);
    return () => window.clearInterval(timer);
  }, [isPlaying, network]);

  const visibleEvents = useMemo(
    () => network?.events.filter((event) => event.simulation_bin <= currentBin) ?? [],
    [network, currentBin],
  );
  const activeNodeIds = useMemo(() => new Set(visibleEvents.flatMap((event) => [event.source, event.target])), [visibleEvents]);
  const nodeById = useMemo(() => new Map(network?.nodes.map((node) => [node.id, node]) ?? []), [network]);

  const chartData = useMemo(() => {
    if (!network) return [];
    const edges = visibleEvents.map((event) => [nodeById.get(event.source), nodeById.get(event.target)]).filter(([source, target]) => source && target);
    const edgeTrace = {
      type: 'scatter3d',
      mode: 'lines',
      x: edges.flatMap(([source, target]) => [source!.x, target!.x, null]),
      y: edges.flatMap(([source, target]) => [source!.y, target!.y, null]),
      z: edges.flatMap(([source, target]) => [source!.z, target!.z, null]),
      line: { color: isDark ? 'rgba(129, 140, 248, 0.42)' : 'rgba(79, 70, 229, 0.38)', width: 2 },
      hoverinfo: 'none',
      showlegend: false,
    };
    const nodes = network.nodes.filter((node) => activeNodeIds.has(node.id));
    const nodeTrace = {
      type: 'scatter3d',
      mode: 'markers+text',
      x: nodes.map((node) => node.x),
      y: nodes.map((node) => node.y),
      z: nodes.map((node) => node.z),
      text: nodes.map((node) => node.username),
      textposition: 'top center',
      textfont: { family: 'Plus Jakarta Sans, sans-serif', size: 10, color: isDark ? '#e2e8f0' : '#1e293b' },
      marker: {
        size: nodes.map((node) => 6 + Math.min(node.activity, 18) * 0.7),
        color: nodes.map((node) => node.activity_ratio),
        colorscale: [[0, '#38bdf8'], [0.5, '#6366f1'], [1, '#f59e0b']],
        cmin: 0,
        cmax: 1,
        opacity: 0.9,
        colorbar: { title: { text: 'Activity', side: 'right' }, thickness: 10, len: 0.72 },
        line: { color: isDark ? '#c7d2fe' : '#312e81', width: 1 },
      },
      customdata: nodes.map((node) => [node.username, node.activity, node.connections, node.followers ?? 'Unavailable', node.verified === null ? 'Unavailable' : node.verified ? 'Yes' : 'No']),
      hovertemplate: '<b>%{customdata[0]}</b><br>Activity: %{customdata[1]}<br>Connections: %{customdata[2]}<br>Followers: %{customdata[3]}<br>Verified: %{customdata[4]}<extra></extra>',
      showlegend: false,
    };
    return [edgeTrace, nodeTrace] as any;
  }, [network, visibleEvents, nodeById, activeNodeIds, isDark]);

  const layout = useMemo(() => ({
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    margin: { l: 0, r: 0, t: 0, b: 0 },
    showlegend: false,
    scene: {
      xaxis: { title: '', showticklabels: false, showgrid: true, gridcolor: isDark ? 'rgba(148,163,184,0.12)' : 'rgba(100,116,139,0.16)', zeroline: false, color: isDark ? '#94a3b8' : '#64748b' },
      yaxis: { title: '', showticklabels: false, showgrid: true, gridcolor: isDark ? 'rgba(148,163,184,0.12)' : 'rgba(100,116,139,0.16)', zeroline: false, color: isDark ? '#94a3b8' : '#64748b' },
      zaxis: { title: '', showticklabels: false, showgrid: true, gridcolor: isDark ? 'rgba(148,163,184,0.12)' : 'rgba(100,116,139,0.16)', zeroline: false, color: isDark ? '#94a3b8' : '#64748b' },
      camera: { eye: { x: 1.45, y: 1.45, z: 1.2 } },
      bgcolor: 'rgba(0,0,0,0)',
    },
  }), [isDark]);

  if (error) {
    return <div className="h-[500px] flex flex-col items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400"><RefreshCw className="w-5 h-5" /><span>Network data unavailable. Start the FastAPI backend to load this visualization.</span></div>;
  }

  return (
    <div className="space-y-3">
      <div className="h-[500px]">
        {network ? <PlotlyChart data={chartData} layout={layout} config={{ responsive: true, displayModeBar: true, displaylogo: false }} className="w-full h-full" /> : <div className="h-full flex items-center justify-center"><div className="w-7 h-7 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" /></div>}
      </div>
      {network && (
        <div className="border-t border-slate-200/70 dark:border-slate-700/70 pt-3">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <button onClick={() => setIsPlaying(true)} disabled={isPlaying || currentBin >= network.simulation.frame_count - 1} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all active:scale-[0.985]"><Play className="w-3.5 h-3.5" /> Play</button>
            <button onClick={() => setIsPlaying(false)} disabled={!isPlaying} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all active:scale-[0.985]"><Pause className="w-3.5 h-3.5" /> Pause</button>
            <span className="ml-auto text-xs font-bold text-slate-500 dark:text-slate-400">Simulation time: <span className="mono text-slate-800 dark:text-slate-200">{formatTime(currentBin * network.simulation.bin_seconds)}</span></span>
          </div>
          <input aria-label="Simulation time" type="range" min="0" max={network.simulation.frame_count - 1} value={currentBin} onChange={(event) => { setIsPlaying(false); setCurrentBin(Number(event.target.value)); }} className="w-full accent-blue-600" />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mono"><span>00:00</span><span>{formatTime(network.simulation.duration_seconds)}</span></div>
        </div>
      )}
    </div>
  );
};
