import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ResearchSession } from '@research-agent/shared';
import { History, Search, Clock, ArrowRight } from 'lucide-react';

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
          <div className="flex items-center gap-2 text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-1">
            <History className="w-4 h-4 text-[#1E3A8A]" /> Session Repository
          </div>
          <h1 className="text-3xl font-black text-[#1E1C1A]">Research Session History</h1>
          <p className="text-sm text-[#5C554E] mt-1 font-medium">
            Review past survey reports, groundings, and candidate research gaps.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#948B80] absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search query or domain..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E8E2D8] text-[#1E1C1A] text-sm focus:outline-none focus:border-[#1E3A8A] font-mono placeholder-[#948B80]"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[#766E65] font-mono">Loading session history...</div>
      ) : filteredSessions.length === 0 ? (
        <div className="glass-panel p-12 rounded-xl border border-[#E8E2D8] bg-white text-center space-y-4 shadow-sm">
          <p className="text-[#766E65]">No matching research sessions found.</p>
          <Link
            to="/research/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-[#1E3A8A] hover:bg-[#172E6F] text-white text-sm shadow-sm"
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
              className="glass-card p-6 rounded-xl border border-[#E8E2D8] bg-white hover:border-[#D8D0C4] block group transition-all shadow-sm"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EEF2FF] text-[#1E3A8A] border border-[#C7D2FE]">
                  {s.domain || 'Computer Science'}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    s.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {s.status}
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#1E1C1A] group-hover:text-[#1E3A8A] transition-colors line-clamp-2 mb-3">
                {s.query}
              </h3>

              <div className="flex items-center justify-between pt-3 border-t border-[#E8E2D8] text-xs text-[#766E65]">
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#948B80]" />
                  {new Date((s as any).createdAt || Date.now()).toLocaleDateString()}
                </span>
                <span className="text-[#1E3A8A] font-bold flex items-center gap-1">
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
