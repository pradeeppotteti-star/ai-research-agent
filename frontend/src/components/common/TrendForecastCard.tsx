import React from 'react';
import { TemporalTrendForecast } from '@research-agent/shared';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';

interface TrendForecastCardProps {
  forecast: TemporalTrendForecast;
}

export const TrendForecastCard: React.FC<TrendForecastCardProps> = ({ forecast }) => {
  return (
    <div className="glass-panel p-8 rounded-3xl border border-[#E8E2D8] bg-white space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D8] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2FF] border border-[#C7D2FE] text-[#1E3A8A] text-xs font-bold mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span>2020–2026 Temporal Velocity Analytics</span>
          </div>
          <h3 className="text-2xl font-black text-[#1E1C1A]">Research Trend & Impact Forecasting</h3>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#766E65]">Projected 3-Yr Topic Momentum:</span>
          <span className="px-3.5 py-1.5 rounded-xl font-mono font-black text-sm bg-emerald-50 text-emerald-800 border border-emerald-300">
            +{forecast.projectedGrowthPct}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {forecast.emergingTopics.map((topic, idx) => (
          <div key={idx} className="glass-card p-5 rounded-2xl border border-[#E8E2D8] bg-[#FBF9F5] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1E1C1A] text-sm">{topic.keyword}</span>
              {topic.momentum === 'high_growth' || topic.momentum === 'emerging' ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +{topic.growthPct}% YoY
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold font-mono text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  <ArrowDownRight className="w-3.5 h-3.5" /> {topic.growthPct}%
                </span>
              )}
            </div>

            {/* Historical Counts Bar Representation */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] text-[#766E65] font-mono font-bold">
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
                            ? 'bg-rose-400'
                            : 'bg-gradient-to-t from-[#1E3A8A] to-[#3B82F6]'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-[9px] font-mono text-[#766E65] font-bold">{h.year}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#EEF2FF] p-5 rounded-2xl border border-[#C7D2FE] flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#1E3A8A] shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-extrabold text-[#1E3A8A] block mb-0.5">Strategic Research Recommendation</span>
          <p className="text-xs text-[#433E38] leading-relaxed font-sans">{forecast.recommendation}</p>
        </div>
      </div>
    </div>
  );
};
