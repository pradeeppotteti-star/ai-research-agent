import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ResearchSession, SavedPaper } from '@research-agent/shared';
import { PaperCard } from '../components/common/PaperCard';
import {
  Search,
  History,
  Bookmark,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Clock,
  Sparkles,
  Zap,
  Globe,
  Award,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [savedPapers, setSavedPapers] = useState<SavedPaper[]>([]);
  const [stats, setStats] = useState<{
    totalSessions: number;
    completedSessions: number;
    totalSavedPapers: number;
    totalVerifiedClaims: number;
  }>({
    totalSessions: 5,
    completedSessions: 5,
    totalSavedPapers: 4,
    totalVerifiedClaims: 12,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, savedRes, statsRes] = await Promise.all([
          api.get('/research/history'),
          api.get('/papers/saved'),
          api.get('/research/stats'),
        ]);

        if (historyRes.data.success) setSessions(historyRes.data.data);
        if (savedRes.data.success) setSavedPapers(savedRes.data.data);
        if (statsRes.data.success) setStats(statsRes.data.data);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleQuickLaunch = (topic: string) => {
    navigate('/research/new', { state: { query: topic } });
  };

  return (
    <div className="space-y-10 py-6">
      {/* Welcome Hero Banner */}
      <div className="relative glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-brand-950/50 overflow-hidden shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Evidence-Grounded AI Research Agent Workstation</span>
            </span>
            {user?.role && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                {user.role} Account
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            Welcome back, {user?.name || 'Academic Scholar'}
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Formulate grounded research queries, evaluate pairwise document consensus, verify claim citations, and synthesize 11-section survey reports in seconds.
          </p>

          {/* Quick Launch Chips Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Launch:</span>
            <button
              onClick={() => handleQuickLaunch('Design and implementation of an intelligent career guidance system using machine learning')}
              className="text-xs text-brand-300 hover:text-brand-200 bg-brand-500/10 hover:bg-brand-500/20 px-3 py-1 rounded-xl border border-brand-500/20 font-semibold transition-all"
            >
              🎓 Career Guidance
            </button>
            <button
              onClick={() => handleQuickLaunch('Vision transformer models for automated crop disease detection and tomato leaf care diagnosis')}
              className="text-xs text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1 rounded-xl border border-emerald-500/20 font-semibold transition-all"
            >
              🌾 Tomato Leaf Care
            </button>
            <button
              onClick={() => handleQuickLaunch('Quantum machine learning algorithms for high-frequency financial portfolio optimization')}
              className="text-xs text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1 rounded-xl border border-amber-500/20 font-semibold transition-all"
            >
              ⚛️ Quantum Finance
            </button>
          </div>
        </div>

        <Link
          to="/research/new"
          className="z-10 shrink-0 px-6 py-4 rounded-2xl font-black text-white text-base bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 shadow-xl shadow-brand-500/20 flex items-center gap-3 transition-all transform hover:-translate-y-0.5 group"
        >
          <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Launch New Literature Survey</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center gap-4 hover:border-brand-500/30 transition-all">
          <div className="p-3.5 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 shrink-0">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <span className="text-3xl font-black text-white block">{stats.totalSessions}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Research Sessions</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center gap-4 hover:border-emerald-500/30 transition-all">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-3xl font-black text-white block">{stats.completedSessions}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Verified Literature Surveys</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center gap-4 hover:border-indigo-500/30 transition-all">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <span className="text-3xl font-black text-white block">{stats.totalSavedPapers}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Saved Personal Papers</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center gap-4 hover:border-amber-500/30 transition-all">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-3xl font-black text-white block">{stats.totalVerifiedClaims}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Verified Grounded Claims</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Research & Saved Papers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Research Sessions (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-brand-400" />
              <h2 className="text-xl font-black text-white">Recent Literature Surveys</h2>
            </div>
            <Link to="/history" className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View History <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="glass-card p-8 rounded-2xl border border-slate-800 text-center text-slate-400">
              Loading recent research history...
            </div>
          ) : sessions.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl border border-slate-800 text-center space-y-3">
              <p className="text-slate-400 text-sm">No research sessions performed yet.</p>
              <Link
                to="/research/new"
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-brand-600 text-white"
              >
                Start First Research Query
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.slice(0, 4).map((s) => (
                <Link
                  key={s.id || (s as any)._id}
                  to={s.status === 'completed' ? `/research/${s.id || (s as any)._id}` : `/research/progress/${s.id || (s as any)._id}`}
                  className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-brand-500/40 block group transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
                        {s.domain || 'Interdisciplinary General Science'}
                      </span>
                      <h3 className="text-lg font-bold text-slate-100 group-hover:text-brand-300 transition-colors mt-2 line-clamp-1">
                        {s.query}
                      </h3>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 ${
                        s.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/60 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {new Date((s as any).createdAt || Date.now()).toLocaleDateString()}
                    </span>
                    <span>Target Papers: <strong>{s.targetPaperCount || 10}</strong></span>
                    <span>Providers: <strong>{(s.preferredSources || ['Semantic Scholar', 'arXiv']).slice(0, 2).join(', ')}</strong></span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Saved Papers Sidebar (1 col) */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-black text-white">Saved Library</h2>
            </div>
            <Link to="/saved-papers" className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1">
              Personal Library <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {savedPapers.length === 0 ? (
            <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs leading-relaxed">
              Your paper library is empty. Save papers during research sessions to bookmark them here.
            </div>
          ) : (
            <div className="space-y-4">
              {savedPapers.slice(0, 2).map((sp) => (
                <PaperCard key={sp.id} paper={sp.paper!} isSaved={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
