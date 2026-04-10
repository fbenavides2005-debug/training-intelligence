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
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import * as apiService from '../services/apiService';
import type { ReadinessResponse, NormalizedHealthResponse } from '../types';

// ── HRV Line Chart Component ──────────────────────────────

function HRVChart({ data }: { data: { day: string; value: number }[] }) {
  const W = 320;
  const H = 120;
  const padX = 30;
  const padY = 20;
  const chartW = W - padX * 2;
  const chartH = H - padY * 2;

  const values = data.map((d) => d.value);
  const maxV = Math.max(...values, 1);
  const minV = Math.min(...values, 0);
  const range = maxV - minV || 1;

  const points = data.map((d, i) => {
    const x = padX + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = padY + chartH - ((d.value - minV) / range) * chartH;
    return { x, y };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View style={chartStyles.container}>
      <Text style={[typography.label, { marginBottom: 14 }]}>HRV TREND (7 DAYS)</Text>
      <Svg width={W} height={H}>
        {/* Grid lines */}
        <Line x1={padX} y1={padY} x2={padX} y2={padY + chartH} stroke={colors.cardBorder} strokeWidth={1} />
        <Line x1={padX} y1={padY + chartH} x2={padX + chartW} y2={padY + chartH} stroke={colors.cardBorder} strokeWidth={1} />
        {/* Line */}
        {points.length > 1 && (
          <Polyline points={polyline} fill="none" stroke={colors.accent} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        )}
        {/* Dots */}
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4} fill={colors.accent} />
        ))}
      </Svg>
      <View style={chartStyles.labels}>
        {data.map((d, i) => (
          <Text key={i} style={[typography.caption, chartStyles.label]}>
            {d.day}
          </Text>
        ))}
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
    alignItems: 'center',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 6,
  },
  label: { fontSize: 10 },
});

// ── Recovery Score Ring ───────────────────────────────────

