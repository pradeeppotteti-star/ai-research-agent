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

    const cleanEmail = email.toLowerCase().trim();

    try {
      const res = await api.post('/auth/login', { email: cleanEmail, password });
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

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F1EA] border border-[#E8E2D8] text-[#5C554E] text-xs font-semibold">
          <BrainCircuit className="w-4 h-4 text-[#1E3A8A]" />
          <span>Academic Portal Authentication</span>
        </div>
        <h1 className="text-3xl font-black text-[#1E1C1A] tracking-tight">Researcher Sign In</h1>
        <p className="text-sm text-[#5C554E] max-w-sm mx-auto">
          Access your research history, citation verification graph, and literature survey reports.
        </p>
      </div>

      {/* Login Form */}
      <div className="glass-panel p-8 rounded-xl border border-[#E8E2D8] shadow-sm space-y-5 bg-white">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E8E2D8] text-[#1E1C1A] text-sm focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] transition-all font-mono placeholder-[#948B80]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white bg-[#1E3A8A] hover:bg-[#172E6F] shadow-sm transition-all flex items-center justify-center gap-2 border border-[#1E3A8A] mt-2"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Workstation</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#E8E2D8] text-center text-xs text-[#766E65]">
          New researcher?{' '}
          <Link to="/signup" className="text-[#1E3A8A] hover:underline font-semibold">
            Create Custom Account
          </Link>
        </div>
      </div>
    </div>
  );
};
