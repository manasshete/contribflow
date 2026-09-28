import { Schema, model, Document, Types } from 'mongoose';

export interface RecommendationEntry {
  issueId: Types.ObjectId;
  issueNumber: number;
  title: string;
  type: string;
  matchScore: number;
  issueHealth: number;
  difficulty: string;
  estimatedTime: string;
  requiredSkills: string[];
  matchingSkills: string[];
  reason: string;
  reasons: string[];
  risk: string;
  relevantFiles: string[];
  labels: string[];
}

export interface IssueRecommendationDocument extends Document {
  sessionId: string;
  repositoryId: Types.ObjectId;
  developerProfile: {
    skills: string[];
    experience: 'beginner' | 'intermediate' | 'advanced';
    availableHours: number;
  };
  recommendations: RecommendationEntry[];
  createdAt: Date;
}

// Defined as an explicit Schema (not an inline object literal) so Mongoose
// doesn't misparse the nested `type` field as the SchemaType discriminator
// for the `recommendations` array path itself (same pitfall as `analysis` on
// the Issue model).
const recommendationEntrySchema = new Schema<RecommendationEntry>(
  {
    issueId: { type: Schema.Types.ObjectId, ref: 'Issue' },
    issueNumber: Number,
    title: String,
    type: String,
    matchScore: Number,
    issueHealth: Number,
    difficulty: String,
    estimatedTime: String,
    requiredSkills: [String],
    matchingSkills: [String],
    reason: String,
    reasons: [String],
    risk: String,
    relevantFiles: [String],
    labels: [String],
  },
  { _id: false }
);

const issueRecommendationSchema = new Schema<IssueRecommendationDocument>({
  sessionId: { type: String, required: true, index: true },
  repositoryId: { type: Schema.Types.ObjectId, ref: 'Repository', required: true },
  developerProfile: {
    skills: { type: [String], default: [] },
    experience: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    availableHours: { type: Number, required: true },
  },
  recommendations: { type: [recommendationEntrySchema], default: [] },
  createdAt: { type: Date, default: Date.now, index: true },
});

export const IssueRecommendationModel = model<IssueRecommendationDocument>(
  'IssueRecommendation',
  issueRecommendationSchema
);
