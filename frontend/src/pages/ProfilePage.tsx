import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Building, Mail, Sparkles, Layers, Sliders, Check } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUserPreferences } = useAuth();

  const [name, setName] = useState<string>(user?.name || '');
  const [institution, setInstitution] = useState<string>(user?.institution || '');
  const [researchInterests, setResearchInterests] = useState<string>(
    user?.preferences?.researchInterests?.join(', ') || 'Autonomous AI Agents, LLM Factuality'
  );
  const [preferredDomains, setPreferredDomains] = useState<string>(
    user?.preferences?.preferredDomains?.join(', ') || 'Computer Science, Artificial Intelligence'
  );
  const [defaultPaperCount, setDefaultPaperCount] = useState<number>(
    user?.preferences?.defaultPaperCount || 5
  );

  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const interestsList = researchInterests.split(',').map((s) => s.trim()).filter(Boolean);
      const domainsList = preferredDomains.split(',').map((s) => s.trim()).filter(Boolean);

      const updatedPrefs = {
        researchInterests: interestsList,
        preferredDomains: domainsList,
        defaultPaperCount,
      };

      const res = await api.put('/user/profile', {
        name,
        institution,
        preferences: updatedPrefs,
      });

      if (res.data.success) {
        updateUserPreferences(updatedPrefs);
        setSuccessMsg('Profile preferences successfully saved.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err: any) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">Researcher Profile & Preferences</h1>
        <p className="text-sm text-slate-400 mt-1">
          Customize agent defaults and personalized domain interests.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2 font-semibold">
            <Check className="w-5 h-5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-900 text-slate-500 text-sm cursor-not-allowed font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Academic Institution / Organization</span>
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-800/80 space-y-5">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-brand-400">
              Personalization & Agent Defaults
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                <span>Primary Research Interests (Comma-separated)</span>
              </label>
              <input
                type="text"
                value={researchInterests}
                onChange={(e) => setResearchInterests(e.target.value)}
                placeholder="Autonomous Agents, Grounded AI..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Preferred Academic Domains</span>
              </label>
              <input
                type="text"
                value={preferredDomains}
                onChange={(e) => setPreferredDomains(e.target.value)}
                placeholder="Computer Science, Artificial Intelligence..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <span>Default Paper Count Target</span>
                </label>
                <span className="text-xs font-mono font-bold text-brand-400 px-2 py-0.5 rounded bg-brand-500/10">
                  {defaultPaperCount} Papers
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={12}
                value={defaultPaperCount}
                onChange={(e) => setDefaultPaperCount(parseInt(e.target.value, 10))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
          >
            {saving ? <span>Updating Preferences...</span> : <span>Save Preferences</span>}
          </button>
        </form>
      </div>
    </div>
  );
};
