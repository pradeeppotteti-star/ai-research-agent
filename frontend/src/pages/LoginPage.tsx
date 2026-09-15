import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  BrainCircuit,
  Mail,
  Lock,
  AlertCircle,
  LogIn,
  ShieldCheck,
  FlaskConical,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: demoEmail,
        password: demoPass,
      });
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        navigate('/dashboard');
        return;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed for demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
          <BrainCircuit className="w-4 h-4 text-brand-400" />
          <span>Academic Portal Authentication</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Researcher Sign In</h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Access your research history, citation verification graph, and literature survey reports.
        </p>
      </div>

      {/* 1-Click Demo Testing Accounts */}
      <div className="glass-panel p-5 rounded-2xl border border-brand-500/20 bg-brand-950/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-300">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Select 1-Click Testing Account</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Pre-seeded Profiles</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Admin Demo */}
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('admin@research-agent.org', 'adminPassword123')}
            disabled={loading}
            className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-brand-500/50 hover:bg-slate-850 text-left transition-all group"
          >
            <div className="flex items-center gap-2 text-brand-400 font-bold text-xs mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Admin / Lead</span>
            </div>
            <span className="text-xs font-bold text-slate-200 block truncate group-hover:text-white">
              Shaik Fazullah
            </span>
            <span className="text-[10px] text-slate-400 block truncate font-mono">Lead AI Researcher</span>
          </button>

          {/* Tester / Peer Reviewer Demo */}
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('tester@academic.org', 'testerPassword123')}
            disabled={loading}
            className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-left transition-all group"
          >
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs mb-1">
              <FlaskConical className="w-4 h-4" />
              <span>Peer Reviewer</span>
            </div>
            <span className="text-xs font-bold text-slate-200 block truncate group-hover:text-white">
              Potteti Pradeep
            </span>
            <span className="text-[10px] text-slate-400 block truncate font-mono">Peer Reviewer Lab</span>
          </button>

          {/* Student Scholar Demo */}
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('student@university.edu', 'studentPassword123')}
            disabled={loading}
            className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 text-left transition-all group"
          >
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>Research Scholar</span>
            </div>
            <span className="text-xs font-bold text-slate-200 block truncate group-hover:text-white">
              Puli Prabhas
            </span>
            <span className="text-[10px] text-slate-400 block truncate font-mono">Data Science Lab</span>
          </button>
        </div>
      </div>

      {/* Manual Login Form */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-5">
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Workstation</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          New researcher?{' '}
          <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-semibold">
            Create Custom Account
          </Link>
        </div>
      </div>
    </div>
  );
};
