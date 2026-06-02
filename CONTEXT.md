# TrainIQ — Session Context

## Current App State (as of 2026-06-02)

### Architecture
- **Framework:** React Native 0.81.5 + Expo SDK 54, TypeScript, React 19
- **Navigation:** React Navigation 7 (bottom tabs + native stack)
- **State:** React Context (AuthContext) + local useState per screen
- **Theme:** Dark premium (#0A0A0F bg, #C8F135 accent, Syne headings, DM Sans body)
- **Auth:** JWT via expo-secure-store, Axios interceptor auto-attaches token

### Branch
All work is on `claude/fix-code-issues-VvvNi`.

### Screens & Data Integration

| Screen | Data Source | Loading State | Notes |
|--------|-----------|---------------|-------|
| WelcomeScreen | N/A | N/A | Onboarding step 1/3 |
| GoalsScreen | N/A | N/A | Onboarding step 2/3, 4 goals |
| ConnectDevicesScreen | Local state | N/A | Onboarding step 3/3, toggles don't persist |
| **HomeScreen** | **Real API + mock fallback** | No spinner (instant render) | getUserProfile + getReadiness via Promise.allSettled |
| **TrainingScreen** | **Real WHOOP + mock fallback** | ActivityIndicator | Workouts, weekly load, week stats from whoopService |
| **RecoveryScreen** | **Real WHOOP + mock fallback** | ActivityIndicator | Recovery, sleep, HRV, SpO2, skin temp from whoopService |
| **CoachScreen** | **Real API + mock fallback** | ActivityIndicator | Recommendations, weekly plan, readiness from apiService |
| ProfileScreen | Real WHOOP status | Inline spinner | WHOOP connect button works; profile/stats are still mock |
| LoginScreen | Real auth API | ActivityIndicator | JWT auth via Railway backend |
| RegisterScreen | Real auth API | ActivityIndicator | Training mode selection |

### Services

| Service | Backend URL | Status |
|---------|-----------|--------|
| authService | `https://trainiq-production.up.railway.app/api` | Working (JWT auth) |
| apiService | Same (uses authService.api) | Working (user, health, coach endpoints) |
| whoopService | `https://ubiquitous-spork-97p65j6qjxvp29rxg-4000.app.github.dev` | Working (OAuth + data) |
| healthService | N/A | Stub only (requires dev build for Apple HealthKit) |

### Known Issues
1. **Fabric crash on iPhone in Expo Go** — `TypeError: expected dynamic type 'boolean', but got type 'string'`. We disabled `newArchEnabled`, `edgeToEdgeEnabled`, added `SafeAreaProvider`, and `Boolean()` casts. Expo Go SDK 54 has Fabric hardcoded internally, so the fix may require an Expo Development Build.
2. **Two different backends** — authService/apiService point to Railway (production), whoopService points to a GitHub Codespace (dev). These need unification.
3. **No error boundaries** — Runtime errors crash the app without fallback UI.

---

## What We Did This Session

### 1. WHOOP Real Data Integration (RecoveryScreen + TrainingScreen)
- Updated `whoopService.ts`: new backend URL, added `skinTempCelsius`, `sleepEfficiency`, `strain` fields
- **RecoveryScreen**: loading spinner, parallel fetch of recovery + sleep, WHOOP LIVE badge, skin temp metric, sleep efficiency ring card, silent mock fallback
- **TrainingScreen**: fetch workouts on mount, sport→icon mapping, strain→RPE conversion (`>=15→9, >=12→8, >=8→7, >=5→5, else 3`), formatted dates ("Today · 6:30 AM"), computed weekly load chart and week stats, WHOOP LIVE badge, dynamic date header

### 2. Fabric Crash Fixes
- `app.json`: `newArchEnabled: false`, `edgeToEdgeEnabled: false`
- `RootNavigator.tsx`: `Boolean()` cast on `hasOnboarded` state
- `App.tsx`: Added `SafeAreaProvider` wrapping entire tree (was missing — onboarding screens called `useSafeAreaInsets()` without it)
- Exhaustive search found no string-as-boolean props in our code; issue is likely internal to Expo Go's Fabric renderer

### 3. API Integration (HomeScreen + CoachScreen)
- **HomeScreen**: imports `getUserProfile` + `getReadiness` from apiService. Fetches both in parallel via `Promise.allSettled` on mount. Displays real first name (fallback: 'Athlete') and readiness score/label (fallback: 80/GOOD). Avatar initial is dynamic.
- **CoachScreen**: imports `getRecommendations`, `getWeeklyPlan`, `getReadiness`. Fetches all three via `Promise.allSettled`. Added mapper functions:
  - `mapRecommendation`: RecommendationResponse → local Recommendation type (maps `_id`→`id`, uppercases priority, maps type to WorkoutType)
  - `mapPlanDay`: API day → PlanDay (day abbreviation from date, focus→WorkoutType, isToday check)
  - `mapWorkoutType`, `mapPriority` helper functions
- `DailyBrief` component now accepts `{ score, label }` props instead of reading module constants
- `WeeklyPlan` component now accepts `{ initialPlan }` prop
- Duration shows '—' for API recommendations (API doesn't include duration)
- Loading spinner while fetching; all mock data kept as named constants for fallback
- Dismiss functionality preserved (filters from state)
- All animations (pulse, insight carousel) unchanged

---

## What's Next

### Auth Flow: RootNavigator + AuthNavigator + SecureStore Persistence

The current `RootNavigator` has two problems:
1. `hasOnboarded` is `useState(false)` — resets on every app restart
2. `AuthNavigator` (Login/Register) is imported but never rendered — auth is completely bypassed

**Planned changes:**

1. **RootNavigator.tsx** — Add three states: `isLoading` (checking stored token), `isAuthenticated` (has valid JWT), `hasOnboarded` (completed onboarding). On mount:
   - Check `SecureStore` for onboarding flag
   - Check `SecureStore` for JWT token (via `authService.getToken()`)
   - If no onboarding → show OnboardingNavigator
   - If onboarded but no auth → show AuthNavigator
   - If authenticated → show AppNavigator

2. **OnboardingNavigator** — On completion, write `'trainiq_onboarded' = 'true'` to SecureStore, then set `hasOnboarded = true`

3. **ConnectDevicesScreen** — Wire up WHOOP connect button to actual `whoopAuth()` from whoopService (currently local toggle only)

4. **AuthContext integration** — RootNavigator should consume `useAuth()` for `isAuthenticated` and `isLoading` instead of managing its own state

### Other Pending Work
- **ProfileScreen**: Wire up `getUserProfile` for real profile data and `updateProfile`/`updateSettings` for edits
- **HomeScreen**: Wire up recovery metrics from WHOOP (currently hardcoded Sleep/HRV/Strain values)
- **Backend URL unification**: Both services should point to same backend
- **Error boundaries**: Add React error boundary at root level
- **Expo Development Build**: May be needed to resolve the Fabric boolean crash in Expo Go

---

## Important Technical Decisions

1. **`Promise.allSettled` over `Promise.all`** — Used everywhere for parallel API calls so one failing endpoint doesn't block the others. Each result is checked independently.

2. **Mock data as named constants** — All mock/fallback data is kept as `MOCK_*` constants at the top of each file. State is initialized with mocks, then overwritten if API succeeds. This means the app always renders something useful even without connectivity.

3. **Silent API failures** — All API errors are caught silently (console.warn at most). No error toasts or UI error states. The philosophy is graceful degradation to mock data rather than showing errors to users.

4. **Child components accept data as props** — Refactored `DailyBrief` and `WeeklyPlan` in CoachScreen to accept data props instead of reading module-level constants. This allows the parent to control data flow and pass in real API data.

5. **WHOOP strain→RPE mapping** — Converts WHOOP strain scores to RPE (Rate of Perceived Exertion) scale: `>=15→9, >=12→8, >=8→7, >=5→5, else 3`. Used in TrainingScreen for workout intensity display.

6. **Sport name→WorkoutType mapping** — Both TrainingScreen (WHOOP sports) and CoachScreen (API types) have mapper functions that convert string sport/type names to the fixed union types used by icon components.

7. **SafeAreaProvider at root** — Added to `App.tsx` because onboarding screens render outside React Navigation's `SafeAreaProviderCompat` and need `useSafeAreaInsets()`.

---

## Git History (recent)

```
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
