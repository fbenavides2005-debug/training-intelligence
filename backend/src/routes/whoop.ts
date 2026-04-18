import { Router, Request, Response } from 'express';
import { config } from '../config';

const router = Router();

// ── In-memory token store (single-user; swap for DB when ready) ───────────

interface WhoopToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // ms epoch
}

let storedToken: WhoopToken | null = null;

async function getValidAccessToken(): Promise<string | null> {
  if (!storedToken) return null;

  // Return cached token if still valid (with 60-second buffer)
  if (Date.now() < storedToken.expiresAt - 60_000) {
    return storedToken.accessToken;
  }

  // Attempt token refresh
  try {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: storedToken.refreshToken,
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
      storedToken = null;
      return null;
    }

    const data = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };

    storedToken = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? storedToken.refreshToken,
      expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    };

    return storedToken.accessToken;
  } catch (err) {
    console.error('WHOOP token refresh error:', err);
    storedToken = null;
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
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.whoop.clientId,
    redirect_uri: config.whoop.redirectUri,
    scope: config.whoop.scopes.join(' '),
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

    storedToken = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    };

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
router.get('/status', (_req: Request, res: Response) => {
  res.json({ connected: storedToken !== null });
});

// GET /api/whoop/recovery → latest recovery record
router.get('/recovery', async (_req: Request, res: Response) => {
  const { status, body } = await whoopGet('/v1/recovery?limit=1');
  res.status(status).json(body);
});

// GET /api/whoop/sleep → latest sleep record
router.get('/sleep', async (_req: Request, res: Response) => {
  const { status, body } = await whoopGet('/v1/sleep?limit=1');
  res.status(status).json(body);
});

// GET /api/whoop/workouts → recent workouts
router.get('/workouts', async (_req: Request, res: Response) => {
  const { status, body } = await whoopGet('/v1/workout?limit=10');
  res.status(status).json(body);
});

export default router;
