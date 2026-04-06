const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const config = {
  port: process.env.PORT || 3000,
  whoop: {
    clientId: process.env.WHOOP_CLIENT_ID,
    clientSecret: process.env.WHOOP_CLIENT_SECRET,
    redirectUri: process.env.WHOOP_REDIRECT_URI || 'http://localhost:3000/api/whoop/callback',
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
};

// Validate required credentials on startup
if (!config.whoop.clientId || !config.whoop.clientSecret) {
  console.error('ERROR: WHOOP_CLIENT_ID and WHOOP_CLIENT_SECRET must be set in backend/.env');
  console.error('Copy .env.example to .env and fill in your WHOOP credentials.');
  process.exit(1);
}

module.exports = config;
