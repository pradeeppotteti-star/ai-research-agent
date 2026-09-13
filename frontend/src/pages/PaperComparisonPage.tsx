import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import { PaperComparisonItem } from '@research-agent/shared';
import { GitCompare, ArrowLeft, Download } from 'lucide-react';

export const PaperComparisonPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as { paperIds?: string[]; query?: string } | undefined;

  const [comparison, setComparison] = useState<PaperComparisonItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>(state?.query || 'Academic Research Comparison');

  useEffect(() => {
    const fetchComparison = async () => {
      if (!state?.paperIds || state.paperIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.post('/research/compare', {
          paperIds: state.paperIds,
          query: state.query,
        });

        if (res.data.success) {
          setComparison(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching paper comparison matrix:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [state]);

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Constructing comparative matrix across papers...</div>;
  }

  if (comparison.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-slate-400">No papers selected for comparison.</p>
        <Link to="/dashboard" className="px-4 py-2 rounded-lg bg-brand-600 text-white font-bold text-sm inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
            <GitCompare className="w-4 h-4" /> Comparative Matrix Analysis
          </div>
          <h1 className="text-3xl font-black text-white">Side-by-Side Paper Matrix</h1>
          <p className="text-sm text-slate-400 mt-1">
            Comparing methodology, models, benchmark datasets, results, and limitations.
          </p>
        </div>
      </div>

      {/* Comparative Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-48 sticky left-0 bg-slate-900 z-10">
                Dimension
              </th>
              {comparison.map((item, idx) => (
                <th key={idx} className="p-4 text-sm font-bold text-white min-w-[280px]">
                  <div className="line-clamp-2 text-brand-300 font-extrabold">{item.paperTitle}</div>
                  <span className="text-xs text-slate-400 font-normal block mt-1 font-mono">
                    {item.authors.slice(0, 2).join(', ')} ({item.year})
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
            <tr>
              <td className="p-4 font-bold text-slate-200 sticky left-0 bg-slate-950 z-10">
                Research Problem
              </td>
              {comparison.map((item, idx) => (
                <td key={idx} className="p-4 leading-relaxed">{item.researchProblem}</td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold text-slate-200 sticky left-0 bg-slate-950 z-10">
                Methodology
              </td>
              {comparison.map((item, idx) => (
                <td key={idx} className="p-4 leading-relaxed">{item.methodology}</td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold text-slate-200 sticky left-0 bg-slate-950 z-10">
                Model Architecture
              </td>
              {comparison.map((item, idx) => (
                <td key={idx} className="p-4 font-semibold text-brand-300">{item.modelArchitecture}</td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold text-slate-200 sticky left-0 bg-slate-950 z-10">
                Benchmark Dataset
              </td>
              {comparison.map((item, idx) => (
                <td key={idx} className="p-4 leading-relaxed font-mono">{item.datasetUsed}</td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold text-slate-200 sticky left-0 bg-slate-950 z-10">
                Evaluation Metrics
              </td>
              {comparison.map((item, idx) => (
                <td key={idx} className="p-4 leading-relaxed">{item.evaluationMetrics}</td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold text-slate-200 sticky left-0 bg-slate-950 z-10">
                Key Empirical Results
              </td>
              {comparison.map((item, idx) => (
                <td key={idx} className="p-4 leading-relaxed font-semibold text-emerald-300">{item.keyResults}</td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold text-slate-200 sticky left-0 bg-slate-950 z-10">
                Strengths
              </td>
              {comparison.map((item, idx) => (
                <td key={idx} className="p-4 leading-relaxed text-slate-200">{item.strengths}</td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold text-slate-200 sticky left-0 bg-slate-950 z-10">
                Limitations
              </td>
              {comparison.map((item, idx) => (
                <td key={idx} className="p-4 leading-relaxed text-amber-300">{item.limitations}</td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold text-slate-200 sticky left-0 bg-slate-950 z-10">
                Future Directions
              </td>
              {comparison.map((item, idx) => (
                <td key={idx} className="p-4 leading-relaxed text-indigo-300">{item.futureWork}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
