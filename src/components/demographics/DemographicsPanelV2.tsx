import React, { useState, useMemo } from 'react';
import { Users, Info } from 'lucide-react';
import { PlotlyChart } from '../charts/PlotlyChart';
import { inferredDemographicsData } from '../../services/mockData';

type DemoTab = 'gender' | 'age' | 'region';

interface DemographicsPanelV2Props {
  isDark: boolean;
}

// ─── Colour palette for donut slices ───────────────────────────────────────
const AGE_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'];

// ─── Data structures ────────────────────────────────────────────────────────
const ageGroupData = inferredDemographicsData.ageGroups.map((g, i) => ({
  label: g.range,
  value: g.percentage,
  color: AGE_COLORS[i % AGE_COLORS.length],
}));

// Gender and Region are not present in the dataset
const GENDER_AVAILABLE = false;
const REGION_AVAILABLE = false;

// ─── Tab configuration ──────────────────────────────────────────────────────
const TABS: { id: DemoTab; label: string }[] = [
  { id: 'gender', label: 'Gender' },
  { id: 'age', label: 'Age Group' },
  { id: 'region', label: 'Region' },
];

// ─── Unavailable state ───────────────────────────────────────────────────────
const UnavailableState: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex flex-col items-center justify-center flex-1 py-12 px-6 text-center">
    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4">
      <Info className="w-6 h-6 text-slate-400" />
    </div>
    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
      {label} data unavailable
    </p>
    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[220px] leading-relaxed">
      This demographic category is not present in the current dataset. Data will appear when signals include {label.toLowerCase()} markers.
    </p>
  </div>
);

// ─── Donut chart ─────────────────────────────────────────────────────────────
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  isDark: boolean;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, isDark }) => {
  const plotlyData = useMemo(
    () => [
      {
        type: 'pie' as const,
        hole: 0.62,
        values: data.map((d) => d.value),
        labels: data.map((d) => d.label),
        marker: {
          colors: data.map((d) => d.color),
          line: { color: isDark ? '#0f172a' : '#ffffff', width: 3 },
        },
        textinfo: 'none' as const,
        hovertemplate: '<b>%{label}</b><br>%{value}%<extra></extra>',
        rotation: -90,
      },
    ],
    [data, isDark]
  );

  const layout = useMemo(
    () => ({
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: { l: 0, r: 0, t: 0, b: 0 },
      showlegend: false,
    }),
    []
  );

  // Centre annotation — dominant slice
  const dominant = data.reduce((a, b) => (a.value > b.value ? a : b));

  return (
    <div className="relative flex items-center justify-center">
      <div className="w-full" style={{ maxWidth: 260, height: 220 }}>
        <PlotlyChart data={plotlyData} layout={layout} className="w-full h-full" />
      </div>
      {/* Centre label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span
          className="text-2xl font-extrabold text-slate-900 dark:text-white"
          style={{ color: dominant.color }}
        >
          {dominant.value}%
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-0.5">
          {dominant.label}
        </span>
      </div>
    </div>
  );
};

// ─── Legend ──────────────────────────────────────────────────────────────────
interface LegendProps {
  data: { label: string; value: number; color: string }[];
}

const Legend: React.FC<LegendProps> = ({ data }) => (
  <div className="space-y-2.5 mt-4">
    {data.map((item) => (
      <div key={item.label} className="flex items-center gap-3">
        <span
          className="shrink-0 w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
          <span className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate">
            {item.label}
          </span>
          <span
            className="text-sm font-bold mono shrink-0"
            style={{ color: item.color }}
          >
            {item.value}%
          </span>
        </div>
        {/* Progress bar */}
        <div className="shrink-0 w-20 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${item.value}%`, backgroundColor: item.color }}
          />
        </div>
      </div>
    ))}
  </div>
);

// ─── Summary strip ────────────────────────────────────────────────────────────
interface SummaryStripProps {
  data: { label: string; value: number; color: string }[];
  tabLabel: string;
}

const SummaryStrip: React.FC<SummaryStripProps> = ({ data }) => {
  const dominant = data.reduce((a, b) => (a.value > b.value ? a : b));
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="mt-5 grid grid-cols-3 gap-3">
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-center">
        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
          Categories
        </div>
        <div className="text-lg font-extrabold text-slate-900 dark:text-white">{data.length}</div>
      </div>
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-center">
        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
          Dominant
        </div>
        <div
          className="text-sm font-extrabold truncate"
          style={{ color: dominant.color }}
        >
          {dominant.label}
        </div>
      </div>
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-center">
        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
          Coverage
        </div>
        <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
          {total}%
        </div>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export const DemographicsPanelV2: React.FC<DemographicsPanelV2Props> = ({ isDark }) => {
  const [activeTab, setActiveTab] = useState<DemoTab>('age');

  const isAvailable = useMemo(() => {
    if (activeTab === 'gender') return GENDER_AVAILABLE;
    if (activeTab === 'region') return REGION_AVAILABLE;
    return true;
  }, [activeTab]);

  const tabLabel = TABS.find((t) => t.id === activeTab)?.label ?? activeTab;



  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/25 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
          <Users className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
            Demographics
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            AI-inferred audience breakdown
          </p>
        </div>
      </div>

      {/* Segmented control */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all duration-200
              ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-600'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex flex-col flex-1 min-h-0">
        {isAvailable ? (
          <>
            {/* Donut chart */}
            <DonutChart data={ageGroupData} isDark={isDark} />

            {/* Legend */}
            <Legend data={ageGroupData} />

            {/* Summary strip */}
            <SummaryStrip data={ageGroupData} tabLabel={activeTab} />

            {/* Inference disclaimer */}
            <div className="mt-5 p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl">
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  AI-inferred aggregate estimates based on public signals and linguistic markers. Represents statistical clustering, not verified identities.
                </p>
              </div>
            </div>
          </>
        ) : (
          <UnavailableState label={tabLabel} />
        )}
      </div>
    </div>
  );
};
