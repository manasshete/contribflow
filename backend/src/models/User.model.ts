import { Schema, model, Document } from 'mongoose';

export interface UserDocument extends Document {
  githubId: number;
  login: string;
  name: string | null;
  avatarUrl: string;
  accessTokenEncrypted: string;
  scopes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>({
  githubId: { type: Number, required: true, unique: true, index: true },
  login: { type: String, required: true },
  name: { type: String, default: null },
  avatarUrl: { type: String, required: true },
  accessTokenEncrypted: { type: String, required: true },
  scopes: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const UserModel = model<UserDocument>('User', userSchema);
