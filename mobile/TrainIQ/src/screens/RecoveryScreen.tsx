import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { getWhoopRecovery, getWhoopSleep } from '../services/whoopService';
import type { WhoopRecovery, WhoopSleep } from '../services/whoopService';

// ── Mock Data ─────────────────────────────────────────────

const RECOVERY_SCORE = 82;

const SLEEP_DATA = [
  { label: 'Total', value: '7.5', unit: 'hrs', color: colors.accent },
  { label: 'Deep', value: '1.8', unit: 'hrs', color: '#8B5CF6' },
  { label: 'REM', value: '2.1', unit: 'hrs', color: colors.accent2 },
  { label: 'Light', value: '3.6', unit: 'hrs', color: colors.muted },
];

const HRV_DATA = [
  { day: 'Mon', value: 62 },
  { day: 'Tue', value: 68 },
  { day: 'Wed', value: 55 },
  { day: 'Thu', value: 72 },
  { day: 'Fri', value: 78 },
  { day: 'Sat', value: 65 },
  { day: 'Sun', value: 82 },
];

const READINESS_BREAKDOWN = [
  { label: 'Nutrition', value: 78 },
  { label: 'Hydration', value: 65 },
  { label: 'Mental Fatigue', value: 72 },
  { label: 'Muscle Soreness', value: 60 },
];

// ── Helpers ───────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 80) return colors.accent;
  if (score >= 50) return '#F59E0B';
  return colors.danger;
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Fully Recovered';
  if (score >= 50) return 'Moderate Recovery';
  return 'Low Recovery';
}

// ── Recovery Score Ring ───────────────────────────────────

function RecoveryRing({ score }: { score: number }) {
  const size = 200;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const center = size / 2;
  const ringColor = getScoreColor(score);

  return (
    <View style={ringStyles.container}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.cardBorder}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
            rotation={-90}
            origin={`${center}, ${center}`}
          />
        </Svg>
        <View style={ringStyles.inner}>
          <Text style={[typography.h1, { fontSize: 52, color: colors.text }]}>{score}</Text>
          <Text style={[typography.caption, ringStyles.unit]}>/ 100</Text>
          <Text style={[typography.caption, ringStyles.label]}>RECOVERY</Text>
        </View>
      </View>
      <Text style={[typography.h3, { color: ringColor, marginTop: 14 }]}>
        {getScoreLabel(score)}
      </Text>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  inner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unit: { marginTop: -4, fontSize: 11 },
  label: { marginTop: 8, letterSpacing: 2, fontSize: 10 },
});

// ── Sleep Breakdown Grid ──────────────────────────────────

