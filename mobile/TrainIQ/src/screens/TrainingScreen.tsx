import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import * as apiService from '../services/apiService';
import type { NormalizedHealthResponse, WeeklyPlanResponse } from '../types';

type WorkoutType = 'Running' | 'Cycling' | 'Strength' | 'Swimming' | 'HIIT';

interface WorkoutTypeConfig {
  name: WorkoutType;
  icon: React.ReactNode;
  color: string;
}

function WorkoutIcon({ type, size = 20 }: { type: string; size?: number }) {
  const c = colors.accent;
  switch (type.toLowerCase()) {
    case 'running':
    case 'cardio':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx={14} cy={4} r={2} stroke={c} strokeWidth={2} />
          <Path d="M4 17l4-4 3 3 5-7" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'cycling':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx={7} cy={17} r={4} stroke={c} strokeWidth={2} />
          <Circle cx={17} cy={17} r={4} stroke={c} strokeWidth={2} />
          <Path d="M12 17l-2-6h5l3 6" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'strength':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M6 4v16M18 4v16M2 8h4M18 8h4M2 16h4M18 16h4M6 12h12" stroke={c} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      );
    case 'swimming':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke={c} strokeWidth={2} strokeLinecap="round" />
          <Path d="M2 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke={c} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      );
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={c} strokeWidth={2} strokeLinejoin="round" />
        </Svg>
      );
  }
}

export default function TrainingScreen() {
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState<NormalizedHealthResponse[]>([]);
  const [plan, setPlan] = useState<WeeklyPlanResponse | null>(null);

  const fetchData = useCallback(async () => {
    const [h, p] = await Promise.allSettled([
      apiService.getHealthHistory(7),
      apiService.getWeeklyPlan(),
    ]);
    if (h.status === 'fulfilled') setHistory(h.value);
    if (p.status === 'fulfilled') setPlan(p.value);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // ── Weekly summary ──────────────────────────────────────

  const totalMin = history.reduce((s, d) => s + (d.activity?.exerciseMin ?? 0), 0);
  const totalCal = history.reduce((s, d) => s + (d.activity?.activeCalories ?? 0), 0);
  const activeDays = history.filter((d) => (d.activity?.exerciseMin ?? 0) > 0).length;

  // ── Workout types ───────────────────────────────────────

  const workoutTypes: WorkoutType[] = ['Running', 'Cycling', 'Strength', 'Swimming', 'HIIT'];

  const handleStartWorkout = (type: WorkoutType) => {
    Alert.alert(
      'Start Workout',
      `Track your ${type} workout with Apple Health or WHOOP for automatic sync.`,
      [{ text: 'OK' }],
    );
  };

  // ── Render ──────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top + 16 }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }
    >
      <Text style={typography.h1}>Training</Text>

      {/* Weekly Summary */}
      <View style={styles.summaryCard}>
        <Text style={[typography.label, styles.sectionLabel]}>THIS WEEK</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[typography.h2, { color: colors.accent }]}>{activeDays}</Text>
            <Text style={typography.caption}>Active Days</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={[typography.h2, { color: colors.accent2 }]}>{totalMin}</Text>
            <Text style={typography.caption}>Minutes</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={[typography.h2, { color: colors.danger }]}>
              {totalCal > 0 ? (totalCal / 1000).toFixed(1) + 'k' : '0'}
            </Text>
            <Text style={typography.caption}>Calories</Text>
          </View>
        </View>
      </View>

      {/* Start Workout */}
      <View style={styles.section}>
        <Text style={[typography.label, styles.sectionLabel]}>START WORKOUT</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typesScroll}>
          {workoutTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.typeCard}
              onPress={() => handleStartWorkout(type)}
              activeOpacity={0.7}
            >
              <View style={styles.typeIcon}>
                <WorkoutIcon type={type} />
              </View>
              <Text style={[typography.caption, { color: colors.text, marginTop: 8 }]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={[typography.label, styles.sectionLabel]}>RECENT ACTIVITY</Text>
        {history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={[typography.body, { color: colors.muted, textAlign: 'center' }]}>
              No activity data yet.{'\n'}Sync Apple Health or WHOOP to see your workouts.
            </Text>
          </View>
        ) : (
          history.map((day, idx) => {
            const dateObj = new Date(day.date);
            const dayStr = dateObj.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            const exerciseMin = day.activity?.exerciseMin ?? 0;
            const calories = day.activity?.activeCalories ?? 0;
            const steps = day.activity?.steps ?? 0;
            const hr = day.heartRate?.avg;

            return (
              <View key={day._id ?? idx} style={styles.activityCard}>
                <View style={styles.activityLeft}>
                  <View style={styles.activityIcon}>
                    <WorkoutIcon type="cardio" size={18} />
                  </View>
                  <View>
                    <Text style={typography.bodyBold}>{dayStr}</Text>
                    <Text style={[typography.caption, { marginTop: 2 }]}>
                      {steps > 0 ? `${steps.toLocaleString()} steps` : 'No steps recorded'}
                    </Text>
                  </View>
                </View>
                <View style={styles.activityRight}>
                  {exerciseMin > 0 && (
                    <Text style={[typography.caption, { color: colors.accent }]}>
                      {exerciseMin} min
                    </Text>
                  )}
                  {calories > 0 && (
                    <Text style={[typography.caption, { color: colors.accent2 }]}>
                      {calories} cal
                    </Text>
                  )}
                  {hr != null && (
                    <Text style={[typography.caption, { color: colors.danger }]}>
                      {hr} bpm
                    </Text>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Weekly Plan */}
      {plan && (
        <View style={styles.section}>
          <Text style={[typography.label, styles.sectionLabel]}>WEEKLY PLAN</Text>
          <View style={styles.planCard}>
            <Text style={[typography.bodyBold, { marginBottom: 4 }]}>{plan.weeklyGoal}</Text>
            <Text style={[typography.caption, { marginBottom: 16 }]}>
              {plan.totalPlannedLoadMin} min planned
            </Text>
            {plan.days.map((d, i) => {
              const dateObj = new Date(d.date);
              const label = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              return (
                <View key={i} style={styles.planDay}>
                  <Text style={[typography.caption, { width: 36 }]}>{label}</Text>
                  <View style={styles.planBar}>
                    <LinearGradient
                      colors={
                        d.completed
                          ? [colors.accent, colors.accent2]
                          : ['rgba(200,241,53,0.20)', 'rgba(200,241,53,0.10)']
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.planFill,
                        { width: `${Math.min((d.plannedDurationMin / 90) * 100, 100)}%` },
                      ]}
                    />
                  </View>
                  <Text style={[typography.caption, { width: 42, textAlign: 'right' }]}>
                    {d.plannedDurationMin}m
                  </Text>
                  {d.completed && (
                    <Text style={{ color: colors.accent, marginLeft: 6, fontSize: 14 }}>
                      ✓
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  centered: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 40 },
  section: { marginTop: 28 },
  sectionLabel: { marginBottom: 14 },
  summaryCard: {
    marginTop: 20,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 14 },
  summaryItem: { alignItems: 'center' },
  divider: { width: 1, backgroundColor: colors.cardBorder, marginVertical: 4 },
  typesScroll: { marginHorizontal: -4 },
  typeCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 6,
    width: 88,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(200,241,53,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  activityLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(200,241,53,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityRight: { alignItems: 'flex-end', gap: 2 },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  planDay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(240,240,248,0.06)',
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  planFill: { height: '100%', borderRadius: 4 },
});
