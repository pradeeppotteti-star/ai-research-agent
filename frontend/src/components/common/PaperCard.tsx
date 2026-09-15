import React, { useState } from 'react';
import { Paper } from '@research-agent/shared';
import { Bookmark, ExternalLink, FileText, Check, Award, Lock, Unlock, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { PaperPdfViewerModal } from './PaperPdfViewerModal';

interface PaperCardProps {
  paper: Paper;
  isSaved?: boolean;
  onSaveToggle?: (paperId: string, nowSaved: boolean) => void;
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: (paperId: string) => void;
}

export const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  isSaved = false,
  onSaveToggle,
  selectable = false,
  isSelected = false,
  onSelect,
}) => {
  const navigate = useNavigate();
  const [saved, setSaved] = useState<boolean>(isSaved);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);

  const paperId = paper.id || (paper as any)._id || `paper_${(paper.title || 'detail').toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 35)}`;

  const handlePaperClick = () => {
    navigate(`/papers/${encodeURIComponent(paperId)}`, { state: { paper } });
  };

  const handlePdfClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPdfModal(true);
  };

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLoading(true);
      if (saved) {
        await api.delete(`/papers/${encodeURIComponent(paperId)}/save`);
        setSaved(false);
        if (onSaveToggle) onSaveToggle(paperId, false);
      } else {
        await api.post(`/papers/${encodeURIComponent(paperId)}/save`, { tags: ['Research'] });
        setSaved(true);
        if (onSaveToggle) onSaveToggle(paperId, true);
      }
    } catch (err) {
      console.error('Error toggling paper save status:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`glass-card p-5 rounded-xl border relative transition-all cursor-pointer ${
          isSelected
            ? 'border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/10'
            : 'border-emerald-900/10 dark:border-slate-800 hover:border-emerald-500/30 dark:hover:border-emerald-500/30'
        }`}
        onClick={handlePaperClick}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                {paper.source}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-mono font-medium">{paper.publicationDate}</span>
              {paper.openAccess ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-800 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                  <Unlock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Open Access
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-amber-800 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold">
                  <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Metadata Only
                </span>
              )}
              {paper.relevanceScore && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Score: {Math.round(paper.relevanceScore * 100)}%
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors line-clamp-2">
              {paper.title}
            </h3>

            <p className="text-xs text-brand-700 dark:text-brand-300 mt-1 font-bold">
              By {paper.authors ? paper.authors.slice(0, 3).join(', ') : 'Author'}
              {paper.authors && paper.authors.length > 3 ? ' et al.' : ''} • {paper.venue || 'Academic Journal'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectable && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  if (onSelect) onSelect(paperId);
                }}
                className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
            )}
            <button
              onClick={handleSaveClick}
              disabled={loading}
              className={`p-2 rounded-lg border transition-all ${
                saved
                  ? 'bg-brand-600 text-white border-brand-500'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title={saved ? 'Remove from Saved' : 'Save Paper'}
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-3 leading-relaxed mb-4 font-sans">{paper.abstract}</p>

        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs">
          <span className="font-bold text-brand-700 dark:text-brand-400 hover:text-brand-800 flex items-center gap-1">
            View Details & AI Summary →
          </span>

          <button
            onClick={handlePdfClick}
            className="text-emerald-800 dark:text-emerald-400 hover:text-emerald-900 font-bold flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> PDF Reader
          </button>
        </div>
      </div>


      {/* Official In-App Scientific PDF Document Reader Modal */}
      <PaperPdfViewerModal
        paper={paper}
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
      />
    </>
  );
};
