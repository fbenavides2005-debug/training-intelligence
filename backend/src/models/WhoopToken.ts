import mongoose, { Schema, Document } from 'mongoose';

export interface IWhoopToken extends Document {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  updatedAt: Date;
}

const WhoopTokenSchema = new Schema<IWhoopToken>(
  {
    access_token: { type: String, required: true },
    refresh_token: { type: String },
    expires_at: { type: Number, required: true },
  },
  { timestamps: true }
);

export const WhoopToken = mongoose.model<IWhoopToken>('WhoopToken', WhoopTokenSchema);
