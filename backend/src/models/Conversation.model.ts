import { Schema, model, Document, Types } from 'mongoose';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ConversationDocument extends Document {
  sessionId: string;
  repositoryId: Types.ObjectId;
  issueNumber: number;
  messages: ConversationMessage[];
  context: {
    repoSummary: string;
    issueTitle: string;
    relevantFiles: string[];
    architecture: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<ConversationDocument>({
  sessionId: { type: String, required: true, index: true },
  repositoryId: { type: Schema.Types.ObjectId, ref: 'Repository', required: true },
  issueNumber: { type: Number, required: true },
  messages: [
    {
      role: { type: String, enum: ['user', 'assistant'], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  context: {
    repoSummary: String,
    issueTitle: String,
    relevantFiles: [String],
    architecture: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

conversationSchema.index({ sessionId: 1, repositoryId: 1, issueNumber: 1 });

export const ConversationModel = model<ConversationDocument>('Conversation', conversationSchema);
