const { Router } = require('express');
const auth = require('../whoop/auth');
const client = require('../whoop/client');

const router = Router();

// Temporary user id until real auth is added
const DEFAULT_USER = 'default';

// ---------- OAuth2 flow ----------

// GET /api/whoop/auth — start OAuth flow
router.get('/auth', (_req, res) => {
  const { url, state } = auth.buildAuthorizationUrl();
  // Store state for CSRF validation (simplified; use session in production)
  res.json({ authorizationUrl: url, state });
});

// GET /api/whoop/callback?code=...&state=... — OAuth callback
router.get('/callback', async (req, res) => {
  // WHOOP may redirect with an error instead of a code
  if (req.query.error) {
    return res.status(400).json({
      error: req.query.error,
      description: req.query.error_description || 'Authorization denied by WHOOP',
    });
  }

  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    const tokens = await auth.exchangeCodeForToken(code);
    auth.storeTokens(DEFAULT_USER, tokens);
    res.json({ message: 'Connected to WHOOP successfully' });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// POST /api/whoop/refresh — manually refresh token
router.post('/refresh', async (req, res) => {
  const tokens = auth.getTokens(DEFAULT_USER);
  if (!tokens) {
    return res.status(401).json({ error: 'Not connected to WHOOP. Start OAuth flow first.' });
  }

  try {
    const refreshed = await auth.refreshAccessToken(tokens.refreshToken);
    auth.storeTokens(DEFAULT_USER, refreshed);
    res.json({ message: 'Token refreshed successfully' });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// ---------- Middleware: ensure authenticated ----------

async function requireWhoop(req, res, next) {
  try {
    const accessToken = await auth.getValidAccessToken(DEFAULT_USER);
    if (!accessToken) {
      return res.status(401).json({
        error: 'Not connected to WHOOP',
        hint: 'GET /api/whoop/auth to start the OAuth flow',
      });
    }
    req.whoopToken = accessToken;
    next();
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}

// ---------- Data endpoints ----------

router.get('/profile', requireWhoop, async (req, res) => {
  try {
    const data = await client.getProfile(req.whoopToken);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

router.get('/body', requireWhoop, async (req, res) => {
  try {
    const data = await client.getBodyMeasurement(req.whoopToken);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

router.get('/cycles', requireWhoop, async (req, res) => {
  try {
    const { limit, start, end, nextToken } = req.query;
    const data = await client.getCycles(req.whoopToken, { limit, start, end, nextToken });
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

router.get('/cycles/:id', requireWhoop, async (req, res) => {
  try {
    const data = await client.getCycleById(req.whoopToken, req.params.id);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

router.get('/recovery', requireWhoop, async (req, res) => {
  try {
    const { limit, start, end, nextToken } = req.query;
    const data = await client.getRecoveryCollection(req.whoopToken, { limit, start, end, nextToken });
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

router.get('/recovery/:cycleId', requireWhoop, async (req, res) => {
  try {
    const data = await client.getRecoveryForCycle(req.whoopToken, req.params.cycleId);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

router.get('/sleep', requireWhoop, async (req, res) => {
  try {
    const { limit, start, end, nextToken } = req.query;
    const data = await client.getSleepCollection(req.whoopToken, { limit, start, end, nextToken });
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

router.get('/sleep/:id', requireWhoop, async (req, res) => {
  try {
    const data = await client.getSleepById(req.whoopToken, req.params.id);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

router.get('/workouts', requireWhoop, async (req, res) => {
  try {
    const { limit, start, end, nextToken } = req.query;
    const data = await client.getWorkoutCollection(req.whoopToken, { limit, start, end, nextToken });
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

router.get('/workouts/:id', requireWhoop, async (req, res) => {
  try {
    const data = await client.getWorkoutById(req.whoopToken, req.params.id);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

module.exports = router;
