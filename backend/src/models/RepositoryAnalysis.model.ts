import { Schema, model, Document, Types } from 'mongoose';

export interface RepositoryAnalysisDocument extends Document {
  repositoryId: Types.ObjectId;
  owner: string;
  repo: string;
  summary: string;
  technologies: string[];
  architecture: {
    type: string;
    frontend?: string;
    backend?: string;
    database?: string;
    testing?: string;
  };
  importantFiles: { path: string; reason: string }[];
  contributionRequirements: string[];
  repoContext: string;
  health: 'good' | 'moderate' | 'poor';
  cachedAt: Date;
  expiresAt: Date;
}

const repositoryAnalysisSchema = new Schema<RepositoryAnalysisDocument>({
  repositoryId: { type: Schema.Types.ObjectId, ref: 'Repository', required: true, index: true },
  owner: { type: String, required: true },
  repo: { type: String, required: true },
  summary: { type: String, required: true },
  technologies: { type: [String], default: [] },
  architecture: {
    type: { type: String, required: true },
    frontend: String,
    backend: String,
    database: String,
    testing: String,
  },
  importantFiles: [{ path: String, reason: String }],
  contributionRequirements: { type: [String], default: [] },
  repoContext: { type: String, required: true },
  health: { type: String, enum: ['good', 'moderate', 'poor'], default: 'moderate' },
  cachedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

repositoryAnalysisSchema.index({ owner: 1, repo: 1 });
repositoryAnalysisSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RepositoryAnalysisModel = model<RepositoryAnalysisDocument>(
  'RepositoryAnalysis',
  repositoryAnalysisSchema
);
