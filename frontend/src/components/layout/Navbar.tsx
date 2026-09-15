import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ProjectSummaryModal } from '../common/ProjectSummaryModal';
import {
  BrainCircuit,
  LayoutDashboard,
  Search,
  History,
  Bookmark,
  GitCompare,
  LogOut,
  ShieldCheck,
  FlaskConical,
  GraduationCap,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const getRoleBadge = (role?: string) => {
    if (!role) return null;
    if (role.includes('Admin') || role.includes('Lead')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20">
          <ShieldCheck className="w-3 h-3 text-brand-600 dark:text-brand-400" /> Admin
        </span>
      );
    }
    if (role.includes('Reviewer') || role.includes('Tester')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
          <FlaskConical className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> Reviewer
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
        <GraduationCap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Scholar
      </span>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-brand-500/10 dark:bg-slate-900 border border-brand-500/20 dark:border-slate-800 flex items-center justify-center text-brand-600 dark:text-blue-400 group-hover:border-brand-500/40 transition-colors">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white font-sans">
                  AI Smart Research Agent
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                  v1.0
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block font-mono">
                Evidence-Grounded Multi-Source Literature Survey Synthesis
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Button (Light/Dark Mode) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
              title={theme === 'dark' ? 'Switch to Academic Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Project Executive Summary Button */}
            <button
              onClick={() => setIsSummaryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20 hover:bg-brand-500/20 transition-all"
              title="View Executive Project Synthesis Summary"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span className="hidden sm:inline">Project Summary</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <nav className="flex items-center gap-1">
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive('/dashboard')
                        ? 'bg-slate-100 dark:bg-slate-900 text-brand-600 dark:text-blue-400 border border-slate-200 dark:border-slate-800'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Dashboard</span>
                  </Link>

                  <Link
                    to="/research/new"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                      isActive('/research/new')
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-900 text-white dark:bg-slate-900 dark:text-slate-200 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>New Query</span>
                  </Link>

                  <Link
                    to="/history"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive('/history')
                        ? 'bg-slate-100 dark:bg-slate-900 text-brand-600 dark:text-blue-400 border border-slate-200 dark:border-slate-800'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">History</span>
                  </Link>

                  <Link
                    to="/saved-papers"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive('/saved-papers')
                        ? 'bg-slate-100 dark:bg-slate-900 text-brand-600 dark:text-blue-400 border border-slate-200 dark:border-slate-800'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Saved Papers</span>
                  </Link>

                  <Link
                    to="/research/compare"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive('/research/compare')
                        ? 'bg-slate-100 dark:bg-slate-900 text-brand-600 dark:text-blue-400 border border-slate-200 dark:border-slate-800'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Survey Matrix</span>
                  </Link>
                </nav>

                <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

                <div className="flex items-center gap-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    title="Profile & Preferences"
                  >
                    <div className="w-5 h-5 rounded bg-brand-500 text-white text-[11px] font-extrabold flex items-center justify-center">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
                        {user.name.split(' ')[0]}
                      </span>
                      <span className="mt-0.5">{getRoleBadge(user.role)}</span>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white transition-all shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Executive Project Summary Modal */}
      <ProjectSummaryModal isOpen={isSummaryOpen} onClose={() => setIsSummaryOpen(false)} />
    </>
  );
};

