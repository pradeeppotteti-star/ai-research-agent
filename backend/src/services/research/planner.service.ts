import { ResearchPlan } from '@research-agent/shared';

export class PlannerService {
  async createPlan(query: string, domain?: string, keywords?: string[]): Promise<ResearchPlan> {
    const cleanQuery = query.trim();
    const primaryDomain = domain || this.inferDomain(cleanQuery);
    const extractedKeywords = keywords && keywords.length > 0
      ? keywords
      : this.extractKeywords(cleanQuery);

    const decomposedQuestions = [
      `What are the core foundational architectures and methodologies addressing ${cleanQuery}?`,
      `How do recent state-of-the-art approaches evaluate and benchmark performance for ${cleanQuery}?`,
      `What empirical limitations, computational bottlenecks, or unaddressed research gaps exist in ${cleanQuery}?`,
      `What are the future directions and actionable research opportunities in ${cleanQuery}?`,
    ];

    const searchStrategy = `Multi-provider querying across arXiv, Semantic Scholar, OpenAlex, and Crossref focusing on peer-reviewed papers between 2020-2026 within ${primaryDomain}.`;

    return {
      originalQuery: cleanQuery,
      decomposedQuestions,
      targetDomains: [primaryDomain, 'Artificial Intelligence', 'Computer Science'],
      extractedKeywords,
      searchStrategy,
    };
  }

  private inferDomain(query: string): string {
    const q = query.toLowerCase();
    if (q.includes('agent') || q.includes('llm') || q.includes('ai') || q.includes('model')) {
      return 'Artificial Intelligence & Multi-Agent Systems';
    }
    if (q.includes('medical') || q.includes('bio') || q.includes('clinical') || q.includes('health')) {
      return 'Bioinformatics & Medical AI';
    }
    if (q.includes('robot') || q.includes('control') || q.includes('vision')) {
      return 'Robotics & Computer Vision';
    }
    return 'Computer Science';
  }

  private extractKeywords(query: string): string[] {
    const stopWords = new Set([
      'what', 'are', 'the', 'latest', 'approaches', 'for', 'in', 'on', 'of', 'and',
      'a', 'an', 'to', 'how', 'do', 'does', 'is', 'with', 'by', 'from', 'using', 'based'
    ]);
    const tokens = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    const keywords = tokens.filter((t) => t.length > 2 && !stopWords.has(t));
    return keywords.length > 0 ? keywords : ['AI Research', 'Autonomous Systems'];
  }
}

export const plannerService = new PlannerService();
