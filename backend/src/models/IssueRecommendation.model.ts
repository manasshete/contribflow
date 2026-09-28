import { Schema, model, Document, Types } from 'mongoose';

export interface RecommendationEntry {
  issueId: Types.ObjectId;
  issueNumber: number;
  matchScore: number;
  ruleScore: number;
  llmScore: number;
  difficulty: string;
  estimatedTime: string;
  requiredSkills: string[];
  matchingSkills: string[];
  reason: string;
  risk: string;
  relevantFiles: string[];
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

const issueRecommendationSchema = new Schema<IssueRecommendationDocument>({
  sessionId: { type: String, required: true, index: true },
  repositoryId: { type: Schema.Types.ObjectId, ref: 'Repository', required: true },
  developerProfile: {
    skills: { type: [String], default: [] },
    experience: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    availableHours: { type: Number, required: true },
  },
  recommendations: [
    {
      issueId: { type: Schema.Types.ObjectId, ref: 'Issue' },
      issueNumber: Number,
      matchScore: Number,
      ruleScore: Number,
      llmScore: Number,
      difficulty: String,
      estimatedTime: String,
      requiredSkills: [String],
      matchingSkills: [String],
      reason: String,
      risk: String,
      relevantFiles: [String],
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export const IssueRecommendationModel = model<IssueRecommendationDocument>(
  'IssueRecommendation',
  issueRecommendationSchema
);
