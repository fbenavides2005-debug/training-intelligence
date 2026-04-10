# TrainIQ Backend

TypeScript + Express.js + MongoDB backend for the TrainIQ intelligent coaching platform.

## Setup

```bash
cp .env.example .env   # fill in MongoDB URI, JWT secret, WHOOP credentials
npm install
npm run dev            # starts with tsx watch (hot reload)
```

## Architecture

```
src/
  config.ts              Environment + WHOOP config
  server.ts              Express app entry point
  types/index.ts         Shared TypeScript types & enums
  models/
    User.ts              User profile, settings, connected sources
    HealthData.ts        Apple Health, WHOOP, and Normalized snapshots
    Training.ts          Training sessions + recovery records
    Coach.ts             Readiness, recommendations, weekly plans
  controllers/
    auth.ts              Register + login with JWT
    user.ts              Profile & settings management
    health.ts            Apple Health + WHOOP sync + normalized data
    coach.ts             Readiness score, AI recommendations, weekly plan
  routes/
    auth.ts, user.ts, health.ts, coach.ts
  services/
    normalizer.ts        Merges Apple Health + WHOOP into one snapshot
    readiness.ts         Computes 0-100 readiness from health data
  middleware/
    auth.ts              JWT authentication middleware
```

## API Endpoints

### Auth (public)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, get JWT |

### User (auth required)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PATCH | `/api/user/profile` | Update profile fields |
| PATCH | `/api/user/settings` | Update settings |

### Health Data (auth required)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/health/apple` | Sync Apple Health data |
| POST | `/api/health/whoop` | Sync WHOOP data |
| GET | `/api/health/today` | Today's normalized snapshot |
| GET | `/api/health/history?days=7` | Historical health data |

### AI Coach (auth required)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/coach/readiness` | Today's readiness score (0-100) |
| GET | `/api/coach/readiness/history?days=7` | Readiness history |
| GET | `/api/coach/recommendations` | Today's AI recommendations |
| PATCH | `/api/coach/recommendations/:id/dismiss` | Dismiss a recommendation |
| GET | `/api/coach/plan` | Current weekly plan |
| PATCH | `/api/coach/plan/day/:index/complete` | Mark plan day done |

## Data Models

- **User** — profile, training mode (casual/professional/health), WHOOP tokens
- **AppleHealthData** — workouts, HR, HRV, sleep stages, activity rings
- **WhoopData** — recovery score, strain, sleep performance
- **NormalizedHealth** — merged view from all sources
- **TrainingSession** — sessions with RPE, duration, HR, calories
- **RecoveryRecord** — subjective recovery (fatigue, soreness, mood)
- **Readiness** — daily 0-100 score with breakdown (sleep/HRV/strain/recovery)
- **Recommendation** — AI coaching suggestions with priority
- **WeeklyPlan** — 7-day training plan with per-day focus
