import mongoose, { Schema, Document } from 'mongoose';

export interface IReportDocument extends Document {
  sessionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
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
  claims: Array<{
    claim: string;
    sourcePaperId: string;
    sourcePaperTitle: string;
    sourceSection: string;
    evidenceText: string;
    confidence: number;
    verificationStatus: 'supported' | 'inferred' | 'uncertain';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReportDocument>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'ResearchSession', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    sections: {
      researchQuestion: { type: String, required: true },
      searchMethodology: { type: String, required: true },
      sourcesSearched: { type: [String], default: [] },
      selectedPapersSummary: { type: String, required: true },
      keyFindings: { type: String, required: true },
      methodComparisonOverview: { type: String, required: true },
      evidenceBackedSynthesis: { type: String, required: true },
      researchGapsSummary: { type: String, required: true },
      limitations: { type: String, required: true },
      futureDirections: { type: String, required: true },
      referencesList: [Schema.Types.Mixed],
    },
    claims: [
      {
        claim: String,
        sourcePaperId: String,
        sourcePaperTitle: String,
        sourceSection: String,
        evidenceText: String,
        confidence: Number,
        verificationStatus: {
          type: String,
          enum: ['supported', 'inferred', 'uncertain'],
          default: 'supported',
        },
      },
    ],
  },
  { timestamps: true }
);

export const Report = mongoose.model<IReportDocument>('Report', ReportSchema);
