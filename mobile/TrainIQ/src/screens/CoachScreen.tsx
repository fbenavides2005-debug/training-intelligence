import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import * as apiService from '../services/apiService';
import type {
  ReadinessResponse,
  RecommendationResponse,
  WeeklyPlanResponse,
} from '../types';

export default function CoachScreen() {
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [readiness, setReadiness] = useState<ReadinessResponse | null>(null);
  const [recs, setRecs] = useState<RecommendationResponse[]>([]);
  const [plan, setPlan] = useState<WeeklyPlanResponse | null>(null);

  const fetchData = useCallback(async () => {
    const [r, rc, p] = await Promise.allSettled([
      apiService.getReadiness(),
      apiService.getRecommendations(),
      apiService.getWeeklyPlan(),
    ]);
    if (r.status === 'fulfilled') setReadiness(r.value);
    if (rc.status === 'fulfilled') setRecs(rc.value);
    if (p.status === 'fulfilled') setPlan(p.value);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleDismiss = async (id: string) => {
    try {
      await apiService.dismissRecommendation(id);
      setRecs((prev) => prev.filter((r) => r._id !== id));
    } catch {
      // ignore
    }
  };

  const handleCompleteDay = async (index: number) => {
    try {
      await apiService.completePlanDay(index);
      setPlan((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, days: [...prev.days] };
        updated.days[index] = { ...updated.days[index], completed: true };
        return updated;
      });
    } catch {
      // ignore
    }
  };

  // ── Render ──────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const score = readiness?.score ?? 0;
  const label = readiness?.label ?? 'unknown';

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top + 16 }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }
    >
      <Text style={typography.h1}>AI Coach</Text>

      {/* Daily Message */}
      <LinearGradient
        colors={['rgba(200,241,53,0.10)', 'rgba(91,141,239,0.08)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.dailyCard}
      >
        <View style={styles.dailyHeader}>
          <View style={styles.aiIcon}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Circle cx={12} cy={12} r={9} stroke={colors.accent} strokeWidth={2} />
              <Path
                d="M8 12l2.5 2.5L16 9"
                stroke={colors.accent}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text style={[typography.label, { color: colors.accent }]}>DAILY BRIEF</Text>
        </View>
        <Text style={[typography.h3, { marginBottom: 8 }]}>
          {score >= 75
            ? 'Great day to push hard'
            : score >= 50
            ? 'A balanced training day'
            : score > 0
            ? 'Recovery-focused day'
            : 'Connect a device to get started'}
        </Text>
        <Text style={[typography.body, { color: colors.muted, lineHeight: 22 }]}>
          {score >= 75
            ? `Your readiness score is ${score} (${label}). Your body is primed for a high-intensity session. Consider intervals or a competition-pace effort.`
            : score >= 50
            ? `Your readiness is ${score} (${label}). A moderate effort like a tempo run or steady-state strength session would be ideal.`
            : score > 0
            ? `Your readiness is only ${score} (${label}). Focus on mobility, stretching, or a very light aerobic session. Sleep is the best recovery tool.`
            : 'Sync your Apple Health or WHOOP data to receive personalized coaching based on your biometrics.'}
        </Text>
      </LinearGradient>

      {/* Recommendations */}
      <View style={styles.section}>
        <Text style={[typography.label, styles.sectionLabel]}>RECOMMENDATIONS</Text>
        {recs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={[typography.body, { color: colors.muted, textAlign: 'center' }]}>
              No recommendations yet.{'\n'}Sync health data to get AI-powered insights.
            </Text>
          </View>
        ) : (
          recs.map((rec) => (
            <View key={rec._id} style={styles.recCard}>
              <View style={styles.recHeader}>
                <View
                  style={[
                    styles.recBadge,
                    {
                      backgroundColor:
                        rec.priority === 'high'
                          ? 'rgba(239,68,68,0.15)'
                          : rec.priority === 'medium'
                          ? 'rgba(245,158,11,0.15)'
                          : 'rgba(200,241,53,0.15)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.caption,
                      {
                        fontSize: 10,
                        color:
                          rec.priority === 'high'
                            ? colors.danger
                            : rec.priority === 'medium'
                            ? '#F59E0B'
                            : colors.accent,
                      },
                    ]}
                  >
                    {rec.priority?.toUpperCase() ?? 'INFO'}
                  </Text>
                </View>
                <View style={styles.recTypeBadge}>
                  <Text style={[typography.caption, { fontSize: 10, color: colors.accent2 }]}>
                    {rec.type?.toUpperCase() ?? 'GENERAL'}
                  </Text>
                </View>
              </View>
              <Text style={[typography.bodyBold, { marginBottom: 6 }]}>{rec.title}</Text>
              <Text style={[typography.body, { color: colors.muted, lineHeight: 20, marginBottom: 12 }]}>
                {rec.description}
              </Text>
              <TouchableOpacity
                style={styles.dismissBtn}
                onPress={() => handleDismiss(rec._id)}
                activeOpacity={0.6}
              >
                <Text style={[typography.caption, { color: colors.muted }]}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Weekly Plan */}
      {plan ? (
        <View style={styles.section}>
          <Text style={[typography.label, styles.sectionLabel]}>WEEKLY PLAN</Text>
          <View style={styles.planCard}>
            <Text style={[typography.h3, { marginBottom: 4 }]}>{plan.weeklyGoal}</Text>
            <Text style={[typography.caption, { marginBottom: 20 }]}>
              {plan.totalPlannedLoadMin} min total · {plan.weekStart?.split('T')[0]} → {plan.weekEnd?.split('T')[0]}
            </Text>
            {plan.days.map((day, idx) => {
              const dateObj = new Date(day.date);
              const dayLabel = dateObj.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });
              const intensityColor =
                day.plannedIntensity >= 8
                  ? colors.danger
                  : day.plannedIntensity >= 5
                  ? '#F59E0B'
                  : colors.accent;

              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.planDayCard, day.completed && styles.planDayCompleted]}
                  onPress={() => !day.completed && handleCompleteDay(idx)}
                  activeOpacity={day.completed ? 1 : 0.7}
                >
                  <View style={styles.planDayLeft}>
                    <View
                      style={[
                        styles.checkCircle,
                        day.completed && { backgroundColor: colors.accent, borderColor: colors.accent },
                      ]}
                    >
                      {day.completed && (
                        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                          <Path
                            d="M5 12l5 5L20 7"
                            stroke={colors.background}
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      )}
                    </View>
                    <View>
                      <Text style={[typography.bodyBold, day.completed && { color: colors.muted }]}>
                        {day.focus}
                      </Text>
                      <Text style={[typography.caption, { marginTop: 2 }]}>{dayLabel}</Text>
                    </View>
                  </View>
                  <View style={styles.planDayRight}>
                    <Text style={[typography.caption, { color: intensityColor }]}>
                      RPE {day.plannedIntensity}
                    </Text>
                    <Text style={[typography.bodyBold, { color: colors.text }]}>
                      {day.plannedDurationMin}m
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={[typography.label, styles.sectionLabel]}>WEEKLY PLAN</Text>
          <View style={styles.emptyCard}>
            <Text style={[typography.body, { color: colors.muted, textAlign: 'center' }]}>
              No plan generated yet.{'\n'}Keep syncing data so the AI can build your plan.
            </Text>
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
  dailyCard: {
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  dailyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  aiIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(200,241,53,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  recCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  recHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  recBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recTypeBadge: {
    backgroundColor: 'rgba(91,141,239,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dismissBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
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
  planDayCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  planDayCompleted: { opacity: 0.6 },
  planDayLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  planDayRight: { alignItems: 'flex-end', gap: 2 },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
