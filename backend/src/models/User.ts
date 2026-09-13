import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  institution?: string;
  preferences: {
    researchInterests: string[];
    preferredDomains: string[];
    preferredYearRange: {
      start: number;
      end: number;
    };
    defaultPaperCount: number;
    preferredSources: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'Researcher' },
    institution: { type: String, default: 'Academic Institution' },
    preferences: {
      researchInterests: { type: [String], default: ['Autonomous AI Agents', 'LLM Factuality', 'Multi-agent Systems'] },
      preferredDomains: { type: [String], default: ['Computer Science', 'Artificial Intelligence'] },
      preferredYearRange: {
        start: { type: Number, default: 2020 },
        end: { type: Number, default: 2026 },
      },
      defaultPaperCount: { type: Number, default: 5 },
      preferredSources: { type: [String], default: ['arXiv', 'Semantic Scholar', 'OpenAlex', 'Crossref'] },
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model<IUserDocument>('User', UserSchema);
