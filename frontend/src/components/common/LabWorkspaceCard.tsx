import React, { useState } from 'react';
import { LabAnnotation } from '@research-agent/shared';
import { Users, MessageSquare, Plus, Send } from 'lucide-react';

interface LabWorkspaceCardProps {
  sessionTitle: string;
}

export const LabWorkspaceCard: React.FC<LabWorkspaceCardProps> = ({ sessionTitle }) => {
  const [annotations, setAnnotations] = useState<LabAnnotation[]>([
    {
      id: 'ann-1',
      userName: 'Shaik Fazullah (Admin)',
      paperTitle: 'Deep Research: A Survey of Autonomous Research Agents',
      noteText: 'Extracted Section 4.2 evidence anchors confirm a 34% hallucination reduction under verification graph checks.',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
    },
    {
      id: 'ann-2',
      userName: 'Potteti Pradeep (Peer Reviewer)',
      paperTitle: 'Factuality Verification & Citation Grounding',
      noteText: 'Please verify if the PDF table parser handles multi-column OCR captions cleanly.',
      timestamp: new Date(Date.now() - 1800000).toLocaleTimeString(),
    },
  ]);

  const [newNote, setNewNote] = useState('');
  const [newPaper, setNewPaper] = useState('Deep Research Survey');

  const handleAddAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const ann: LabAnnotation = {
      id: 'ann_' + Math.random().toString(36).substring(2, 7),
      userName: 'Puli Prabhas (Scholar)',
      paperTitle: newPaper,
      noteText: newNote.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    setAnnotations([ann, ...annotations]);
    setNewNote('');
  };

  return (
    <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Collaborative Lab Environment</span>
          </div>
          <h3 className="text-2xl font-black text-white">Team Research Annotations</h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>3 Active Lab Researchers Connected</span>
        </div>
      </div>

      {/* Add Annotation Form */}
      <form onSubmit={handleAddAnnotation} className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
        <span className="text-xs font-bold text-slate-300 block">Add Peer Margin Note / Citation Tag</span>
        <textarea
          rows={2}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Share an insight or flag a claim for team verification..."
          className="w-full p-3 rounded-xl bg-slate-950 border border-slate-900 text-slate-100 text-xs focus:outline-none focus:border-brand-500 font-sans"
        />
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={!newNote.trim()}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 inline-flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Post Annotation</span>
          </button>
        </div>
      </form>

      {/* Annotations List */}
      <div className="space-y-4">
        {annotations.map((ann) => (
          <div key={ann.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-brand-400">{ann.userName}</span>
              <span className="text-slate-500 font-mono">{ann.timestamp}</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 block font-semibold">
              Paper: {ann.paperTitle}
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-sans pt-1 border-t border-slate-900">
              "{ann.noteText}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
