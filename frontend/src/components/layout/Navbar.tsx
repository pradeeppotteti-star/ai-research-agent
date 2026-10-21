import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
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
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/10 text-amber-800 border border-amber-500/20">
          <ShieldCheck className="w-3 h-3 text-amber-700" /> Admin
        </span>
      );
    }
    if (role.includes('Reviewer') || role.includes('Tester')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#EEF2FF] text-[#1E3A8A] border border-[#1E3A8A]/20">
          <FlaskConical className="w-3 h-3 text-[#1E3A8A]" /> Reviewer
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
        <GraduationCap className="w-3 h-3 text-emerald-700" /> Scholar
      </span>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] border border-[#E8E2D8] flex items-center justify-center text-[#1E3A8A] transition-colors">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs sm:text-sm md:text-base tracking-tight text-[#1E1C1A] font-sans">
                  AI Powered Research Paper Analysis and Recommendation System
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F5F1EA] text-[#766E65] border border-[#E8E2D8]">
                  v1.0
                </span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {/* Project Executive Summary Button */}
            <button
              onClick={() => setIsSummaryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F5F1EA] text-[#1E3A8A] border border-[#E8E2D8] hover:bg-[#EBE5DC] transition-colors"
              title="View Executive Project Synthesis Summary"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span className="hidden sm:inline">Project Summary</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <nav className="flex items-center gap-1">
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive('/dashboard')
                        ? 'bg-[#EEF2FF] text-[#1E3A8A] border border-[#C7D2FE]'
                        : 'text-[#5C554E] hover:text-[#1E1C1A] hover:bg-[#F5F1EA]'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Dashboard</span>
                  </Link>

                  <Link
                    to="/research/new"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      isActive('/research/new')
                        ? 'bg-[#1E3A8A] text-white shadow-sm'
                        : 'bg-[#1E3A8A] text-white hover:bg-[#172E6F] shadow-sm'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>New Query</span>
                  </Link>

                  <Link
                    to="/history"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive('/history')
                        ? 'bg-[#EEF2FF] text-[#1E3A8A] border border-[#C7D2FE]'
                        : 'text-[#5C554E] hover:text-[#1E1C1A] hover:bg-[#F5F1EA]'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">History</span>
                  </Link>

                  <Link
                    to="/saved-papers"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive('/saved-papers')
                        ? 'bg-[#EEF2FF] text-[#1E3A8A] border border-[#C7D2FE]'
                        : 'text-[#5C554E] hover:text-[#1E1C1A] hover:bg-[#F5F1EA]'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Saved Papers</span>
                  </Link>

                  <Link
                    to="/research/compare"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive('/research/compare')
                        ? 'bg-[#EEF2FF] text-[#1E3A8A] border border-[#C7D2FE]'
                        : 'text-[#5C554E] hover:text-[#1E1C1A] hover:bg-[#F5F1EA]'
                    }`}
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Survey Matrix</span>
                  </Link>
                </nav>

                <div className="h-5 w-[1px] bg-[#E8E2D8] mx-1 hidden sm:block" />

                <div className="flex items-center gap-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-[#E8E2D8] hover:bg-[#F5F1EA] transition-colors"
                    title="Profile & Preferences"
                  >
                    <div className="w-5 h-5 rounded bg-[#1E3A8A] text-white text-[11px] font-extrabold flex items-center justify-center">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-xs font-bold text-[#1E1C1A] leading-none">
                        {user.name.split(' ')[0]}
                      </span>
                      <span className="mt-0.5">{getRoleBadge(user.role)}</span>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-[#766E65] hover:text-[#991B1B] hover:bg-red-50 transition-colors"
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
                  className="text-xs font-bold text-[#1E1C1A] hover:text-[#1E3A8A] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#1E3A8A] hover:bg-[#172E6F] transition-colors shadow-sm"
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
