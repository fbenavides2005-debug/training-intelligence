# TrainIQ — Session Context

## Current App State (as of 2026-06-05)

### Architecture
- **Framework:** React Native 0.81.5 + Expo SDK 54, TypeScript, React 19
- **Navigation:** React Navigation 7 (bottom tabs + native stack)
- **State:** React Context (AuthContext) + local useState per screen
- **Theme:** Dark premium (#0A0A0F bg, #C8F135 accent, Syne headings, DM Sans body)
- **Auth:** JWT via expo-secure-store, Axios interceptor auto-attaches token
- **Auth flow:** Onboarding → Login/Register → App (gated by SecureStore + AuthContext)

### Branch
All work is on `claude/fix-code-issues-VvvNi`.

### Screens & Data Integration

| Screen | Data Source | Loading State | Notes |
|--------|-----------|---------------|-------|
| WelcomeScreen | N/A | N/A | Onboarding step 1/3 |
| GoalsScreen | N/A | N/A | Onboarding step 2/3, 4 goals |
| ConnectDevicesScreen | Local state | N/A | Onboarding step 3/3, toggles don't persist |
| **HomeScreen** | **Real API + WHOOP fallback** | No spinner (instant render) | getUserProfile + getReadiness + getWhoopRecovery fallback; ring shows real recovery score |
| **TrainingScreen** | **Real WHOOP + mock fallback** | ActivityIndicator | Workouts, weekly load, week stats from whoopService |
| **RecoveryScreen** | **Real WHOOP + mock fallback** | ActivityIndicator | Recovery, sleep, HRV, RHR, SpO2, skin temp — all real data |
| **CoachScreen** | **Real API + mock fallback** | ActivityIndicator | Recommendations, weekly plan, readiness from apiService |
| **ProfileScreen** | **Real API + AuthContext fallback** | ActivityIndicator | Real user data, working logout, training mode persists via updateSettings |
| LoginScreen | Real auth API | ActivityIndicator | JWT auth via Render backend |
| RegisterScreen | Real auth API | ActivityIndicator | Training mode selection |

### Services

| Service | Backend URL | Status |
|---------|-----------|--------|
| authService | `https://training-intelligence-a43n.onrender.com/api` | Working (JWT auth) |
| apiService | Same (uses authService.api) | Working (user, health, coach endpoints) |
| whoopService | Same Render backend | Working (OAuth + data, token persisted in MongoDB) |
| healthService | N/A | Stub only (requires dev build for Apple HealthKit) |

### Infrastructure
- **Backend:** Node.js/Express on Render free tier (50s cold start after inactivity)
- **Database:** MongoDB Atlas Cluster0 (free tier)
- **WHOOP OAuth redirect:** `https://training-intelligence-a43n.onrender.com/api/whoop/callback`

### Known Issues
1. **Fabric crash on iPhone in Expo Go** — `TypeError: expected dynamic type 'boolean', but got type 'string'`. We disabled `newArchEnabled`, `edgeToEdgeEnabled`, added `SafeAreaProvider`, and `Boolean()` casts. Expo Go SDK 54 has Fabric hardcoded internally, so the fix may require an Expo Development Build.
2. **No error boundaries** — Runtime errors crash the app without fallback UI.
3. **Render free tier sleeps** — Backend goes idle after inactivity; ~50s cold start on first request.
4. **Debug console.log in whoopService** — Should be removed before production.

---

## Session History

### Session 3 (2026-06-05) — WHOOP full integration + auth flow + ProfileScreen

#### WHOOP Integration (fully working)
- Migrated whoopService from old Codespace URL to Render backend (unified all services to one URL)
- Fixed WHOOP OAuth flow: redirect_uri trim fix, state parameter added
- Token now persisted in MongoDB via `WhoopToken` Mongoose model (survives server restarts)
- Added `DELETE /api/whoop/disconnect` endpoint
- Fixed WHOOP API endpoints to use v2 (`/v2/recovery`, `/v2/activity/sleep`, `/v2/activity/workout`)

#### Data types fixed
- Added `WhoopRecovery` and `WhoopSleep` interfaces to `whoopService.ts`
- Fixed parsers to correctly map WHOOP v2 response structure to app types
- Fixed `whoopStatus()` usage in RecoveryScreen (extract `.connected` from response object)

#### HomeScreen now shows real WHOOP data
- Added `getWhoopRecovery()` as fallback when `/coach/readiness` has no data
- Fixed `label?.toUpperCase()` crash with strict null checks
- Ring now shows real recovery score (79) from WHOOP

#### RecoveryScreen working
- Fixed whoopStatus connected check
- All metrics showing real data: recovery score, HRV, RHR, SpO2, skin temp, sleep breakdown

#### Auth flow wired up
- `RootNavigator.tsx`: reads `trainiq_onboarded` from SecureStore on mount, consumes `useAuth()` for `isAuthenticated`/`isLoading`
- Flow: not onboarded → `OnboardingNavigator` → not authenticated → `AuthNavigator` → authenticated → `AppNavigator`
- Onboarding completion writes `'trainiq_onboarded' = 'true'` to SecureStore (persists across restarts)
- `AuthNavigator.tsx` renders Login/Register stack (was imported but never rendered before)

#### ProfileScreen real data + working logout
- Fetches `getUserProfile()` on mount, falls back to `user` from AuthContext
- Dynamic `firstName`, `lastName`, `email`, `sport`, `initials` from real data
- Training mode changes call `updateSettings({ trainingMode })` (persists to backend)
- Logout calls `await logout()` from AuthContext → clears JWT → RootNavigator routes to AuthNavigator
- Loading spinner while profile loads

#### WHOOP token persistence (backend)
- Created `backend/src/models/WhoopToken.ts` — Mongoose model with `access_token`, `refresh_token`, `expires_at`, timestamps
- Updated `backend/src/routes/whoop.ts` — replaced `let storedToken` in-memory variable with `getToken()`/`saveToken()` MongoDB helpers
- Token refresh also persists to MongoDB
- `/status` has try/catch fallback to `{ connected: false }` if MongoDB unavailable

### Session 2 (2026-06-02) — API integration + Fabric fixes

#### WHOOP Real Data Integration (RecoveryScreen + TrainingScreen)
- Updated `whoopService.ts`: new backend URL, added `skinTempCelsius`, `sleepEfficiency`, `strain` fields
- **RecoveryScreen**: loading spinner, parallel fetch of recovery + sleep, WHOOP LIVE badge, skin temp metric, sleep efficiency ring card, silent mock fallback
- **TrainingScreen**: fetch workouts on mount, sport→icon mapping, strain→RPE conversion (`>=15→9, >=12→8, >=8→7, >=5→5, else 3`), formatted dates ("Today · 6:30 AM"), computed weekly load chart and week stats, WHOOP LIVE badge, dynamic date header

#### Fabric Crash Fixes
- `app.json`: `newArchEnabled: false`, `edgeToEdgeEnabled: false`
- `RootNavigator.tsx`: `Boolean()` cast on `hasOnboarded` state
- `App.tsx`: Added `SafeAreaProvider` wrapping entire tree (was missing — onboarding screens called `useSafeAreaInsets()` without it)
- Exhaustive search found no string-as-boolean props in our code; issue is likely internal to Expo Go's Fabric renderer

#### API Integration (HomeScreen + CoachScreen)
- **HomeScreen**: `getUserProfile` + `getReadiness` via `Promise.allSettled`. Displays real first name (fallback: 'Athlete') and readiness score/label (fallback: 80/GOOD). Avatar initial is dynamic.
- **CoachScreen**: `getRecommendations`, `getWeeklyPlan`, `getReadiness` via `Promise.allSettled`. Mapper functions: `mapRecommendation`, `mapPlanDay`, `mapWorkoutType`, `mapPriority`. `DailyBrief` and `WeeklyPlan` refactored to accept data props.

---

## What's Next

### Remaining mock data to wire up
- **HomeScreen Recovery Snapshot** — Sleep, HRV, Strain cards still hardcoded; need WHOOP recovery/sleep data
- **CoachScreen** — Recommendations and weekly plan still mock (backend endpoints exist but may not have real data)
- **TrainingScreen** — Workouts need to be wired to real WHOOP workout data (v2 endpoints)
- **ProfileScreen 30-day stats** — Still mock (no stats aggregation endpoint yet)

### Other Pending Work
- **ConnectDevicesScreen**: Wire up WHOOP connect button to actual `whoopAuth()` from whoopService (currently local toggle only)
- **Error boundaries**: Add React error boundary at root level
- **Expo Development Build**: May be needed to resolve the Fabric boolean crash in Expo Go
- **Remove debug console.log** from whoopService before production

---

## Important Technical Decisions

1. **`Promise.allSettled` over `Promise.all`** — Used everywhere for parallel API calls so one failing endpoint doesn't block the others. Each result is checked independently.

2. **Mock data as named constants** — All mock/fallback data is kept as `MOCK_*` constants at the top of each file. State is initialized with mocks, then overwritten if API succeeds. This means the app always renders something useful even without connectivity.

3. **Silent API failures** — All API errors are caught silently (console.warn at most). No error toasts or UI error states. The philosophy is graceful degradation to mock data rather than showing errors to users.

4. **Child components accept data as props** — Refactored `DailyBrief` and `WeeklyPlan` in CoachScreen to accept data props instead of reading module-level constants. This allows the parent to control data flow and pass in real API data.

5. **WHOOP strain→RPE mapping** — Converts WHOOP strain scores to RPE (Rate of Perceived Exertion) scale: `>=15→9, >=12→8, >=8→7, >=5→5, else 3`. Used in TrainingScreen for workout intensity display.

6. **Sport name→WorkoutType mapping** — Both TrainingScreen (WHOOP sports) and CoachScreen (API types) have mapper functions that convert string sport/type names to the fixed union types used by icon components.

7. **SafeAreaProvider at root** — Added to `App.tsx` because onboarding screens render outside React Navigation's `SafeAreaProviderCompat` and need `useSafeAreaInsets()`.

8. **WHOOP token in MongoDB** — Replaced in-memory `let storedToken` with a `WhoopToken` Mongoose model. `saveToken()` does `deleteMany` + `create` (single-user pattern). Token refresh also persists. Survives Render free tier sleep cycles.

9. **Auth gating via RootNavigator** — Three-state routing: `hasOnboarded` (SecureStore) → `isAuthenticated` (AuthContext/JWT) → AppNavigator. No manual navigation on logout — state change triggers re-render.

---

## Git History (recent)

```
66d27b4 Persist WHOOP OAuth token in MongoDB instead of in-memory store
9594c80 Wire up ProfileScreen with real user data and working logout
c3bf1f7 Wire up auth flow: SecureStore onboarding persistence + AuthNavigator gate
208a4ce Add CONTEXT.md with session state for context continuity
897727b Wire up real API data to HomeScreen and CoachScreen
3e14afa Add SafeAreaProvider to App.tsx root
60a10b5 Fix Fabric boolean type crash: disable edgeToEdge, cast booleans
fb0db91 Disable new architecture to fix Expo Go boolean type crash
88a390c Use real WHOOP data in RecoveryScreen and TrainingScreen
cfeda7d Implement WHOOP OAuth 2.0 integration (backend + mobile)
96bc6fd Polish pass on tab bar and navigator imports
dfa7d32 Add haptic feedback to tappable elements
535b772 Add three-step onboarding flow
90994b0 Bypass authentication flow in RootNavigator
```
