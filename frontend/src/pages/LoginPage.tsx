import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { authVault } from '../utils/authVault';
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
        await authVault.saveAccount({
          name: res.data.data.user.name,
          email: cleanEmail,
          password,
          institution: res.data.data.user.institution,
          role: res.data.data.user.role,
        });
        login(res.data.data.token, res.data.data.user);
        navigate('/dashboard');
        return;
      }
    } catch (err: any) {
      const status = err.response?.status;
      const code = err.response?.data?.code;
      const msg = err.response?.data?.message || '';

      // Check if user is registered in this browser's vault
      const cached = authVault.getAccount(cleanEmail);

      // Resilient serverless fallback: if container cold-started or password mismatch with vault
      if (status === 401 && cached) {
        const isMatch = await authVault.verifyPassword(cleanEmail, password);
        if (isMatch) {
          try {
            const syncRes = await api.post('/auth/sync', {
              name: cached.name,
              email: cleanEmail,
              password,
              updatePassword: true,
              institution: cached.institution,
              role: cached.role,
            });

            if (syncRes.data.success) {
              login(syncRes.data.data.token, syncRes.data.data.user);
              navigate('/dashboard');
              return;
            }
          } catch (syncErr: any) {
            console.error('Account sync error:', syncErr);
          }
        } else {
          setError('Incorrect password. Please verify your credentials and try again.');
          setLoading(false);
          return;
        }
      }

      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReset = async () => {
    if (!email || !password) {
      setError('Please enter both email and your desired password.');
      return;
    }
    setLoading(true);
    setError('');

    const cleanEmail = email.toLowerCase().trim();

    try {
      const res = await api.post('/auth/reset-password', {
        email: cleanEmail,
        newPassword: password,
      });

      if (res.data.success) {
        await authVault.saveAccount({
          name: res.data.data.user.name,
          email: cleanEmail,
          password,
          institution: res.data.data.user.institution,
          role: res.data.data.user.role,
        });
        login(res.data.data.token, res.data.data.user);
        navigate('/dashboard');
        return;
      }
    } catch (resetErr: any) {
      // If user wasn't in server db yet, auto-provision with this password
      try {
        const syncRes = await api.post('/auth/sync', {
          name: cleanEmail.split('@')[0],
          email: cleanEmail,
          password,
          updatePassword: true,
        });
        if (syncRes.data.success) {
          await authVault.saveAccount({
            name: syncRes.data.data.user.name,
            email: cleanEmail,
            password,
          });
          login(syncRes.data.data.token, syncRes.data.data.user);
          navigate('/dashboard');
          return;
        }
      } catch (e: any) {
        setError(resetErr.response?.data?.message || 'Password update failed. Please check details.');
      }
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
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm space-y-2.5">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
            {error.includes('Incorrect password') && (
              <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between text-xs">
                <span className="text-[#5C554E]">Want to set and sign in with this password?</span>
                <button
                  type="button"
                  onClick={handleQuickReset}
                  className="font-bold underline text-[#1E3A8A] hover:text-[#172E6F] transition-all ml-2"
                >
                  Reset & Sign In &rarr;
                </button>
              </div>
            )}
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
