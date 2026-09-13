import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { SavedPaper } from '@research-agent/shared';
import { PaperCard } from '../components/common/PaperCard';
import { Bookmark, Search } from 'lucide-react';

export const SavedPapersPage: React.FC = () => {
  const [savedPapers, setSavedPapers] = useState<SavedPaper[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await api.get('/papers/saved');
        if (res.data.success) {
          setSavedPapers(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching saved papers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  const handleSaveToggle = (paperId: string, nowSaved: boolean) => {
    if (!nowSaved) {
      setSavedPapers(savedPapers.filter((sp) => (sp.paper?.id || (sp.paper as any)?._id) !== paperId));
    }
  };

  const filteredPapers = savedPapers.filter(
    (sp) =>
      sp.paper?.title.toLowerCase().includes(filter.toLowerCase()) ||
      sp.paper?.abstract.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Bookmark className="w-4 h-4" /> Personal Library
          </div>
          <h1 className="text-3xl font-black text-white">Saved Papers Library</h1>
          <p className="text-sm text-slate-400 mt-1">
            Bookmarked literature collected across research sessions.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search saved titles or abstract..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading saved papers...</div>
      ) : filteredPapers.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center text-slate-400">
          No saved papers found in your personal library.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPapers.map((sp) => (
            <PaperCard
              key={sp.id}
              paper={sp.paper!}
              isSaved={true}
              onSaveToggle={handleSaveToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};
