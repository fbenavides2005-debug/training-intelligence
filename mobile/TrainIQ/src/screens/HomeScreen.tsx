import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import * as apiService from '../services/apiService';
import * as healthService from '../services/healthService';
import ReadinessRing from '../components/ReadinessRing';
import MetricCard from '../components/MetricCard';
import CoachCard from '../components/CoachCard';
import WeeklyLoadChart from '../components/WeeklyLoadChart';
import type {
  RecoveryMetric,
  CoachRecommendation,
  WeeklyLoad,
  ReadinessResponse,
  NormalizedHealthResponse,
  RecommendationResponse,
} from '../types';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'GOOD MORNING';
  if (h < 18) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [readiness, setReadiness] = useState<ReadinessResponse | null>(null);
  const [health, setHealth] = useState<NormalizedHealthResponse | null>(null);
  const [recs, setRecs] = useState<RecommendationResponse[]>([]);
  const [history, setHistory] = useState<NormalizedHealthResponse[]>([]);

  const fetchAll = useCallback(async () => {
    const [r, h, rc, hi] = await Promise.allSettled([
      apiService.getReadiness(),
      apiService.getHealthToday(),
      apiService.getRecommendations(),
      apiService.getHealthHistory(7),
    ]);
    if (r.status === 'fulfilled') setReadiness(r.value);
    if (h.status === 'fulfilled') setHealth(h.value);
    if (rc.status === 'fulfilled') setRecs(rc.value);
    if (hi.status === 'fulfilled') setHistory(hi.value);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    healthService.autoSync();
    fetchAll();
  }, [fetchAll]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAll();
  }, [fetchAll]);

  // ── Derived data ────────────────────────────────────────

  const firstName = user?.profile?.firstName ?? 'Athlete';
  const score = readiness?.score ?? 0;

  const metrics: RecoveryMetric[] = [
    {
      label: 'Sleep',
      value: health?.sleep?.durationMin
        ? (health.sleep.durationMin / 60).toFixed(1)
        : '--',
      unit: 'hrs',
      trend: 'neutral',
      color: colors.accent2,
    },
    {
      label: 'HRV',
      value: health?.hrvMs != null ? String(health.hrvMs) : '--',
      unit: 'ms',
      trend: 'neutral',
      color: colors.accent,
    },
    {
      label: 'Strain',
      value: health?.strainScore != null ? health.strainScore.toFixed(1) : '--',
      trend: 'neutral',
      color: colors.danger,
    },
  ];

  const topRec: CoachRecommendation | null =
    recs.length > 0
      ? {
          id: recs[0]._id,
          title: recs[0].title,
          description: recs[0].description,
          tag: (recs[0].type ?? 'AI INSIGHT').toUpperCase(),
          type: recs[0].type,
          priority: recs[0].priority,
        }
      : null;

  const weeklyData: WeeklyLoad[] = (() => {
    const today = new Date();
    const result: WeeklyLoad[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const match = history.find((x) => x.date?.split('T')[0] === iso);
      result.push({
        day: i === 0 ? 'Today' : DAY_NAMES[d.getDay()],
        load: match?.activity?.exerciseMin ?? 0,
        max: 120,
      });
    }
    return result;
  })();

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
      style={[styles.screen, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[typography.caption, styles.greeting]}>{getGreeting()}</Text>
          <Text style={typography.h1}>Hey, {firstName}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
        </View>
      </View>

      {/* Readiness Ring */}
      <View style={styles.section}>
        <ReadinessRing score={score} maxScore={100} />
      </View>

      {/* Recovery Snapshot */}
      <View style={styles.section}>
        <Text style={[typography.label, styles.sectionLabel]}>RECOVERY SNAPSHOT</Text>
        <View style={styles.metricsRow}>
          {metrics.map((m) => (
            <MetricCard key={m.label} metric={m} />
          ))}
        </View>
      </View>

      {/* Coach Card */}
      {topRec && (
        <View style={styles.section}>
          <Text style={[typography.label, styles.sectionLabel]}>AI COACH</Text>
          <CoachCard recommendation={topRec} />
        </View>
      )}

      {/* Weekly Load */}
      <View style={styles.section}>
        <WeeklyLoadChart data={weeklyData} />
      </View>

      {/* Insight Strip */}
      <LinearGradient
        colors={['rgba(200,241,53,0.10)', 'rgba(91,141,239,0.08)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.insightStrip}
      >
        <Text style={[typography.caption, { color: colors.accent, marginBottom: 4 }]}>
          {readiness?.label?.toUpperCase() ?? 'READINESS'}
        </Text>
        <Text style={[typography.body, { color: colors.text }]}>
          {score >= 75
            ? "You're in great shape today. Consider pushing a higher-intensity session."
            : score >= 50
            ? 'Moderate readiness. A steady session would work well today.'
            : score > 0
            ? 'Take it easy today. Focus on recovery and light movement.'
            : 'Sync your health data to get personalized insights.'}
        </Text>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  centered: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: { marginBottom: 4 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: 'Syne_700Bold', fontSize: 18, color: colors.background },
  section: { marginTop: 28 },
  sectionLabel: { marginBottom: 14 },
  metricsRow: { flexDirection: 'row', gap: 10 },
  insightStrip: {
    marginTop: 28,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
});
