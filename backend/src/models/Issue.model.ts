import { Schema, model, Document, Types } from 'mongoose';

export interface IssueAnalysis {
  type: 'Bug' | 'Feature' | 'Documentation' | 'Refactor' | 'Testing' | 'Performance' | 'Security' | 'Maintenance' | 'Other';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: { min: number; max: number };
  requiredSkills: string[];
  likelyAffectedAreas: string[];
  requiresDeepKnowledge: boolean;
  suitableForBeginners: boolean;
  analyzedAt: Date;
}

export interface ContributionPlan {
  problem: string;
  whyItMatters: string;
  relevantFiles: { path: string; reason: string }[];
  implementationSteps: string[];
  potentialRisks: string[];
  testingStrategy: string;
  expectedResult: string;
  recentActivityInsight: string;
  generatedAt: Date;
}

export interface IssueDocument extends Document {
  repositoryId: Types.ObjectId;
  issueNumber: number;
  title: string;
  body: string | null;
  labels: string[];
  state: 'open' | 'closed';
  author: string | null;
  createdAt: Date;
  updatedAt: Date;
  commentCount: number;
  analysis?: IssueAnalysis;
  contributionPlan?: ContributionPlan;
}

// Defined as an explicit Schema (not an inline object literal) so Mongoose
// doesn't misparse the nested `type` field as the SchemaType discriminator
// for the `analysis` path itself.
const issueAnalysisSchema = new Schema<IssueAnalysis>(
  {
    type: {
      type: String,
      enum: ['Bug', 'Feature', 'Documentation', 'Refactor', 'Testing', 'Performance', 'Security', 'Maintenance', 'Other'],
      required: true,
    },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    estimatedHours: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    requiredSkills: { type: [String], default: [] },
    likelyAffectedAreas: { type: [String], default: [] },
    requiresDeepKnowledge: { type: Boolean, required: true },
    suitableForBeginners: { type: Boolean, required: true },
    analyzedAt: { type: Date, required: true },
  },
  { _id: false }
);

const contributionPlanSchema = new Schema<ContributionPlan>(
  {
    problem: { type: String, required: true },
    whyItMatters: { type: String, required: true },
    relevantFiles: [{ path: { type: String, required: true }, reason: { type: String, required: true } }],
    implementationSteps: { type: [String], default: [] },
    potentialRisks: { type: [String], default: [] },
    testingStrategy: { type: String, required: true },
    expectedResult: { type: String, required: true },
    recentActivityInsight: { type: String, required: true },
    generatedAt: { type: Date, required: true },
  },
  { _id: false }
);

const issueSchema = new Schema<IssueDocument>({
  repositoryId: { type: Schema.Types.ObjectId, ref: 'Repository', required: true, index: true },
  issueNumber: { type: Number, required: true },
  title: { type: String, required: true },
  body: { type: String, default: null },
  labels: { type: [String], default: [] },
  state: { type: String, enum: ['open', 'closed'], default: 'open' },
  author: { type: String, default: null },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  commentCount: { type: Number, default: 0 },
  analysis: { type: issueAnalysisSchema, default: undefined },
  contributionPlan: { type: contributionPlanSchema, default: undefined },
});

issueSchema.index({ repositoryId: 1, issueNumber: 1 }, { unique: true });

export const IssueModel = model<IssueDocument>('Issue', issueSchema);
