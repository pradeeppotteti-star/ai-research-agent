import React, { useState } from 'react';
import { Paper } from '@research-agent/shared';
import { Bookmark, FileText, Award, Lock, Unlock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
        className={`glass-card p-5 rounded-xl border relative transition-all cursor-pointer bg-white ${
          isSelected
            ? 'border-[#1E3A8A] bg-[#EEF2FF] shadow-sm'
            : 'border-[#E8E2D8] hover:border-[#D8D0C4]'
        }`}
        onClick={handlePaperClick}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EEF2FF] text-[#1E3A8A] border border-[#C7D2FE]">
                {paper.source}
              </span>
              <span className="text-xs text-[#766E65] font-mono font-medium">{paper.publicationDate}</span>
              {paper.openAccess ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                  <Unlock className="w-3 h-3 text-emerald-600" /> Open Access
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-bold">
                  <Lock className="w-3 h-3 text-amber-600" /> Metadata Only
                </span>
              )}
              {paper.relevanceScore && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <Award className="w-3.5 h-3.5 text-emerald-600" /> Score: {Math.round(paper.relevanceScore * 100)}%
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-[#1E1C1A] hover:text-[#1E3A8A] transition-colors line-clamp-2">
              {paper.title}
            </h3>

            <p className="text-xs text-[#766E65] mt-1 font-semibold">
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
                className="w-5 h-5 rounded border-[#E8E2D8] bg-white text-[#1E3A8A] focus:ring-[#1E3A8A] cursor-pointer"
              />
            )}
            <button
              onClick={handleSaveClick}
              disabled={loading}
              className={`p-2 rounded-lg border transition-all ${
                saved
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                  : 'bg-[#F5F1EA] text-[#766E65] border-[#E8E2D8] hover:text-[#1E1C1A]'
              }`}
              title={saved ? 'Remove from Saved' : 'Save Paper'}
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-xs text-[#5C554E] line-clamp-3 leading-relaxed mb-4 font-sans">{paper.abstract}</p>

        <div className="flex items-center justify-between pt-3 border-t border-[#E8E2D8] text-xs">
          <span className="font-bold text-[#1E3A8A] hover:text-[#172E6F] flex items-center gap-1">
            View Details & AI Summary →
          </span>

          <button
            onClick={handlePdfClick}
            className="text-[#1E1C1A] hover:text-[#1E3A8A] font-bold flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F5F1EA] border border-[#E8E2D8] hover:bg-[#EBE5DC]"
          >
            <FileText className="w-3.5 h-3.5 text-[#1E3A8A]" /> PDF Reader
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
