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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F1EA] border border-[#E8E2D8] text-[#5C554E] text-xs font-semibold">
          <BrainCircuit className="w-4 h-4 text-[#1E3A8A]" />
          <span>Academic Portal Authentication</span>
        </div>
        <h1 className="text-3xl font-black text-[#1E1C1A] tracking-tight">Researcher Sign In</h1>
        <p className="text-sm text-[#5C554E] max-w-md mx-auto">
          Access your research history, citation verification graph, and literature survey reports.
        </p>
      </div>

      {/* 1-Click Demo Testing Accounts */}
      <div className="glass-panel p-5 rounded-xl border border-[#E8E2D8] bg-[#F5F1EA] space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
            <Sparkles className="w-4 h-4 text-[#1E3A8A]" />
            <span>Select 1-Click Testing Account</span>
          </div>
          <span className="text-[11px] font-mono text-[#766E65]">Pre-seeded Profiles</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Admin Demo */}
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('admin@research-agent.org', 'adminPassword123')}
            disabled={loading}
            className="p-3.5 rounded-xl bg-white border border-[#E8E2D8] hover:border-[#1E3A8A]/50 text-left transition-all group shadow-sm"
          >
            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Admin / Lead</span>
            </div>
            <span className="text-xs font-bold text-[#1E1C1A] block truncate group-hover:text-[#1E3A8A]">
              Shaik Fazullah
            </span>
            <span className="text-[10px] text-[#766E65] block truncate font-mono">Lead AI Researcher</span>
          </button>

          {/* Tester / Peer Reviewer Demo */}
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('tester@academic.org', 'testerPassword123')}
            disabled={loading}
            className="p-3.5 rounded-xl bg-white border border-[#E8E2D8] hover:border-[#1E3A8A]/50 text-left transition-all group shadow-sm"
          >
            <div className="flex items-center gap-2 text-[#1E3A8A] font-bold text-xs mb-1">
              <FlaskConical className="w-4 h-4" />
              <span>Peer Reviewer</span>
            </div>
            <span className="text-xs font-bold text-[#1E1C1A] block truncate group-hover:text-[#1E3A8A]">
              Potteti Pradeep
            </span>
            <span className="text-[10px] text-[#766E65] block truncate font-mono">Peer Reviewer Lab</span>
          </button>

          {/* Student Scholar Demo */}
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('student@university.edu', 'studentPassword123')}
            disabled={loading}
            className="p-3.5 rounded-xl bg-white border border-[#E8E2D8] hover:border-[#1E3A8A]/50 text-left transition-all group shadow-sm"
          >
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>Research Scholar</span>
            </div>
            <span className="text-xs font-bold text-[#1E1C1A] block truncate group-hover:text-[#1E3A8A]">
              Puli Prabhas
            </span>
            <span className="text-[10px] text-[#766E65] block truncate font-mono">Data Science Lab</span>
          </button>
        </div>
      </div>

      {/* Manual Login Form */}
      <div className="glass-panel p-8 rounded-xl border border-[#E8E2D8] shadow-sm space-y-5 bg-white">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#1E1C1A] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#948B80] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E8E2D8] text-[#1E1C1A] text-sm focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] transition-all font-mono placeholder-[#948B80]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#1E1C1A] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#948B80] absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E8E2D8] text-[#1E1C1A] text-sm focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] transition-all placeholder-[#948B80]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white bg-[#1E3A8A] hover:bg-[#172E6F] transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
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

        <div className="text-center text-xs text-[#766E65] pt-2 border-t border-[#E8E2D8]">
          New researcher?{' '}
          <Link to="/signup" className="text-[#1E3A8A] hover:underline font-semibold">
            Create Custom Account
          </Link>
        </div>
      </div>
    </div>
  );
};
