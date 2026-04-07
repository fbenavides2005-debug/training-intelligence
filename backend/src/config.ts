import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

function required(name: string): string {
  const val = process.env[name];
  if (!val) {
    console.error(`ERROR: Missing required env var ${name}. See .env.example`);
    process.exit(1);
  }
  return val;
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || 'development',

  mongodb: {
    uri: required('MONGODB_URI'),
  },

  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  whoop: {
    clientId: process.env.WHOOP_CLIENT_ID || '',
    clientSecret: process.env.WHOOP_CLIENT_SECRET || '',
    redirectUri:
      process.env.WHOOP_REDIRECT_URI ||
      'http://localhost:3000/api/whoop/callback',
    authUrl: 'https://api.prod.whoop.com/oauth/oauth2/auth',
    tokenUrl: 'https://api.prod.whoop.com/oauth/oauth2/token',
    apiBaseUrl: 'https://api.prod.whoop.com/developer',
    scopes: [
      'read:recovery',
      'read:cycles',
      'read:workout',
      'read:sleep',
      'read:profile',
      'read:body_measurement',
    ],
  },
} as const;
