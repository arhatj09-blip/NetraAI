import React, { useEffect, useMemo, useState } from 'react';
import { Pause, Play, RefreshCw, Network, Share2, Layers } from 'lucide-react';
import { PlotlyChart } from '../charts/PlotlyChart';

interface NetworkNode {
  id: string;
  username: string;
  activity: number;
  connections: number;
  degree?: number;
  in_degree?: number;
  out_degree?: number;
  followers: number | null;
  verified: boolean | null;
  x: number;
  y: number;
  z: number;
  pagerank?: number;
  betweenness?: number;
  activity_ratio: number;
}

interface NetworkEdge {
  source: string;
  target: string;
  weight: number;
  interaction_type: string;
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
  edges?: NetworkEdge[];
  events: NetworkEvent[];
  total_nodes?: number;
  total_edges?: number;
  returned_nodes?: number;
  returned_edges?: number;
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
  const [currentBin, setCurrentBin] = useState(9); // Default to full graph view
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);

    setIsPlaying(false);
    setError(null);
    fetch(`${API_BASE_URL}/api/x/network${params.size ? `?${params.toString()}` : ''}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Network request failed (${response.status})`);
        return response.json() as Promise<NetworkResponse>;
      })
      .then((data) => {
        setNetwork(data);
        setCurrentBin(data.simulation ? data.simulation.frame_count - 1 : 9);
      })
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
  
  const activeNodeIds = useMemo(() => {
    if (!network) return new Set<string>();
    // When showing full frame or when events exist, include active nodes or top nodes
    if (visibleEvents.length > 0) {
      return new Set(visibleEvents.flatMap((event) => [event.source, event.target]));
    }
    return new Set(network.nodes.map((n) => n.id));
  }, [network, visibleEvents]);

  const nodeById = useMemo(() => new Map(network?.nodes.map((node) => [node.id, node]) ?? []), [network]);

  const chartData = useMemo(() => {
    if (!network) return [];
    
    // Use events for progressive animation or edges for static rendering
    const rawEdges = visibleEvents.length > 0
      ? visibleEvents.map((e) => [nodeById.get(e.source), nodeById.get(e.target)])
      : (network.edges ?? []).map((e) => [nodeById.get(e.source), nodeById.get(e.target)]);
      
    const edges = rawEdges.filter(([source, target]) => source && target);
    
    const edgeTrace = {
      type: 'scatter3d',
      mode: 'lines',
      x: edges.flatMap(([source, target]) => [source!.x, target!.x, null]),
      y: edges.flatMap(([source, target]) => [source!.y, target!.y, null]),
      z: edges.flatMap(([source, target]) => [source!.z, target!.z, null]),
      line: { color: isDark ? 'rgba(129, 140, 248, 0.45)' : 'rgba(79, 70, 229, 0.40)', width: 2 },
      hoverinfo: 'none',
      showlegend: false,
    };
    
    const nodes = network.nodes.filter((node) => activeNodeIds.has(node.id) || (network.nodes.length <= 100));
    
    const maxDegree = Math.max(...nodes.map((n) => n.connections || n.degree || 1), 1);
    
    const nodeTrace = {
      type: 'scatter3d',
      mode: 'markers+text',
      x: nodes.map((node) => node.x),
      y: nodes.map((node) => node.y),
      z: nodes.map((node) => node.z),
      text: nodes.map((node) => node.username),
      textposition: 'top center',
      textfont: { family: 'Plus Jakarta Sans, sans-serif', size: 9, color: isDark ? '#e2e8f0' : '#1e293b' },
      marker: {
        size: nodes.map((node) => 5 + Math.min((node.connections || node.degree || 1) / maxDegree * 20, 18)),
        color: nodes.map((node) => (node.pagerank && node.pagerank > 0 ? node.pagerank * 100 : (node.connections || 1) / maxDegree)),
        colorscale: [[0, '#38bdf8'], [0.5, '#6366f1'], [1, '#f59e0b']],
        opacity: 0.92,
        colorbar: { title: { text: 'PageRank', side: 'right' }, thickness: 10, len: 0.72 },
        line: { color: isDark ? '#c7d2fe' : '#312e81', width: 1 },
      },
      customdata: nodes.map((node) => [
        node.username,
        node.connections ?? node.degree ?? 0,
        node.in_degree ?? 0,
        node.out_degree ?? 0,
        node.pagerank ? node.pagerank.toFixed(5) : '0.00000',
        node.betweenness ? node.betweenness.toFixed(5) : '0.00000',
      ]),
      hovertemplate: '<b>@%{customdata[0]}</b><br>Connections (Degree): %{customdata[1]}<br>In-Degree: %{customdata[2]} | Out-Degree: %{customdata[3]}<br>PageRank: %{customdata[4]}<br>Betweenness: %{customdata[5]}<extra></extra>',
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
    return (
      <div className="h-[500px] flex flex-col items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        <RefreshCw className="w-5 h-5" />
        <span>Network data unavailable. Start the FastAPI backend to load this visualization.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Network Metadata Stat Bar */}
      {network && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
          <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5 font-semibold">
              <Network className="w-3.5 h-3.5 text-blue-500" />
              Total Nodes: <span className="font-bold text-slate-900 dark:text-white mono">{(network.total_nodes || 3996).toLocaleString()}</span>
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <Share2 className="w-3.5 h-3.5 text-indigo-500" />
              Total Edges: <span className="font-bold text-slate-900 dark:text-white mono">{(network.total_edges || 7225).toLocaleString()}</span>
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
              <Layers className="w-3.5 h-3.5" />
              Rendered Subgraph: <span className="font-bold mono">{network.returned_nodes || network.nodes.length} nodes &amp; {network.returned_edges || (network.edges ? network.edges.length : 0)} edges</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">3D Force Layout &bull; PageRank Centrality</span>
        </div>
      )}

      <div className="h-[480px]">
        {network ? (
          <PlotlyChart data={chartData} layout={layout} config={{ responsive: true, displayModeBar: true, displaylogo: false }} className="w-full h-full" />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="w-7 h-7 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          </div>
        )}
      </div>

      {network && (
        <div className="border-t border-slate-200/70 dark:border-slate-700/70 pt-3">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <button
              onClick={() => {
                if (currentBin >= network.simulation.frame_count - 1) setCurrentBin(0);
                setIsPlaying(true);
              }}
              disabled={isPlaying}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all active:scale-[0.985]"
            >
              <Play className="w-3.5 h-3.5" /> Replay Timeline
            </button>
            <button
              onClick={() => setIsPlaying(false)}
              disabled={!isPlaying}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all active:scale-[0.985]"
            >
              <Pause className="w-3.5 h-3.5" /> Pause
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentBin(network.simulation.frame_count - 1);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Full Graph View
            </button>
            <span className="ml-auto text-xs font-bold text-slate-500 dark:text-slate-400">
              Timeline Step: <span className="mono text-slate-800 dark:text-slate-200">{currentBin + 1} / {network.simulation.frame_count}</span> ({visibleEvents.length} events active)
            </span>
          </div>
          <input
            aria-label="Simulation time"
            type="range"
            min="0"
            max={network.simulation.frame_count - 1}
            value={currentBin}
            onChange={(event) => {
              setIsPlaying(false);
              setCurrentBin(Number(event.target.value));
            }}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mono">
            <span>Start (T+0s)</span>
            <span>Final State ({formatTime(network.simulation.duration_seconds)})</span>
          </div>
        </div>
      )}
    </div>
  );
};

