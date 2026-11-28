import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedPaperDocument extends Document<string> {
  _id: string;
  userId: string;
  paperId: string;
  paper?: any;
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SavedPaperSchema = new Schema<ISavedPaperDocument>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    userId: { type: String, ref: 'User', required: true, index: true },
    paperId: { type: String, ref: 'Paper', required: true, index: true },
    paper: { type: Schema.Types.Mixed },
    notes: { type: String, default: '' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

SavedPaperSchema.index({ userId: 1, paperId: 1 }, { unique: true });

export const SavedPaper = mongoose.model<ISavedPaperDocument>('SavedPaper', SavedPaperSchema);
