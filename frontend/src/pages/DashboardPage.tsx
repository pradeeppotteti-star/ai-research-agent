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
  FileCheck2,
  Clock,
  Sparkles,
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
      <div className="glass-panel p-8 sm:p-10 rounded-xl border border-[#E8E2D8] bg-white text-[#1E1C1A] shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#EEF2FF] border border-[#E8E2D8] text-[#1E3A8A] text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span>AI Smart Research Agent Workstation</span>
            </span>
            {user?.role && (
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#F5F1EA] text-[#5C554E] border border-[#E8E2D8] font-mono">
                {user.role} Account
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#1E1C1A] leading-tight">
            Welcome back, {user?.name || 'Academic Scholar'}
          </h1>

          <p className="text-sm text-[#5C554E] leading-relaxed font-sans">
            Formulate grounded research queries, evaluate pairwise document consensus, verify claim citations, and synthesize 11-section survey reports in seconds.
          </p>

          {/* Quick Launch Chips Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#766E65] uppercase tracking-wider">Quick Launch:</span>
            <button
              onClick={() => handleQuickLaunch('Design and implementation of an intelligent career guidance system using machine learning')}
              className="text-xs text-[#1E1C1A] hover:text-[#1E3A8A] bg-[#F5F1EA] hover:bg-[#EBE5DC] px-3 py-1.5 rounded-md border border-[#E8E2D8] font-semibold transition-colors"
            >
              🎓 Career Guidance
            </button>
            <button
              onClick={() => handleQuickLaunch('Vision transformer models for automated crop disease detection and tomato leaf care diagnosis')}
              className="text-xs text-[#1E1C1A] hover:text-[#1E3A8A] bg-[#F5F1EA] hover:bg-[#EBE5DC] px-3 py-1.5 rounded-md border border-[#E8E2D8] font-semibold transition-colors"
            >
              🌾 Tomato Leaf Care
            </button>
            <button
              onClick={() => handleQuickLaunch('Quantum machine learning algorithms for high-frequency financial portfolio optimization')}
              className="text-xs text-[#1E1C1A] hover:text-[#1E3A8A] bg-[#F5F1EA] hover:bg-[#EBE5DC] px-3 py-1.5 rounded-md border border-[#E8E2D8] font-semibold transition-colors"
            >
              ⚛️ Quantum Finance
            </button>
          </div>
        </div>

        <Link
          to="/research/new"
          className="shrink-0 px-6 py-3.5 rounded-lg font-bold text-white bg-[#1E3A8A] hover:bg-[#172E6F] shadow-sm flex items-center gap-2.5 transition-colors border border-[#1E3A8A]"
        >
          <Search className="w-4 h-4 text-white" />
          <span>Launch New Literature Survey</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-6 rounded-xl border border-[#E8E2D8] bg-white flex items-center gap-4 transition-colors shadow-sm">
          <div className="p-3.5 rounded-xl bg-[#EEF2FF] text-[#1E3A8A] border border-[#C7D2FE] shrink-0">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <span className="text-3xl font-black text-[#1E1C1A] block">{stats.totalSessions}</span>
            <span className="text-xs font-bold text-[#766E65] uppercase tracking-wider block">Total Research Sessions</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border border-[#E8E2D8] bg-white flex items-center gap-4 transition-colors shadow-sm">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-3xl font-black text-[#1E1C1A] block">{stats.completedSessions}</span>
            <span className="text-xs font-bold text-[#766E65] uppercase tracking-wider block">Verified Literature Surveys</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border border-[#E8E2D8] bg-white flex items-center gap-4 transition-colors shadow-sm">
          <div className="p-3.5 rounded-xl bg-[#EEF2FF] text-[#1E3A8A] border border-[#C7D2FE] shrink-0">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <span className="text-3xl font-black text-[#1E1C1A] block">{stats.totalSavedPapers}</span>
            <span className="text-xs font-bold text-[#766E65] uppercase tracking-wider block">Saved Personal Papers</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border border-[#E8E2D8] bg-white flex items-center gap-4 transition-colors shadow-sm">
          <div className="p-3.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-3xl font-black text-[#1E1C1A] block">{stats.totalVerifiedClaims}</span>
            <span className="text-xs font-bold text-[#766E65] uppercase tracking-wider block">Verified Grounded Claims</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Research & Saved Papers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Research Sessions (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#1E3A8A]" />
              <h2 className="text-xl font-black text-[#1E1C1A]">Recent Literature Surveys</h2>
            </div>
            <Link to="/history" className="text-xs font-bold text-[#1E3A8A] hover:text-[#172E6F] flex items-center gap-1">
              View History <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="glass-card p-8 rounded-xl border border-[#E8E2D8] bg-white text-center text-[#766E65]">
              Loading recent research history...
            </div>
          ) : sessions.length === 0 ? (
            <div className="glass-card p-8 rounded-xl border border-[#E8E2D8] bg-white text-center space-y-3">
              <p className="text-[#766E65] text-sm">No research sessions performed yet.</p>
              <Link
                to="/research/new"
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-[#1E3A8A] text-white hover:bg-[#172E6F]"
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
                  className="glass-card p-6 rounded-xl border border-[#E8E2D8] bg-white hover:border-[#D8D0C4] block group transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <span className="text-xs font-bold text-[#1E3A8A] bg-[#EEF2FF] px-3 py-1 rounded-full border border-[#C7D2FE]">
                        {s.domain || 'Interdisciplinary General Science'}
                      </span>
                      <h3 className="text-lg font-bold text-[#1E1C1A] group-hover:text-[#1E3A8A] transition-colors mt-2 line-clamp-1">
                        {s.query}
                      </h3>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 ${
                        s.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#766E65] mt-3 pt-3 border-t border-[#E8E2D8] font-mono">
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-[#948B80]" />
                      {new Date((s as any).createdAt || Date.now()).toLocaleDateString()}
                    </span>
                    <span>Target Papers: <strong className="text-[#1E1C1A]">{s.targetPaperCount || 10}</strong></span>
                    <span>Providers: <strong className="text-[#1E1C1A]">{(s.preferredSources || ['Semantic Scholar', 'arXiv']).slice(0, 2).join(', ')}</strong></span>
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
              <Bookmark className="w-5 h-5 text-[#1E3A8A]" />
              <h2 className="text-xl font-black text-[#1E1C1A]">Saved Library</h2>
            </div>
            <Link to="/saved-papers" className="text-xs font-bold text-[#1E3A8A] hover:text-[#172E6F] flex items-center gap-1">
              Personal Library <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {savedPapers.length === 0 ? (
            <div className="glass-card p-6 rounded-xl border border-[#E8E2D8] bg-white text-center text-[#766E65] text-xs leading-relaxed font-medium shadow-sm">
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
