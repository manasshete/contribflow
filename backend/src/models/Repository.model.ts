import { Schema, model, Document } from 'mongoose';

export interface RepositoryDocument extends Document {
  owner: string;
  repo: string;
  url: string;
  metadata: {
    description: string | null;
    stars: number;
    forks: number;
    primaryLanguage: string | null;
    openIssuesCount: number;
    topics: string[];
    license: string | null;
    defaultBranch: string;
    updatedAt: Date;
  };
  lastFetchedAt: Date;
  createdAt: Date;
}

const repositorySchema = new Schema<RepositoryDocument>({
  owner: { type: String, required: true, index: true },
  repo: { type: String, required: true, index: true },
  url: { type: String, required: true },
  metadata: {
    description: { type: String, default: null },
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    primaryLanguage: { type: String, default: null },
    openIssuesCount: { type: Number, default: 0 },
    topics: { type: [String], default: [] },
    license: { type: String, default: null },
    defaultBranch: { type: String, default: 'main' },
    updatedAt: { type: Date },
  },
  lastFetchedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

repositorySchema.index({ owner: 1, repo: 1 }, { unique: true });

export const RepositoryModel = model<RepositoryDocument>('Repository', repositorySchema);
