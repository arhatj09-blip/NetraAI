import React from 'react';
import { Users, Info, Share2, Award, Zap } from 'lucide-react';
import { DemographicsAgeBar } from './DemographicsAgeBar';
import { NetworkGraph } from './NetworkGraph';
import { inferredDemographicsData, topInfluencersData } from '../../services/mockData';

interface DemographicsSectionProps {
  isDark: boolean;
}

export const DemographicsSection: React.FC<DemographicsSectionProps> = ({ isDark }) => {
  return (
    <section id="demographics" className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Inferred Demographics &amp; Influence Topology
          </h2>
          <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
            Audience Profiling &amp; Key Opinion Leader Network
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demographics Breakdown (2 cols) */}
        <div className="lg:col-span-2 card-base rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Aggregate Inferred Demographics &amp; Roles
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            {/* Age Distribution */}
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-3">
                Age Distribution
              </h4>
              <DemographicsAgeBar isDark={isDark} height="h-[180px]" />
            </div>

            {/* Professional Interests */}
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-3">
                Professional Interests
              </h4>
              <div className="space-y-3 pt-2">
                {inferredDemographicsData.professionalInterests.map((interest, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>{interest.field}</span>
                      <span className="mono">{interest.percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${interest.percentage}%`,
                          backgroundColor: interest.color,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Inference Disclaimer & Telemetry Bar */}
          <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl">
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                <span>Cluster:</span>
                <span className="text-slate-900 dark:text-white mono">12 Active Nodes</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                <span>Confidence:</span>
                <span className="text-emerald-500 mono">99.8%</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                <span>Latency:</span>
                <span className="text-slate-900 dark:text-white mono">215ms</span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300 text-xs">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Demographic values are AI-inferred aggregate estimates based on available public signals and linguistic markers; they represent statistical clustering rather than individual verified identities.
              </p>
            </div>
          </div>
        </div>

        {/* Network Influence Graph & Top KOLs */}
        <div className="card-base rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-sky-500" />
                Influence Network
              </h3>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                Top Authority
              </span>
            </div>

            {/* Cytoscape Graph */}
            <div className="mb-4">
              <NetworkGraph isDark={isDark} height="h-44" />
            </div>

            {/* Top Influencers */}
            <div className="space-y-2">
              <h4 className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-2 flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-500" /> Top Influencer Nodes
              </h4>
              {topInfluencersData.slice(0, 3).map((inf) => (
                <div
                  key={inf.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                      style={{ backgroundColor: inf.avatarColor }}
                    >
                      {inf.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{inf.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{inf.handle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 mono">
                    <Zap className="w-3 h-3" />
                    <span>{inf.influenceScore}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full mt-4 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 transition-all">
            Expand Full Graph
          </button>
        </div>
      </div>
    </section>
  );
};
