import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import ReadinessRing from '../components/ReadinessRing';
import MetricCard from '../components/MetricCard';
import CoachCard from '../components/CoachCard';
import WeeklyLoadChart from '../components/WeeklyLoadChart';
import { getUserProfile, getReadiness } from '../services/apiService';
import { getWhoopRecovery } from '../services/whoopService';
import type { RecoveryMetric, CoachRecommendation, WeeklyLoad } from '../types';

// ── Mock Data (fallback) ─────────────────────────────────

const MOCK_READINESS_SCORE = 80;
const MOCK_READINESS_LABEL = 'GOOD';

const recoveryMetrics: RecoveryMetric[] = [
  { label: 'Sleep', value: '7.4', unit: 'hrs', trend: 'up', color: colors.accent2 },
  { label: 'HRV', value: '68', unit: 'ms', trend: 'up', color: colors.accent },
  { label: 'Strain', value: '12.3', trend: 'neutral', color: colors.danger },
];

const coachRec: CoachRecommendation = {
  id: '1',
  title: 'Easy aerobic session recommended',
  description:
    'Your HRV is trending up and recovery is strong. A moderate zone-2 session will build your aerobic base without accumulating excess fatigue.',
  tag: 'AI INSIGHT',
};

const weeklyData: WeeklyLoad[] = [
  { day: 'Mon', load: 65, max: 100 },
  { day: 'Tue', load: 80, max: 100 },
  { day: 'Wed', load: 45, max: 100 },
  { day: 'Thu', load: 90, max: 100 },
  { day: 'Fri', load: 30, max: 100 },
  { day: 'Sat', load: 70, max: 100 },
  { day: 'Today', load: 55, max: 100 },
];

// ── Helpers ───────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'GOOD MORNING';
  if (h < 18) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('Athlete');
  const [readinessScore, setReadinessScore] = useState(MOCK_READINESS_SCORE);
  const [readinessLabel, setReadinessLabel] = useState(MOCK_READINESS_LABEL);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      const [profileResult, readinessResult, whoopResult] = await Promise.allSettled([
        getUserProfile(),
        getReadiness(),
        getWhoopRecovery(),
      ]);
      if (cancelled) return;
      if (profileResult.status === 'fulfilled' && profileResult.value?.profile?.firstName) {
        setUserName(profileResult.value.profile.firstName);
      }
      if (readinessResult.status === 'fulfilled' && readinessResult.value) {
        setReadinessScore(readinessResult.value.score);
        setReadinessLabel((readinessResult.value.label ?? 'good').toUpperCase());
      } else if (whoopResult.status === 'fulfilled' && whoopResult.value) {
        setReadinessScore(whoopResult.value.recoveryScore);
        setReadinessLabel(whoopResult.value.recoveryScore >= 67 ? 'PEAK' : whoopResult.value.recoveryScore >= 34 ? 'GOOD' : 'LOW');
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[typography.caption, styles.greeting]}>{getGreeting()}</Text>
          <Text style={typography.h1}>Hey, {userName}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
        </View>
      </View>

      {/* Readiness Ring */}
      <View style={styles.section}>
        <ReadinessRing score={readinessScore} maxScore={100} />
      </View>

      {/* Recovery Snapshot */}
      <View style={styles.section}>
        <Text style={[typography.label, styles.sectionLabel]}>RECOVERY SNAPSHOT</Text>
        <View style={styles.metricsRow}>
          {recoveryMetrics.map((m) => (
            <MetricCard key={m.label} metric={m} />
          ))}
        </View>
      </View>

      {/* Coach Card */}
      <View style={styles.section}>
        <Text style={[typography.label, styles.sectionLabel]}>AI COACH</Text>
        <CoachCard recommendation={coachRec} />
      </View>

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
          {readinessLabel}
        </Text>
        <Text style={[typography.body, { color: colors.text }]}>
          Your training load this week is 12% below target. Consider adding a tempo session
          tomorrow to stay on track.
        </Text>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: {
    marginBottom: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 18,
    color: colors.background,
  },
  section: {
    marginTop: 28,
  },
  sectionLabel: {
    marginBottom: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  insightStrip: {
    marginTop: 28,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
});
