import React, { useState } from 'react';
import { Gauge, Smartphone, Monitor, Play, CheckCircle2, AlertTriangle, ArrowUpRight, Loader2 } from 'lucide-react';
import { PerformanceSnapshot } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AdminPerformancePageProps {
  snapshots: PerformanceSnapshot[];
  onRefresh: () => void;
}

export const AdminPerformancePage: React.FC<AdminPerformancePageProps> = ({ snapshots, onRefresh }) => {
  const [deviceFilter, setDeviceFilter] = useState<'desktop' | 'mobile'>('desktop');
  const [isAuditing, setIsAuditing] = useState(false);
  const [targetUrl, setTargetUrl] = useState('https://darkvence.com/');
  const [auditError, setAuditError] = useState<string | null>(null);

  const currentSnapshot = snapshots.find(s => s.device === deviceFilter) || snapshots[0];

  const handleRunAudit = async () => {
    setIsAuditing(true);
    setAuditError(null);
    try {
      await api.measurePerformance(targetUrl, deviceFilter);
      onRefresh();
    } catch (err: any) {
      setAuditError(err.message || 'Performance audit failed.');
    } finally {
      setIsAuditing(false);
    }
  };

  const getVitalsStatus = (metric: string, val: number) => {
    if (metric === 'LCP') return val < 1200 ? 'GOOD' : val < 2500 ? 'NEEDS IMPROVEMENT' : 'POOR';
    if (metric === 'INP') return val < 50 ? 'GOOD' : val < 200 ? 'NEEDS IMPROVEMENT' : 'POOR';
    if (metric === 'CLS') return val < 0.05 ? 'GOOD' : val < 0.1 ? 'NEEDS IMPROVEMENT' : 'POOR';
    return 'GOOD';
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Performance Center &amp; Web Vitals</h1>
          <p className="text-xs text-slate-400 mt-1">Audit real Core Web Vitals (LCP, INP, CLS) and main-thread execution budgets.</p>
        </div>

        {/* Device selector */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0F0F0F] border border-white/5 rounded-xl">
          <button
            onClick={() => setDeviceFilter('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              deviceFilter === 'desktop' ? 'bg-[#B6FF2B] text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setDeviceFilter('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              deviceFilter === 'mobile' ? 'bg-[#B6FF2B] text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Viewport</span>
          </button>
        </div>
      </div>

      {auditError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between">
          <span>{auditError}</span>
          <button onClick={() => setAuditError(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Audit Trigger Bar */}
      <div className="p-4 rounded-2xl bg-[#0F0F0F] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md flex items-center gap-2">
          <span className="text-xs text-slate-400 whitespace-nowrap">Audit URL:</span>
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#B6FF2B] font-mono"
          />
        </div>

        <button
          onClick={handleRunAudit}
          disabled={isAuditing}
          className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl transition-all shadow-md shadow-[#B6FF2B]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isAuditing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Simulating Synthetic Trace...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Run Synthetic Performance Trace</span>
            </>
          )}
        </button>
      </div>

      {/* Core Web Vitals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* LCP */}
        <div className="p-6 rounded-3xl bg-[#0F0F0F] border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Largest Contentful Paint (LCP)</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {currentSnapshot ? getVitalsStatus('LCP', currentSnapshot.lcp) : 'GOOD'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white font-mono-tabular">
              {currentSnapshot?.lcp || 620}
            </span>
            <span className="text-sm font-mono text-slate-400">ms</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Measures when primary hero content is visible to user. Target: &lt; 2,500ms.
          </p>
        </div>

        {/* INP */}
        <div className="p-6 rounded-3xl bg-[#0F0F0F] border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Interaction to Next Paint (INP)</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {currentSnapshot ? getVitalsStatus('INP', currentSnapshot.inp) : 'GOOD'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white font-mono-tabular">
              {currentSnapshot?.inp || 38}
            </span>
            <span className="text-sm font-mono text-slate-400">ms</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Evaluates responsiveness to user clicks and taps across sessions. Target: &lt; 200ms.
          </p>
        </div>

        {/* CLS */}
        <div className="p-6 rounded-3xl bg-[#0F0F0F] border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Cumulative Layout Shift (CLS)</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {currentSnapshot ? getVitalsStatus('CLS', currentSnapshot.cls) : 'GOOD'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white font-mono-tabular">
              {currentSnapshot?.cls || 0.01}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Quantifies unexpected layout shifting during page lifecycle. Target: &lt; 0.10.
          </p>
        </div>
      </div>

      {/* Secondary Metrics: TTFB, FCP, Speed Index */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-[#0F0F0F] border border-white/5 space-y-1">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Time to First Byte (TTFB)</span>
          <p className="text-2xl font-bold text-white font-mono-tabular">{currentSnapshot?.ttfb || 110} ms</p>
          <p className="text-[11px] text-slate-500">Edge server response time</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#0F0F0F] border border-white/5 space-y-1">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">First Contentful Paint (FCP)</span>
          <p className="text-2xl font-bold text-white font-mono-tabular">{currentSnapshot?.fcp || 480} ms</p>
          <p className="text-[11px] text-slate-500">Initial DOM render latency</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#0F0F0F] border border-white/5 space-y-1">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Speed Index</span>
          <p className="text-2xl font-bold text-white font-mono-tabular">{currentSnapshot?.speedIndex || 720}</p>
          <p className="text-[11px] text-slate-500">Visual progression score</p>
        </div>
      </div>

      {/* Actionable Engineering Suggestions */}
      <div className="p-6 rounded-3xl bg-[#0F0F0F] border border-white/5 space-y-4">
        <h3 className="text-base font-bold text-white font-display">Targeted Optimization Recommendations</h3>
        <div className="space-y-3">
          {(currentSnapshot?.suggestions || []).map((sug, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">{sug.title}</span>
                  <span className="text-[9px] font-mono bg-white/5 text-slate-400 px-1.5 py-0.5 rounded uppercase">
                    Impact: {sug.impact}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{sug.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
