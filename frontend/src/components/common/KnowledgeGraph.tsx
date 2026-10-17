import React, { useState } from 'react';
import { Paper, EvidenceItem, CandidateResearchGap } from '@research-agent/shared';
import { FileText, CheckCircle2, HelpCircle, AlertTriangle, Compass, Info } from 'lucide-react';

interface KnowledgeGraphProps {
  papers: Paper[];
  claims: EvidenceItem[];
  gaps: CandidateResearchGap[];
}

interface NodeItem {
  id: string;
  type: 'paper' | 'claim_supported' | 'claim_inferred' | 'claim_uncertain' | 'gap';
  label: string;
  sublabel: string;
  details: string;
  connections: string[]; // Node IDs connected
  x: number;
  y: number;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ papers, claims, gaps }) => {
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(null);

  // Generate node graph layout
  const nodes: NodeItem[] = [];
  const links: Array<{ source: string; target: string; type: string }> = [];

  // Center radius calculations
  const centerX = 350;
  const centerY = 240;

  // Add Paper Nodes (Center circle)
  papers.forEach((p, idx) => {
    const angle = (idx / Math.max(1, papers.length)) * 2 * Math.PI;
    const radius = 110;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const nodeId = `paper-${p.id}`;

    nodes.push({
      id: nodeId,
      type: 'paper',
      label: p.title.length > 30 ? p.title.substring(0, 30) + '...' : p.title,
      sublabel: `${p.authors[0] || 'Author'} (${p.publicationDate})`,
      details: p.abstract,
      connections: [],
      x,
      y,
    });
  });

  // Add Claim Nodes (Outer ring)
  claims.forEach((c, idx) => {
    const angle = (idx / Math.max(1, claims.length)) * 2 * Math.PI + Math.PI / 4;
    const radius = 190;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const nodeId = `claim-${idx}`;

    const paperNodeId = `paper-${c.sourcePaperId}`;
    const claimType =
      c.verificationStatus === 'supported'
        ? 'claim_supported'
        : c.verificationStatus === 'inferred'
        ? 'claim_inferred'
        : 'claim_uncertain';

    nodes.push({
      id: nodeId,
      type: claimType,
      label: c.claim.length > 35 ? c.claim.substring(0, 35) + '...' : c.claim,
      sublabel: `Confidence: ${Math.round(c.confidence * 100)}% • ${c.sourceSection}`,
      details: `Claim: "${c.claim}"\n\nGrounding Snippet: "${c.evidenceText}"`,
      connections: [paperNodeId],
      x,
      y,
    });

    links.push({ source: paperNodeId, target: nodeId, type: c.verificationStatus });
  });

  // Add Gap Nodes
  gaps.forEach((g, idx) => {
    const nodeId = `gap-${g.id}`;
    const x = centerX + (idx % 2 === 0 ? -180 : 180);
    const y = centerY + (idx % 2 === 0 ? 160 : -160);

    const connectedPaperNodes = g.supportingPaperIds.map((pid) => `paper-${pid}`);

    nodes.push({
      id: nodeId,
      type: 'gap',
      label: g.gap.length > 30 ? g.gap.substring(0, 30) + '...' : g.gap,
      sublabel: `Actionable Direction Available`,
      details: `Candidate Gap: ${g.gap}\n\nWhy Underexplored: ${g.whyUnderexplored}\n\nDirection: ${g.possibleResearchDirection}`,
      connections: connectedPaperNodes,
      x,
      y,
    });

    connectedPaperNodes.forEach((pnode) => {
      links.push({ source: pnode, target: nodeId, type: 'gap' });
    });
  });

  const getNodeColor = (type: NodeItem['type']) => {
    switch (type) {
      case 'paper':
        return '#1E3A8A'; // Oxford Navy
      case 'claim_supported':
        return '#15803D'; // Emerald
      case 'claim_inferred':
        return '#D97706'; // Amber
      case 'claim_uncertain':
        return '#E11D48'; // Rose
      case 'gap':
        return '#7C3AED'; // Violet
    }
  };

  const isConnected = (nodeAId: string, nodeBId: string) => {
    return links.some(
      (l) =>
        (l.source === nodeAId && l.target === nodeBId) ||
        (l.source === nodeBId && l.target === nodeAId)
    );
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-[#E8E2D8] bg-white space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] font-mono">
            Interactive Knowledge Graph
          </span>
          <h3 className="text-xl font-black text-[#1E1C1A]">Citation & Evidence Topology</h3>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 text-[#1E3A8A]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A]" /> Literature Node
          </span>
          <span className="inline-flex items-center gap-1.5 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Supported Claim
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#B45309]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" /> Inferred Claim
          </span>
          <span className="inline-flex items-center gap-1.5 text-purple-700">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Candidate Gap
          </span>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative bg-[#F5F1EA] rounded-2xl border border-[#E8E2D8] overflow-hidden flex items-center justify-center min-h-[480px]">
        {/* Subtle cream architectural dot-grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#D8D0C4_1px,transparent_1px)] [background-size:18px_18px] opacity-70 pointer-events-none" />

        <svg viewBox="0 0 700 480" className="w-full h-full max-h-[500px] relative z-10">
          {/* Render Connections Links */}
          {links.map((link, idx) => {
            const sourceNode = nodes.find((n) => n.id === link.source);
            const targetNode = nodes.find((n) => n.id === link.target);

            if (!sourceNode || !targetNode) return null;

            const isHighlighted =
              selectedNode &&
              (selectedNode.id === sourceNode.id ||
                selectedNode.id === targetNode.id ||
                isConnected(selectedNode.id, sourceNode.id) ||
                isConnected(selectedNode.id, targetNode.id));

            return (
              <line
                key={idx}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={
                  link.type === 'supported'
                    ? '#15803D'
                    : link.type === 'gap'
                    ? '#7C3AED'
                    : link.type === 'inferred'
                    ? '#D97706'
                    : '#CBD5E1'
                }
                strokeWidth={isHighlighted ? 2.5 : 1.2}
                strokeOpacity={selectedNode ? (isHighlighted ? 0.95 : 0.2) : 0.55}
                strokeDasharray={link.type === 'gap' ? '4 4' : 'none'}
              />
            );
          })}

          {/* Render Graph Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const isRelated = selectedNode && (isConnected(selectedNode.id, node.id) || isSelected);

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer transition-transform duration-200 hover:scale-110"
              >
                <circle
                  r={node.type === 'paper' ? 18 : 14}
                  fill={getNodeColor(node.type)}
                  fillOpacity={selectedNode ? (isRelated ? 1 : 0.25) : 0.9}
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  className="transition-all shadow-sm"
                />

                <text
                  y={node.type === 'paper' ? 32 : 26}
                  textAnchor="middle"
                  fill={isSelected ? '#1E1C1A' : '#433E38'}
                  fontSize="10"
                  fontWeight={isSelected ? 'bold' : '600'}
                  className="pointer-events-none select-none font-sans"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Node Details Card */}
        {selectedNode && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 p-5 rounded-2xl border border-[#E8E2D8] backdrop-blur-md shadow-xl space-y-2 max-w-lg mx-auto z-20">
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${getNodeColor(selectedNode.type)}15`,
                  color: getNodeColor(selectedNode.type),
                  border: `1px solid ${getNodeColor(selectedNode.type)}40`,
                }}
              >
                {selectedNode.type.replace('_', ' ')}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-xs font-bold text-[#766E65] hover:text-[#1E1C1A] transition-colors"
              >
                Close ✕
              </button>
            </div>
            <h4 className="font-bold text-sm text-[#1E1C1A]">{selectedNode.label}</h4>
            <p className="text-xs text-[#433E38] font-mono line-clamp-3 leading-relaxed whitespace-pre-line">
              {selectedNode.details}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
