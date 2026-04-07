import mongoose, { Schema, Document } from 'mongoose';
import type { TrainingMode, Sport } from '../types';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  profile: {
    firstName: string;
    lastName: string;
    age?: number;
    weightKg?: number;
    heightCm?: number;
    sport: Sport;
    trainingMode: TrainingMode;
    avatarUrl?: string;
  };
  settings: {
    units: 'metric' | 'imperial';
    notifications: boolean;
    weekStartsOn: 'monday' | 'sunday';
  };
  connectedSources: {
    appleHealth: boolean;
    whoop: {
      connected: boolean;
      accessToken?: string;
      refreshToken?: string;
      tokenExpiresAt?: Date;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    profile: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      age: Number,
      weightKg: Number,
      heightCm: Number,
      sport: { type: String, enum: ['running', 'cycling', 'swimming', 'strength', 'crossfit', 'yoga', 'other'], default: 'other' },
      trainingMode: { type: String, enum: ['casual', 'professional', 'health'], default: 'casual' },
      avatarUrl: String,
    },
    settings: {
      units: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
      notifications: { type: Boolean, default: true },
      weekStartsOn: { type: String, enum: ['monday', 'sunday'], default: 'monday' },
    },
    connectedSources: {
      appleHealth: { type: Boolean, default: false },
      whoop: {
        connected: { type: Boolean, default: false },
        accessToken: String,
        refreshToken: String,
        tokenExpiresAt: Date,
      },
    },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
