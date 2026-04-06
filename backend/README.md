# Backend

Server logic, APIs, integrations, data normalization and recommendation pipeline.

## Setup

1. Copy `.env.example` to `.env` and fill in your WHOOP credentials:
   ```bash
   cp .env.example .env
   ```

2. Register your app at https://developer.whoop.com/ to get `WHOOP_CLIENT_ID` and `WHOOP_CLIENT_SECRET`.

3. Install dependencies and start the server:
   ```bash
   npm install
   npm run dev
   ```

## WHOOP Integration

### OAuth Flow

1. `GET /api/whoop/auth` — returns the WHOOP authorization URL
2. User authorizes in browser and is redirected to `/api/whoop/callback`
3. Tokens are stored and auto-refreshed

### API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/whoop/profile` | User profile |
| `GET /api/whoop/body` | Body measurements |
| `GET /api/whoop/cycles` | Physiological cycles |
| `GET /api/whoop/recovery` | Recovery scores (HRV, RHR, SpO2) |
| `GET /api/whoop/sleep` | Sleep records |
| `GET /api/whoop/workouts` | Workout records |

All data endpoints support `?limit=`, `?start=`, `?end=` (ISO 8601), and `?nextToken=` for pagination.
