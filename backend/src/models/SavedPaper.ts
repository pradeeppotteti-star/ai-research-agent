import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedPaperDocument extends Document {
  userId: mongoose.Types.ObjectId;
  paperId: mongoose.Types.ObjectId;
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SavedPaperSchema = new Schema<ISavedPaperDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    paperId: { type: Schema.Types.ObjectId, ref: 'Paper', required: true, index: true },
    notes: { type: String, default: '' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

SavedPaperSchema.index({ userId: 1, paperId: 1 }, { unique: true });

export const SavedPaper = mongoose.model<ISavedPaperDocument>('SavedPaper', SavedPaperSchema);
