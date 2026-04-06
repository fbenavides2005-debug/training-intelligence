const crypto = require('crypto');
const config = require('../config');

// In-memory token store (per user session).
// Replace with a database in production.
const tokenStore = new Map();

function buildAuthorizationUrl() {
  const state = crypto.randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    client_id: config.whoop.clientId,
    redirect_uri: config.whoop.redirectUri,
    response_type: 'code',
    scope: config.whoop.scopes.join(' '),
    state,
  });
  return {
    url: `${config.whoop.authUrl}?${params.toString()}`,
    state,
  };
}

async function exchangeCodeForToken(code) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: config.whoop.clientId,
    client_secret: config.whoop.clientSecret,
    redirect_uri: config.whoop.redirectUri,
  });

  const res = await fetch(config.whoop.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${error}`);
  }

  return res.json();
}

async function refreshAccessToken(refreshToken) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: config.whoop.clientId,
    client_secret: config.whoop.clientSecret,
  });

  const res = await fetch(config.whoop.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${error}`);
  }

  return res.json();
}

function storeTokens(userId, tokens) {
  tokenStore.set(userId, {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  });
}

function getTokens(userId) {
  return tokenStore.get(userId) || null;
}

async function getValidAccessToken(userId) {
  const tokens = getTokens(userId);
  if (!tokens) return null;

  // Refresh if token expires within 60 seconds
  if (tokens.expiresAt - Date.now() < 60_000) {
    const refreshed = await refreshAccessToken(tokens.refreshToken);
    storeTokens(userId, refreshed);
    return refreshed.access_token;
  }

  return tokens.accessToken;
}

module.exports = {
  buildAuthorizationUrl,
  exchangeCodeForToken,
  refreshAccessToken,
  storeTokens,
  getTokens,
  getValidAccessToken,
};
