import mongoose, { Schema, Document } from 'mongoose';

export interface IPaperDocument extends Document {
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
  source: string;
  citationCount: number;
  pdfAvailable: boolean;
  openAccess: boolean;
  keywords: string[];
  extractedSections: Array<{
    title: string;
    content: string;
    type: string;
  }>;
  figuresAndTables: Array<{
    id: string;
    type: string;
    caption: string;
    contentOrUrl?: string;
  }>;
  relevanceScore?: number;
  externalId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaperSchema = new Schema<IPaperDocument>(
  {
    title: { type: String, required: true, index: true },
    authors: { type: [String], default: [] },
    abstract: { type: String, required: true },
    publicationDate: { type: String, default: '2024' },
    venue: { type: String, default: 'Academic Journal/Conference' },
    doi: { type: String, sparse: true },
    urls: {
      primary: String,
      pdf: String,
      publisher: String,
    },
    source: { type: String, required: true },
    citationCount: { type: Number, default: 0 },
    pdfAvailable: { type: Boolean, default: false },
    openAccess: { type: Boolean, default: false },
    keywords: { type: [String], default: [] },
    extractedSections: [
      {
        title: String,
        content: String,
        type: String,
      },
    ],
    figuresAndTables: [
      {
        id: String,
        type: String,
        caption: String,
        contentOrUrl: String,
      },
    ],
    relevanceScore: { type: Number, default: 0 },
    externalId: { type: String, index: true },
  },
  { timestamps: true }
);

PaperSchema.index({ title: 'text', abstract: 'text', keywords: 'text' });

export const Paper = mongoose.model<IPaperDocument>('Paper', PaperSchema);
