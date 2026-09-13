import { Paper } from '@research-agent/shared';

export interface SearchOptions {
  limit?: number;
  yearStart?: number;
  yearEnd?: number;
  domain?: string;
}

export interface ResearchProvider {
  name: string;
  search(query: string, options?: SearchOptions): Promise<Partial<Paper>[]>;
  getPaperDetails(externalId: string): Promise<Partial<Paper> | null>;
}
