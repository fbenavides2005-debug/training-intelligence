import { Router, Request, Response } from 'express';
import { config } from '../config';
import { WhoopToken } from '../models/WhoopToken';

const router = Router();

// ── MongoDB token helpers ────────────────────────────────────────────────

async function getToken() {
  return WhoopToken.findOne().sort({ updatedAt: -1 });
}

async function saveToken(data: {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
}) {
  await WhoopToken.deleteMany({});
  return WhoopToken.create(data);
}

async function getValidAccessToken(): Promise<string | null> {
  const token = await getToken();
  if (!token) return null;

  // Return cached token if still valid (with 60-second buffer)
  if (Date.now() < token.expires_at - 60_000) {
    return token.access_token;
  }

  // Attempt token refresh
  if (!token.refresh_token) {
    return null;
  }

  try {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: token.refresh_token,
      client_id: config.whoop.clientId,
      client_secret: config.whoop.clientSecret,
    });

    const res = await fetch(config.whoop.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!res.ok) {
      console.error('WHOOP token refresh failed:', res.status, await res.text());
      await WhoopToken.deleteMany({});
      return null;
    }

    const data = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };

    await saveToken({
      access_token: data.access_token,
      refresh_token: data.refresh_token ?? token.refresh_token,
      expires_at: Date.now() + (data.expires_in ?? 3600) * 1000,
    });

    return data.access_token;
  } catch (err) {
    console.error('WHOOP token refresh error:', err);
    await WhoopToken.deleteMany({}).catch(() => {});
    return null;
  }
}

async function whoopGet(path: string): Promise<{ status: number; body: unknown }> {
  const token = await getValidAccessToken();
  if (!token) return { status: 401, body: { error: 'Not connected to WHOOP' } };

  const res = await fetch(`${config.whoop.apiBaseUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const body = await res.json().catch(() => ({ error: 'Invalid JSON from WHOOP' }));
  return { status: res.status, body };
}

// ── Routes ────────────────────────────────────────────────────────────────

// GET /api/whoop/auth → redirect user to WHOOP OAuth consent page
router.get('/auth', (_req: Request, res: Response) => {
  const state = Math.random().toString(36).substring(2, 15);
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.whoop.clientId,
    redirect_uri: config.whoop.redirectUri,
    scope: config.whoop.scopes.join(' '),
    state,
  });
  res.redirect(`${config.whoop.authUrl}?${params.toString()}`);
});

// GET /api/whoop/callback → exchange authorization code for tokens
router.get('/callback', async (req: Request, res: Response) => {
  const { code, error } = req.query;

  if (error || !code || typeof code !== 'string') {
    res.status(400).send(`OAuth error: ${error ?? 'missing authorization code'}`);
    return;
  }

  try {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.whoop.redirectUri,
      client_id: config.whoop.clientId,
      client_secret: config.whoop.clientSecret,
    });

    const tokenRes = await fetch(config.whoop.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      console.error('Token exchange failed:', tokenRes.status, text);
      res.status(502).send(`Token exchange failed (${tokenRes.status}): ${text}`);
      return;
    }

    const data = (await tokenRes.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in?: number;
    };

    await saveToken({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in ?? 3600) * 1000,
    });

    console.log('WHOOP token stored successfully');

    // Auto-close page so the mobile WebBrowser detects completion
    res.send(`<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { font-family: -apple-system, sans-serif; background: #0A0A0F; color: #F0F0F8;
         display: flex; flex-direction: column; align-items: center; justify-content: center;
         height: 100vh; margin: 0; }
  h2 { color: #C8F135; margin-bottom: 8px; }
  p  { color: rgba(240,240,248,0.6); font-size: 14px; }
</style>
</head>
<body>
  <h2>✓ WHOOP Connected</h2>
  <p>You can close this window and return to TrainIQ.</p>
  <script>setTimeout(() => window.close(), 2500);</script>
</body>
</html>`);
  } catch (err) {
    console.error('WHOOP callback error:', err);
    res.status(500).send('Internal error during token exchange');
  }
});

// GET /api/whoop/status → check if a token is stored
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const token = await getToken();
    res.json({ connected: !!token?.access_token });
  } catch {
    res.json({ connected: false });
  }
});

// GET /api/whoop/recovery → latest recovery record
router.get('/recovery', async (_req: Request, res: Response) => {
  const { status, body } = await whoopGet('/v2/recovery?limit=1');
  res.status(status).json(body);
});

// GET /api/whoop/sleep → latest sleep record
router.get('/sleep', async (_req: Request, res: Response) => {
  const { status, body } = await whoopGet('/v2/activity/sleep?limit=1');
  res.status(status).json(body);
});

// GET /api/whoop/workouts → recent workouts
router.get('/workouts', async (_req: Request, res: Response) => {
  const { status, body } = await whoopGet('/v2/activity/workout?limit=10');
  res.status(status).json(body);
});

export default router;