function SleepBreakdownData({ data }: { data: typeof SLEEP_DATA }) {
  return (
    <View style={sleepStyles.grid}>
      {data.map((item) => (
        <View key={item.label} style={sleepStyles.card}>
          <Text style={[typography.caption, sleepStyles.label]}>{item.label}</Text>
          <View style={sleepStyles.valueRow}>
            <Text style={[typography.h2, { color: item.color }]}>{item.value}</Text>
            <Text style={[typography.caption, sleepStyles.unit]}>{item.unit}</Text>
          </View>
          <View style={sleepStyles.bar}>
            <View
              style={[
                sleepStyles.barFill,
                {
                  width: `${Math.min((parseFloat(item.value) / 8) * 100, 100)}%`,
                  backgroundColor: item.color,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const sleepStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  label: { marginBottom: 8 },
  valueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  unit: { marginBottom: 3 },
  bar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(240,240,248,0.06)',
    marginTop: 12,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 2 },
});

// ── HRV Trend Bar Chart (pure RN primitives) ──────────────

function HRVChartData({ data }: { data: typeof HRV_DATA }) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;
  const chartHeight = 140;
  const avg = Math.round(data.reduce((s, d) => s + d.value, 0) / data.length);

  return (
    <View style={chartStyles.container}>
      <View style={chartStyles.header}>
        <Text style={typography.label}>HRV TREND (7 DAYS)</Text>
        <View style={chartStyles.avgTag}>
          <Text style={[typography.caption, { color: colors.accent }]}>
            AVG {avg}ms
          </Text>
        </View>
      </View>

      <View style={[chartStyles.chart, { height: chartHeight }]}>
        {data.map((item, idx) => {
          const normalized = 0.25 + ((item.value - minValue) / range) * 0.75;
          const barHeight = chartHeight * normalized;
          const isPeak = item.value === maxValue;

          return (
            <View key={idx} style={chartStyles.barCol}>
              <View style={chartStyles.barTrack}>
                <Text style={[typography.caption, chartStyles.barValue]}>
                  {item.value}
                </Text>
                <View
                  style={[
                    chartStyles.bar,
                    {
                      height: barHeight,
                      backgroundColor: isPeak ? colors.accent : 'rgba(200,241,53,0.25)',
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  typography.caption,
                  chartStyles.dayLabel,
                  isPeak && { color: colors.accent },
                ]}
              >
                {item.day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  avgTag: {
    backgroundColor: 'rgba(200,241,53,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barCol: { alignItems: 'center', flex: 1 },
  barTrack: {
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
    flex: 1,
  },
  barValue: { fontSize: 10, marginBottom: 6 },
  bar: { width: 18, borderRadius: 9 },
  dayLabel: { marginTop: 10 },
});

// ── Readiness Breakdown Bars ──────────────────────────────

function ReadinessBreakdown() {
  return (
    <View style={breakdownStyles.card}>
      {READINESS_BREAKDOWN.map((item, idx) => {
        const isLast = idx === READINESS_BREAKDOWN.length - 1;
        const barColor =
          item.value >= 75
            ? colors.accent
            : item.value >= 50
            ? '#F59E0B'
            : colors.danger;

        return (
          <View
            key={item.label}
            style={[breakdownStyles.row, !isLast && breakdownStyles.rowDivider]}
          >
            <View style={breakdownStyles.labelRow}>
              <Text style={typography.body}>{item.label}</Text>
              <Text style={[typography.bodyBold, { color: barColor }]}>
                {item.value}
              </Text>
            </View>
            <View style={breakdownStyles.bar}>
              <View
                style={[
                  breakdownStyles.barFill,
                  { width: `${item.value}%`, backgroundColor: barColor },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const breakdownStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  row: { paddingVertical: 16 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  bar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(240,240,248,0.06)',
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 4 },
});

// ── Subjective Recovery Logger ────────────────────────────

interface RatingRowProps {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
}

function RatingRow({ label, description, value, onChange }: RatingRowProps) {
  return (
    <View style={loggerStyles.ratingRow}>
      <View style={{ flex: 1 }}>
        <Text style={typography.bodyBold}>{label}</Text>
        <Text style={[typography.caption, { marginTop: 2 }]}>{description}</Text>
      </View>
      <View style={loggerStyles.dots}>
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n <= value;
          return (
            <TouchableOpacity
              key={n}
              onPress={() => onChange(n)}
              activeOpacity={0.6}
            >
              <View
                style={[
                  loggerStyles.dot,
                  active && { backgroundColor: colors.accent, borderColor: colors.accent },
                ]}
              >
                <Text
                  style={[
                    typography.caption,
                    {
                      fontSize: 12,
                      color: active ? colors.background : colors.muted,
                    },
                  ]}
                >
                  {n}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function SubjectiveLogger() {
  const [fatigue, setFatigue] = useState(3);
  const [soreness, setSoreness] = useState(2);
  const [mood, setMood] = useState(4);

  const handleLog = () => {
    // In production this would POST to the backend
    console.log('Recovery logged:', { fatigue, soreness, mood });
  };

  return (
    <View style={loggerStyles.card}>
      <RatingRow
        label="Fatigue"
        description="How tired do you feel?"
        value={fatigue}
        onChange={setFatigue}
      />
      <View style={loggerStyles.divider} />
      <RatingRow
        label="Soreness"
        description="Muscle stiffness level"
        value={soreness}
        onChange={setSoreness}
      />
      <View style={loggerStyles.divider} />
      <RatingRow
        label="Mood"
        description="Overall mental state"
        value={mood}
        onChange={setMood}
      />

      <TouchableOpacity
        style={loggerStyles.submitBtn}
        onPress={handleLog}
        activeOpacity={0.7}
      >
        <Text style={[typography.bodyBold, { color: colors.background }]}>
          Log Recovery
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const loggerStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
  },
  submitBtn: {
    marginTop: 16,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
});

// ── Main Screen ───────────────────────────────────────────

export default function RecoveryScreen() {
  const insets = useSafeAreaInsets();

  const [whoopRecovery, setWhoopRecovery] = useState<WhoopRecovery | null>(null);
  const [whoopSleep, setWhoopSleep] = useState<WhoopSleep | null>(null);

  useEffect(() => {
    // Attempt to load real WHOOP data; silently fall back to mock on failure
    getWhoopRecovery().then((r) => { if (r) setWhoopRecovery(r); }).catch(() => {});
    getWhoopSleep().then((s) => { if (s) setWhoopSleep(s); }).catch(() => {});
  }, []);

  const recoveryScore = whoopRecovery?.recoveryScore ?? RECOVERY_SCORE;

  // Merge real sleep data over mock when available
  const sleepData = SLEEP_DATA.map((item) => {
    if (!whoopSleep) return item;
    switch (item.label) {
      case 'Total': return { ...item, value: whoopSleep.totalHours.toString() };
      case 'Deep':  return { ...item, value: whoopSleep.deepHours.toString() };
      case 'REM':   return { ...item, value: whoopSleep.remHours.toString() };
      case 'Light': return { ...item, value: whoopSleep.lightHours.toString() };
      default:      return item;
    }
  });

  // Overlay HRV into the first bar in the chart if we have real data
  const effectiveHrvData = (whoopRecovery?.hrvRmssd)
    ? HRV_DATA.map((d, i) => i === 6 ? { ...d, value: whoopRecovery.hrvRmssd } : d)
    : HRV_DATA;

  // Source badge shown when using real WHOOP data
  const isLive = whoopRecovery !== null;

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top + 16 }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[typography.caption, { marginBottom: 4 }]}>TODAY</Text>
            <Text style={typography.h1}>Recovery</Text>
          </View>
          {isLive && (
            <View style={styles.liveBadge}>
              <Text style={[typography.caption, { color: colors.accent, fontSize: 10, fontFamily: 'DMSans_700Bold' }]}>
                WHOOP LIVE
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Recovery Score Ring */}
      <View style={styles.section}>
        <RecoveryRing score={recoveryScore} />
        {whoopRecovery && (
          <View style={styles.hrvRow}>
            <View style={styles.metricPill}>
              <Text style={[typography.caption, { fontSize: 11 }]}>HRV</Text>
              <Text style={[typography.bodyBold, { color: colors.accent, marginTop: 2 }]}>
                {whoopRecovery.hrvRmssd} ms
              </Text>
            </View>
            <View style={styles.metricPill}>
              <Text style={[typography.caption, { fontSize: 11 }]}>RHR</Text>
              <Text style={[typography.bodyBold, { color: colors.accent2, marginTop: 2 }]}>
                {whoopRecovery.restingHeartRate} bpm
              </Text>
            </View>
            {whoopRecovery.spo2 !== undefined && (
              <View style={styles.metricPill}>
                <Text style={[typography.caption, { fontSize: 11 }]}>SpO₂</Text>
                <Text style={[typography.bodyBold, { color: colors.text, marginTop: 2 }]}>
                  {whoopRecovery.spo2?.toFixed(1)}%
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Sleep Breakdown */}
      <View style={styles.section}>
        <Text style={[typography.label, styles.sectionLabel]}>SLEEP BREAKDOWN</Text>
        <SleepBreakdownData data={sleepData} />
      </View>

      {/* HRV Chart */}
      <View style={styles.section}>
        <HRVChartData data={effectiveHrvData} />
      </View>

      {/* Readiness Breakdown */}
      <View style={styles.section}>
        <Text style={[typography.label, styles.sectionLabel]}>READINESS FACTORS</Text>
        <ReadinessBreakdown />
      </View>

      {/* Subjective Logger */}
      <View style={styles.section}>
        <Text style={[typography.label, styles.sectionLabel]}>HOW DO YOU FEEL?</Text>
        <SubjectiveLogger />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  liveBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(200,241,53,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(200,241,53,0.30)',
    marginBottom: 4,
  },
  section: { marginTop: 28 },
  sectionLabel: { marginBottom: 14 },
  hrvRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
  },
  metricPill: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
});
