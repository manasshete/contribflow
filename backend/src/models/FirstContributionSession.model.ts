import { Schema, model, Document, Types } from 'mongoose';
import { ExperienceLevel } from '../services/recommendation/rule.scorer';

export type ChecklistSection = 'understand' | 'implement' | 'verify' | 'pr-code' | 'pr-meta';

export interface ChecklistItem {
  id: string;
  section: ChecklistSection;
  label: string;
  done: boolean;
}

export interface FirstContributionSessionDocument extends Document {
  sessionId: string;
  repositoryId: Types.ObjectId;
  owner: string;
  repo: string;
  skills: string[];
  experience?: ExperienceLevel;
  availableHours?: number;
  preferredType?: string;
  selectedIssueNumber?: number;
  currentStep: number;
  completedSteps: number[];
  checklist: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const checklistItemSchema = new Schema<ChecklistItem>(
  {
    id: { type: String, required: true },
    section: { type: String, enum: ['understand', 'implement', 'verify', 'pr-code', 'pr-meta'], required: true },
    label: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { _id: false }
);

const firstContributionSessionSchema = new Schema<FirstContributionSessionDocument>({
  sessionId: { type: String, required: true, index: true },
  repositoryId: { type: Schema.Types.ObjectId, ref: 'Repository', required: true },
  owner: { type: String, required: true },
  repo: { type: String, required: true },
  skills: { type: [String], default: [] },
  experience: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  availableHours: Number,
  preferredType: String,
  selectedIssueNumber: Number,
  currentStep: { type: Number, default: 1 },
  completedSteps: { type: [Number], default: [] },
  checklist: { type: [checklistItemSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

firstContributionSessionSchema.index({ sessionId: 1, repositoryId: 1 }, { unique: true });

export const FirstContributionSessionModel = model<FirstContributionSessionDocument>(
  'FirstContributionSession',
  firstContributionSessionSchema
);
