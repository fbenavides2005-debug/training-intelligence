import { Router, Request, Response } from 'express';
import { config } from '../config';

const router = Router();

// In-memory token storage (for dev only)
let tokenStore: { access_token?: string; refresh_token?: string; expires_at?: number } = {};

const WHOOP_AUTH_URL = 'https://api.prod.whoop.com/oauth/oauth2/auth';
const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';
const WHOOP_API_BASE = 'https://api.prod.whoop.com/developer/v2';

// GET /api/whoop/auth - redirect user to WHOOP OAuth
router.get('/auth', (req: Request, res: Response) => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.whoop.clientId,
    redirect_uri: config.whoop.redirectUri,
    scope: 'read:recovery read:cycles read:workout read:sleep read:profile read:body_measurement',
    state: 'trainiq_state',
  });
  res.redirect(`${WHOOP_AUTH_URL}?${params.toString()}`);
});

// GET /api/whoop/callback - exchange code for token
router.get('/callback', async (req: Request, res: Response) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing code');

  try {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code as string,
      client_id: config.whoop.clientId,
      client_secret: config.whoop.clientSecret,
      redirect_uri: config.whoop.redirectUri,
    });

    const response = await fetch(WHOOP_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data: any = await response.json();
    if (!response.ok) {
      console.error('Token exchange failed:', data);
      return res.status(400).send(`OAuth failed: ${JSON.stringify(data)}`);
    }

    tokenStore = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in * 1000),
    };

    res.send(`
      <html>
        <body style="font-family: sans-serif; background: #0A0A0F; color: #F0F0F8; padding: 40px; text-align: center;">
          <h1 style="color: #C8F135;">✓ WHOOP Connected!</h1>
          <p>You can close this window and return to TrainIQ.</p>
          <script>setTimeout(() => window.close(), 2000);</script>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('OAuth error:', err);
    res.status(500).send('OAuth error');
  }
});

// GET /api/whoop/status
router.get('/status', (req: Request, res: Response) => {
  res.json({ connected: !!tokenStore.access_token });
});

// Helper to call WHOOP API
async function whoopFetch(endpoint: string) {
  if (!tokenStore.access_token) throw new Error('Not connected');
  const response = await fetch(`${WHOOP_API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${tokenStore.access_token}` },
  });
  if (!response.ok) throw new Error(`WHOOP API error: ${response.status}`);
  return response.json();
}

// GET /api/whoop/recovery
router.get('/recovery', async (req: Request, res: Response) => {
  try {
    const data = await whoopFetch('/recovery?limit=1');
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/whoop/sleep
router.get('/sleep', async (req: Request, res: Response) => {
  try {
    const data = await whoopFetch('/activity/sleep?limit=1');
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/whoop/cycle - current day strain
router.get('/cycle', async (req: Request, res: Response) => {
  try {
    const data = await whoopFetch('/cycle?limit=1');
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/whoop/workouts
router.get('/workouts', async (req: Request, res: Response) => {
  try {
    const data = await whoopFetch('/activity/workout?limit=10');
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
