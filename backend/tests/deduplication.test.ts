import { describe, it, expect } from 'vitest';
import { deduplicationService } from '../src/services/research/deduplication.service';

describe('DeduplicationService Tests', () => {
  it('should eliminate duplicate papers with exact or near-identical titles', () => {
    const candidatePapers = [
      {
        title: 'Deep Research: Autonomous Research Agents Survey',
        doi: '10.1016/j.deepres.2024.01',
        source: 'arXiv',
      },
      {
        title: 'Deep Research: Autonomous Research Agents Survey',
        doi: '10.1016/j.deepres.2024.01',
        source: 'Semantic Scholar',
      },
      {
        title: 'Deep Research: Autonomous Research Agents Survey!',
        source: 'OpenAlex',
      },
      {
        title: 'An Evidence Grounded Framework for AI Research',
        doi: '10.1016/j.evidence.2024.02',
        source: 'Crossref',
      },
    ];

    const deduplicated = deduplicationService.deduplicate(candidatePapers);

    expect(deduplicated.length).toBe(2);
    expect(deduplicated[0].title).toBe('Deep Research: Autonomous Research Agents Survey');
    expect(deduplicated[1].title).toBe('An Evidence Grounded Framework for AI Research');
  });
});
