import React from 'react';
import { TemporalTrendForecast } from '@research-agent/shared';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';

interface TrendForecastCardProps {
  forecast: TemporalTrendForecast;
}

export const TrendForecastCard: React.FC<TrendForecastCardProps> = ({ forecast }) => {
  return (
    <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-700 dark:text-brand-400 text-xs font-bold mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>2020–2026 Temporal Velocity Analytics</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">Research Trend & Impact Forecasting</h3>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Projected 3-Yr Topic Momentum:</span>
          <span className="px-3.5 py-1.5 rounded-xl font-mono font-black text-sm bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            +{forecast.projectedGrowthPct}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {forecast.emergingTopics.map((topic, idx) => (
          <div key={idx} className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{topic.keyword}</span>
              {topic.momentum === 'high_growth' || topic.momentum === 'emerging' ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +{topic.growthPct}% YoY
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold font-mono text-rose-700 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  <ArrowDownRight className="w-3.5 h-3.5" /> {topic.growthPct}%
                </span>
              )}
            </div>

            {/* Historical Counts Bar Representation */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono font-bold">
                Publication Volume (2021-2025):
              </span>
              <div className="flex items-end gap-2 h-16 pt-2">
                {topic.historicalCounts.map((h, i) => {
                  const maxVal = Math.max(...topic.historicalCounts.map((c) => c.paperCount));
                  const heightPct = Math.max(15, Math.round((h.paperCount / maxVal) * 100));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t transition-all ${
                          topic.momentum === 'declining'
                            ? 'bg-rose-500/40'
                            : 'bg-gradient-to-t from-brand-600 to-indigo-500'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-[9px] font-mono text-slate-600 dark:text-slate-400 font-bold">{h.year}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-brand-500/10 dark:bg-brand-950/20 p-5 rounded-2xl border border-brand-500/30 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-extrabold text-brand-800 dark:text-brand-300 block mb-0.5">Strategic Research Recommendation</span>
          <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed font-sans">{forecast.recommendation}</p>
        </div>
      </div>
    </div>
  );
};
