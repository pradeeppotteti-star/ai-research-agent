import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BrainCircuit, Sparkles, User, Mail, Lock, AlertCircle } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/signup', {
        name,
        email,
        password,
      });

      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] text-[#1E3A8A] flex items-center justify-center mx-auto mb-3 shadow-sm">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-[#1E1C1A]">Create Account</h1>
        <p className="text-sm text-[#5C554E] mt-1">
          Enter your details below to create your academic research account
        </p>
      </div>

      <div className="glass-panel p-8 rounded-xl border border-[#E8E2D8] shadow-sm bg-white">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#1E1C1A] mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#948B80] absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E8E2D8] text-[#1E1C1A] text-sm focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] transition-all placeholder-[#948B80]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#1E1C1A] mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#948B80] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E8E2D8] text-[#1E1C1A] text-sm focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] transition-all placeholder-[#948B80]"
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
            className="w-full py-3 rounded-xl font-bold text-white bg-[#1E3A8A] hover:bg-[#172E6F] shadow-sm transition-all flex items-center justify-center gap-2 border border-[#1E3A8A]"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#766E65]">
          Already registered?{' '}
          <Link to="/login" className="text-[#1E3A8A] hover:underline font-semibold">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
