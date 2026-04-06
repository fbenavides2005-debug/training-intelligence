require('dotenv').config();

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

module.exports = config;
