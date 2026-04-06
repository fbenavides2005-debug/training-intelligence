# Mobile — TrainIQ

iOS/mobile application for connecting Apple Health and displaying training insights.

## Setup

```bash
cd TrainIQ
npm install
npx expo start
```

## Stack

- **Expo** (TypeScript, blank template)
- **React Navigation** (bottom tabs + native stack)
- **Expo Linear Gradient** + **react-native-svg** for UI
- **Expo Google Fonts** (Syne + DM Sans)

## Structure

```
src/
  screens/      HomeScreen, TrainingScreen, CoachScreen, RecoveryScreen, ProfileScreen
  components/   ReadinessRing, MetricCard, CoachCard, WeeklyLoadChart
  navigation/   AppNavigator (bottom tabs)
  theme/        colors, typography
  types/        shared TypeScript types
```
