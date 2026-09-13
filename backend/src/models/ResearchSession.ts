import mongoose, { Schema, Document } from 'mongoose';

export interface IResearchSessionDocument extends Document {
  userId: mongoose.Types.ObjectId;
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
  currentStage: string;
  stageProgressPercent: number;
  progressLogs: Array<{
    timestamp: string;
    stage: string;
    message: string;
    details?: any;
  }>;
  researchPlan?: {
    originalQuery: string;
    decomposedQuestions: string[];
    targetDomains: string[];
    extractedKeywords: string[];
    searchStrategy: string;
  };
  selectedPaperIds: mongoose.Types.ObjectId[];
  comparisonMatrix?: Array<{
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
  }>;
  researchGaps?: Array<{
    id: string;
    gap: string;
    supportingPaperIds: string[];
    supportingPaperTitles: string[];
    evidence: string[];
    whyUnderexplored: string;
    possibleResearchDirection: string;
  }>;
  reportId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ResearchSessionSchema = new Schema<IResearchSessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    query: { type: String, required: true },
    domain: { type: String, default: 'General Science' },
    keywords: { type: [String], default: [] },
    targetPaperCount: { type: Number, default: 5 },
    yearRange: {
      start: { type: Number, default: 2020 },
      end: { type: Number, default: 2026 },
    },
    preferredSources: { type: [String], default: ['arXiv', 'Semantic Scholar', 'OpenAlex', 'Crossref'] },
    status: { type: String, enum: ['active', 'completed', 'failed'], default: 'active' },
    currentStage: { type: String, default: 'planning' },
    stageProgressPercent: { type: Number, default: 0 },
    progressLogs: [
      {
        timestamp: String,
        stage: String,
        message: String,
        details: Schema.Types.Mixed,
      },
    ],
    researchPlan: {
      originalQuery: String,
      decomposedQuestions: [String],
      targetDomains: [String],
      extractedKeywords: [String],
      searchStrategy: String,
    },
    selectedPaperIds: [{ type: Schema.Types.ObjectId, ref: 'Paper' }],
    comparisonMatrix: [Schema.Types.Mixed],
    researchGaps: [Schema.Types.Mixed],
    reportId: { type: Schema.Types.ObjectId, ref: 'Report' },
  },
  { timestamps: true }
);

export const ResearchSession = mongoose.model<IResearchSessionDocument>(
  'ResearchSession',
  ResearchSessionSchema
);
