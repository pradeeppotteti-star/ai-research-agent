export type VerificationStatus = 'supported' | 'inferred' | 'uncertain';

export type PipelineStage =
  | 'planning'
  | 'searching'
  | 'filtering'
  | 'extracting'
  | 'verifying'
  | 'comparing'
  | 'gap_detection'
  | 'synthesizing'
  | 'completed'
  | 'failed';

export interface UserPreferences {
  researchInterests: string[];
  preferredDomains: string[];
  preferredYearRange: {
    start: number;
    end: number;
  };
  defaultPaperCount: number;
  preferredSources: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: string;
  institution?: string;
  preferences: UserPreferences;
  createdAt: string;
}

export interface ExtractedSection {
  title: string;
  content: string;
  type: 'abstract' | 'introduction' | 'methodology' | 'experiments' | 'results' | 'discussion' | 'conclusion' | 'other';
}

export interface FigureOrTable {
  id: string;
  type: 'figure' | 'table';
  caption: string;
  contentOrUrl?: string;
  csvData?: string;
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  publicationDate: string;
  venue?: string;
  doi?: string;
  urls: {
    primary?: string;
    pdf?: string;
    publisher?: string;
  };
  source: 'arXiv' | 'Google Scholar' | 'Semantic Scholar' | 'OpenAlex' | 'Crossref' | 'Other';
  citationCount?: number;
  pdfAvailable: boolean;
  openAccess: boolean;
  keywords: string[];
  extractedSections?: ExtractedSection[];
  figuresAndTables?: FigureOrTable[];
  relevanceScore?: number;
  createdAt: string;
}

export interface EvidenceItem {
  claim: string;
  sourcePaperId: string;
  sourcePaperTitle: string;
  sourceSection: string;
  evidenceText: string;
  confidence: number; // 0 to 1
  verificationStatus: VerificationStatus;
}

export interface CandidateResearchGap {
  id: string;
  gap: string;
  supportingPaperIds: string[];
  supportingPaperTitles: string[];
  evidence: string[];
  whyUnderexplored: string;
  possibleResearchDirection: string;
}

export interface PaperComparisonItem {
  paperId: string;
  paperTitle: string;
  authors: string[];
  year: number;
  researchProblem: string;
  methodology: string;
  modelArchitecture: string;
  datasetUsed: string;
  evaluationMetrics: string;
  keyResults: string;
  strengths: string;
  limitations: string;
  futureWork: string;
}

export interface ConsensusItem {
  topic: string;
  consensusScorePct: number; // e.g. 85
  supportingPapersCount: number;
  contrastingPapersCount: number;
  consensusSummary: string;
  contrastingViewpoint?: string;
}

export interface ConsensusAnalysis {
  overallFieldConsensusPct: number;
  consensusItems: ConsensusItem[];
}

export interface PeerReviewerFeedback {
  reviewerRole: 'Reviewer 1 (Methodology)' | 'Reviewer 2 (Novelty & Gaps)' | 'Reviewer 3 (Factuality Auditor)';
  score: number; // out of 10
  summary: string;
  strengths: string[];
  weaknesses: string[];
}

export interface PeerReviewPanel {
  overallDecision: 'Strong Accept' | 'Accept' | 'Weak Accept' | 'Borderline';
  overallScore: number; // out of 10
  reviewers: PeerReviewerFeedback[];
}

export interface TopicTrend {
  keyword: string;
  momentum: 'high_growth' | 'stable' | 'emerging' | 'declining';
  growthPct: number;
  historicalCounts: { year: number; paperCount: number }[];
}

export interface TemporalTrendForecast {
  projectedGrowthPct: number;
  emergingTopics: TopicTrend[];
  recommendation: string;
}

export interface LabAnnotation {
  id: string;
  userName: string;
  paperTitle: string;
  noteText: string;
  timestamp: string;
}

export interface SurveyReport {
  id: string;
  sessionId: string;
  title: string;
  sections: {
    researchQuestion: string;
    searchMethodology: string;
    sourcesSearched: string[];
    selectedPapersSummary: string;
    keyFindings: string;
    methodComparisonOverview: string;
    evidenceBackedSynthesis: string;
    researchGapsSummary: string;
    limitations: string;
    futureDirections: string;
    referencesList: Array<{
      citationNumber: number;
      paperId: string;
      title: string;
      authors: string[];
      venue?: string;
      year: string;
      doi?: string;
      url?: string;
    }>;
  };
  claims: EvidenceItem[];
  consensusAnalysis?: ConsensusAnalysis;
  peerReviewPanel?: PeerReviewPanel;
  trendForecast?: TemporalTrendForecast;
  createdAt: string;
}

export interface ProgressLog {
  timestamp: string;
  stage: PipelineStage;
  message: string;
  details?: Record<string, any>;
}

export interface ResearchPlan {
  originalQuery: string;
  decomposedQuestions: string[];
  targetDomains: string[];
  extractedKeywords: string[];
  searchStrategy: string;
}

export interface ResearchSession {
  id: string;
  userId: string;
  query: string;
  domain?: string;
  keywords: string[];
  targetPaperCount: number;
  yearRange: {
    start: number;
    end: number;
  };
  preferredSources: string[];
  status: 'active' | 'completed' | 'failed';
  currentStage: PipelineStage;
  stageProgressPercent: number;
  progressLogs: ProgressLog[];
  researchPlan?: ResearchPlan;
  selectedPaperIds: string[];
  selectedPapers?: Paper[];
  comparisonMatrix?: PaperComparisonItem[];
  researchGaps?: CandidateResearchGap[];
  consensusAnalysis?: ConsensusAnalysis;
  peerReviewPanel?: PeerReviewPanel;
  trendForecast?: TemporalTrendForecast;
  reportId?: string;
  report?: SurveyReport;
  createdAt: string;
  updatedAt: string;
}

export interface SavedPaper {
  id: string;
  userId: string;
  paperId: string;
  paper?: Paper;
  notes?: string;
  tags: string[];
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  code?: string;
  data?: T;
  error?: string;
}

export interface ResearchStats {
  totalSessions: number;
  completedSessions: number;
  totalSavedPapers: number;
  totalVerifiedClaims: number;
  favoriteDomains: string[];
}
