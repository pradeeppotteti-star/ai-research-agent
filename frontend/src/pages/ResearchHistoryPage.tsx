import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ResearchSession } from '@research-agent/shared';
import { History, Search, Clock, ArrowRight, BookOpen } from 'lucide-react';

export const ResearchHistoryPage: React.FC = () => {
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/research/history');
        if (res.data.success) {
          setSessions(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching research history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredSessions = sessions.filter(
    (s) =>
      s.query.toLowerCase().includes(filter.toLowerCase()) ||
      (s.domain || '').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-700 dark:text-brand-400 uppercase tracking-wider mb-1">
            <History className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Session Repository
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Research Session History</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Review past survey reports, groundings, and candidate research gaps.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search query or domain..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-brand-500 font-mono"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-600 dark:text-slate-400 font-mono">Loading session history...</div>
      ) : filteredSessions.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-4">
          <p className="text-slate-600 dark:text-slate-400">No matching research sessions found.</p>
          <Link
            to="/research/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-brand-600 text-white text-sm"
          >
            Start New Research Query
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSessions.map((s) => (
            <Link
              key={s.id || (s as any)._id}
              to={s.status === 'completed' ? `/research/${s.id || (s as any)._id}` : `/research/progress/${s.id || (s as any)._id}`}
              className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-500/40 block group transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-500/20">
                  {s.domain || 'Computer Science'}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    s.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {s.status}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors line-clamp-2 mb-3">
                {s.query}
              </h3>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {new Date((s as any).createdAt || Date.now()).toLocaleDateString()}
                </span>
                <span className="text-brand-700 dark:text-brand-400 font-bold flex items-center gap-1">
                  Reopen Research <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
