import React, { useState } from 'react';
import { X, FileText, Download, Sparkles } from 'lucide-react';

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GenerateReportModal: React.FC<GenerateReportModalProps> = ({ isOpen, onClose }) => {
  const [reportType, setReportType] = useState('executive');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReady, setIsReady] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsReady(true);
    }, 1200);
  };

  const handleDownload = () => {
    // Generate text/markdown export blob
    const content = `# NETRAAI SOCIAL INTELLIGENCE REPORT
Date: ${new Date().toISOString()}
Cluster: US-WEST-04 | Status: Operational
Records Processed: 274,392
Aggregated Sentiment: 72% Positive | 17% Neutral | 11% Negative
Dominant Trends: #AgentDev (+124%), #GPT5Architecture (+82%), #LLMOps (+112%)
Cross-Platform Positivity: Telegram (88%), X (68%), Reddit (42%)
Risk Factors: Ethical & regulatory concerns in developer communities (FUD score: 78.1)
AI Synthesis: High adoption velocity with strong retail optimism and technical consolidation.
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netraai-intelligence-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="card-base rounded-[2rem] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 dark:border-slate-700">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Generate Intelligence Report
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cross-Platform Synthesized Export
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
              Report Scope &amp; Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReportType('executive')}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  reportType === 'executive'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Executive Summary
                <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                  High-level signal metrics &amp; alpha shifts
                </span>
              </button>

              <button
                type="button"
                onClick={() => setReportType('technical')}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  reportType === 'technical'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Deep-Dive Analytics
                <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                  Vector matrices, network topology &amp; logs
                </span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Records Ingested:</span>
              <strong className="text-slate-900 dark:text-white mono">274,392</strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Data Nodes:</span>
              <strong className="text-slate-900 dark:text-white mono">X, Reddit, Telegram</strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Synthesizer:</span>
              <strong className="text-blue-600 dark:text-blue-400">NetraAI Analyst v2.4</strong>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          {!isReady ? (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Synthesizing Report...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleDownload}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Markdown Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