function RecoveryRing({ score }: { score: number }) {
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const center = size / 2;

  const ringColor =
    score >= 80 ? colors.success : score >= 50 ? '#F59E0B' : colors.danger;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size, alignSelf: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={center} cy={center} r={radius} stroke={colors.cardBorder} strokeWidth={strokeWidth} fill="none" />
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
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={[typography.h1, { fontSize: 36, color: colors.text }]}>{score}</Text>
        <Text style={[typography.caption, { fontSize: 10, letterSpacing: 2 }]}>RECOVERY</Text>
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function RecoveryScreen() {
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [readiness, setReadiness] = useState<ReadinessResponse | null>(null);
  const [health, setHealth] = useState<NormalizedHealthResponse | null>(null);
  const [history, setHistory] = useState<NormalizedHealthResponse[]>([]);

  // Subjective logger state
  const [fatigue, setFatigue] = useState(3);
  const [soreness, setSoreness] = useState(3);
  const [mood, setMood] = useState(3);

  const fetchData = useCallback(async () => {
    const [r, h, hi] = await Promise.allSettled([
      apiService.getReadiness(),
      apiService.getHealthToday(),
      apiService.getHealthHistory(7),
    ]);
    if (r.status === 'fulfilled') setReadiness(r.value);
    if (h.status === 'fulfilled') setHealth(h.value);
    if (hi.status === 'fulfilled') setHistory(hi.value);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleLogRecovery = () => {
    Alert.alert(
      'Recovery Logged',
      `Fatigue: ${fatigue}/5 | Soreness: ${soreness}/5 | Mood: ${mood}/5`,
      [{ text: 'OK' }],
    );
  };

  // ── Derived data ────────────────────────────────────────

  const recoveryScore = readiness?.breakdown?.recovery
    ? Math.round(readiness.breakdown.recovery * 4)
    : health?.recoveryScore ?? 0;

  const sleepData = health?.sleep;
  const sleepCards = [
    { label: 'Total', value: sleepData?.durationMin ? (sleepData.durationMin / 60).toFixed(1) : '--', unit: 'hrs', color: colors.accent2 },
    { label: 'Deep', value: sleepData?.deepMin?.toString() ?? '--', unit: 'min', color: '#8B5CF6' },
    { label: 'REM', value: sleepData?.remMin?.toString() ?? '--', unit: 'min', color: colors.accent },
    { label: 'Light', value: sleepData?.lightMin?.toString() ?? '--', unit: 'min', color: colors.muted },
  ];

  const hrvChartData = (() => {
    const today = new Date();
    const result: { day: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const match = history.find((x) => x.date?.split('T')[0] === iso);
      result.push({
        day: DAY_NAMES[d.getDay()],
        value: match?.hrvMs ?? 0,
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
      style={[styles.screen, { paddingTop: insets.top + 16 }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }
    >
      <Text style={typography.h1}>Recovery</Text>

      {/* Recovery Score */}
      <View style={styles.section}>
        <RecoveryRing score={recoveryScore} />
        <Text
          style={[
            typography.body,
            {
              textAlign: 'center',
              marginTop: 12,
              color:
                recoveryScore >= 80
                  ? colors.success
                  : recoveryScore >= 50
                  ? '#F59E0B'
                  : colors.danger,
            },
          ]}
        >
          {recoveryScore >= 80
            ? 'Fully recovered — ready to push'
            : recoveryScore >= 50
            ? 'Moderate recovery — train smart'
            : recoveryScore > 0
            ? 'Low recovery — prioritize rest'
            : 'No recovery data yet'}
        </Text>
      </View>

      {/* Sleep Breakdown */}
      <View style={styles.section}>
        <Text style={[typography.label, styles.sectionLabel]}>SLEEP BREAKDOWN</Text>
        <View style={styles.sleepRow}>
          {sleepCards.map((s) => (
            <View key={s.label} style={styles.sleepCard}>
              <Text style={[typography.caption, { marginBottom: 6 }]}>{s.label}</Text>
              <Text style={[typography.h3, { color: s.color }]}>{s.value}</Text>
              <Text style={[typography.caption, { fontSize: 10, marginTop: 2 }]}>{s.unit}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* HRV Trend */}
      <View style={styles.section}>
        <HRVChart data={hrvChartData} />
      </View>

      {/* Readiness Breakdown */}
      {readiness?.breakdown && (
        <View style={styles.section}>
          <Text style={[typography.label, styles.sectionLabel]}>READINESS BREAKDOWN</Text>
          <View style={styles.breakdownCard}>
            {Object.entries(readiness.breakdown).map(([key, val]) => (
              <View key={key} style={styles.breakdownRow}>
                <Text style={[typography.body, { flex: 1, textTransform: 'capitalize' }]}>
                  {key}
                </Text>
                <View style={styles.breakdownBar}>
                  <View
                    style={[
                      styles.breakdownFill,
                      {
                        width: `${(val / 25) * 100}%`,
                        backgroundColor: val >= 18 ? colors.accent : val >= 12 ? '#F59E0B' : colors.danger,
                      },
                    ]}
                  />
                </View>
                <Text style={[typography.bodyBold, { width: 36, textAlign: 'right' }]}>
                  {val}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Subjective Recovery Logger */}
      <View style={styles.section}>
        <Text style={[typography.label, styles.sectionLabel]}>HOW DO YOU FEEL?</Text>
        <View style={styles.loggerCard}>
          <RatingRow label="Fatigue" value={fatigue} onChange={setFatigue} />
          <RatingRow label="Soreness" value={soreness} onChange={setSoreness} />
          <RatingRow label="Mood" value={mood} onChange={setMood} />
          <TouchableOpacity style={styles.logButton} onPress={handleLogRecovery} activeOpacity={0.7}>
            <Text style={[typography.bodyBold, { color: colors.background }]}>Log Recovery</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// ── Rating Row ────────────────────────────────────────────

function RatingRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.ratingRow}>
      <Text style={[typography.body, { width: 80 }]}>{label}</Text>
      <View style={styles.ratingDots}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity key={n} onPress={() => onChange(n)} activeOpacity={0.6}>
            <View
              style={[
                styles.ratingDot,
                n <= value && { backgroundColor: colors.accent, borderColor: colors.accent },
              ]}
            >
              <Text
                style={[
                  typography.caption,
                  { fontSize: 12, color: n <= value ? colors.background : colors.muted },
                ]}
              >
                {n}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  centered: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 40 },
  section: { marginTop: 28 },
  sectionLabel: { marginBottom: 14 },
  sleepRow: { flexDirection: 'row', gap: 10 },
  sleepCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  breakdownCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  breakdownBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(240,240,248,0.06)',
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  breakdownFill: { height: '100%', borderRadius: 4 },
  loggerCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingDots: { flexDirection: 'row', gap: 8 },
  ratingDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
});
