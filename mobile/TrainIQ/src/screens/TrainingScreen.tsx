import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { whoopStatus, getWhoopWorkouts } from '../services/whoopService';

// ── Design Tokens ─────────────────────────────────────────

const WARNING = '#F5A623';

// ── Types ─────────────────────────────────────────────────

type WorkoutType = 'Running' | 'Cycling' | 'Strength' | 'Swimming' | 'HIIT';

interface WorkoutTypeConfig {
  name: WorkoutType;
  color: string;
  gradient: [string, string];
}

interface Activity {
  id: string;
  type: WorkoutType;
  name: string;
  date: string;
  durationMin: number;
  calories: number;
  distanceKm?: number;
  avgHr?: number;
  maxHr?: number;
  pace?: string;
  intensity: number; // 1-10
}

interface DayLoad {
  day: string;
  load: number; // minutes of exercise
  intensity: number; // 1-10
  isToday: boolean;
}

interface WeekStats {
  activeDays: number;
  totalDays: number;
  totalMinutes: number;
  calories: number;
}

interface WhoopWorkout {
  id: number;
  sport_id: number;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  timezone_offset: string;
  score_state: string;
  score?: {
    strain: number;
    average_heart_rate: number;
    max_heart_rate: number;
    kilojoule: number;
    percent_recorded: number;
    distance_meter?: number;
    altitude_gain_meter?: number;
    altitude_change_meter?: number;
    zone_duration?: {
      zone_zero_milli?: number;
      zone_one_milli?: number;
      zone_two_milli?: number;
      zone_three_milli?: number;
      zone_four_milli?: number;
      zone_five_milli?: number;
    };
  };
}

// ── Mock Data ─────────────────────────────────────────────

const MOCK_WEEK_STATS: WeekStats = {
  activeDays: 4,
  totalDays: 7,
  totalMinutes: 187,
  calories: 1840,
};

const WORKOUT_TYPES: WorkoutTypeConfig[] = [
  { name: 'Running', color: colors.accent, gradient: ['rgba(200,241,53,0.18)', 'rgba(200,241,53,0.04)'] },
  { name: 'Cycling', color: colors.accent2, gradient: ['rgba(91,141,239,0.18)', 'rgba(91,141,239,0.04)'] },
  { name: 'Strength', color: colors.danger, gradient: ['rgba(239,68,68,0.18)', 'rgba(239,68,68,0.04)'] },
  { name: 'Swimming', color: '#5EEAD4', gradient: ['rgba(94,234,212,0.18)', 'rgba(94,234,212,0.04)'] },
  { name: 'HIIT', color: WARNING, gradient: ['rgba(245,166,35,0.18)', 'rgba(245,166,35,0.04)'] },
];

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    type: 'Running',
    name: 'Morning Long Run',
    date: 'Today · 6:30 AM',
    durationMin: 62,
    calories: 580,
    distanceKm: 10.4,
    avgHr: 152,
    maxHr: 178,
    pace: '5:58 /km',
    intensity: 6,
  },
  {
    id: 'a2',
    type: 'Strength',
    name: 'Upper Body Push',
    date: 'Yesterday · 6:15 PM',
    durationMin: 48,
    calories: 360,
    avgHr: 128,
    maxHr: 162,
    intensity: 7,
  },
  {
    id: 'a3',
    type: 'HIIT',
    name: 'Tabata Intervals',
    date: 'Mon · 7:00 AM',
    durationMin: 25,
    calories: 310,
    avgHr: 168,
    maxHr: 188,
    intensity: 9,
  },
  {
    id: 'a4',
    type: 'Cycling',
    name: 'Zone 2 Endurance',
    date: 'Sun · 8:00 AM',
    durationMin: 75,
    calories: 620,
    distanceKm: 32.8,
    avgHr: 138,
    maxHr: 158,
    intensity: 5,
  },
  {
    id: 'a5',
    type: 'Swimming',
    name: 'Pool Recovery',
    date: 'Sat · 5:30 PM',
    durationMin: 35,
    calories: 280,
    distanceKm: 1.5,
    avgHr: 122,
    maxHr: 144,
    pace: '2:20 /100m',
    intensity: 4,
  },
];

const MOCK_WEEKLY_LOAD: DayLoad[] = [
  { day: 'Mon', load: 25, intensity: 9, isToday: false },
  { day: 'Tue', load: 0, intensity: 0, isToday: false },
  { day: 'Wed', load: 48, intensity: 7, isToday: false },
  { day: 'Thu', load: 75, intensity: 5, isToday: false },
  { day: 'Fri', load: 35, intensity: 4, isToday: false },
  { day: 'Sat', load: 0, intensity: 0, isToday: false },
  { day: 'Today', load: 62, intensity: 6, isToday: true },
];

// ── WHOOP Helpers ─────────────────────────────────────────

function getSportName(sportId: number): string {
  const sports: Record<number, string> = {
    0: 'Running', 1: 'Cycling', 16: 'Baseball', 17: 'Basketball',
    18: 'Rowing', 19: 'Fencing', 20: 'Field Hockey', 21: 'Football',
    22: 'Golf', 24: 'Ice Hockey', 25: 'Lacrosse', 27: 'Rugby',
    28: 'Sailing', 29: 'Skiing', 30: 'Soccer', 31: 'Softball',
    32: 'Squash', 33: 'Swimming', 34: 'Tennis', 35: 'Track & Field',
    36: 'Volleyball', 37: 'Water Polo', 38: 'Wrestling', 39: 'Boxing',
    42: 'Dance', 43: 'Pilates', 44: 'Yoga', 45: 'Weightlifting',
    47: 'Cross Country Skiing', 48: 'Functional Fitness', 49: 'Duathlon',
    51: 'Gymnastics', 52: 'Hiking', 53: 'Horse Racing', 54: 'Kayak',
    55: 'Martial Arts', 56: 'Mountain Biking', 57: 'Powerlifting',
    59: 'Rock Climbing', 60: 'Paddleboarding', 63: 'Triathlon',
    64: 'Walking', 65: 'Surfing', 66: 'Elliptical', 67: 'Stairmaster',
    68: 'Meditation', 126: 'Strength Training', 127: 'Functional Fitness',
  };
  return sports[sportId] ?? 'Workout';
}

function getSportIcon(sportId: number): string {
  if ([0, 35].includes(sportId)) return '🏃';
  if ([1, 56].includes(sportId)) return '🚴';
  if ([45, 57, 126].includes(sportId)) return '🏋️';
  if ([33].includes(sportId)) return '🏊';
  if ([44, 43].includes(sportId)) return '🧘';
  if ([48, 127].includes(sportId)) return '⚡';
  if ([52, 64].includes(sportId)) return '🥾';
  if ([30, 17, 21].includes(sportId)) return '⚽';
  return '🏃';
}

function formatDuration(start: string, end: string): string {
  const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  return `${mins} min`;
}

function formatDate(start: string): string {
  const date = new Date(start);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  if (diffDays === 0) return `Today · ${time}`;
  if (diffDays === 1) return `Yesterday · ${time}`;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${days[date.getDay()]} · ${time}`;
}

function kJToKcal(kj: number): string {
  return `${Math.round(kj / 4.184)} kcal`;
}

function metersToKm(meters?: number): string | null {
  if (!meters || meters < 100) return null;
  return `${(meters / 1000).toFixed(1)} km`;
}

function rpeColor(strain: number): string {
  if (strain >= 14) return colors.danger;
  if (strain >= 10) return WARNING;
  if (strain >= 5) return colors.accent2;
  return colors.accent;
}

// ── Date Header ───────────────────────────────────────────

const _now = new Date();
const _MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const TODAY_LABEL = `${_MONTHS[_now.getMonth()]} ${_now.getDate()}, ${_now.getFullYear()}`;

// ── Workout Icon ──────────────────────────────────────────

function WorkoutIcon({
  type,
  size = 22,
  color,
}: {
  type: WorkoutType;
  size?: number;
  color?: string;
}) {
  const c = color ?? colors.accent;
  switch (type) {
    case 'Running':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx={14} cy={4} r={2} stroke={c} strokeWidth={2} />
          <Path
            d="M7 10l3-2 3 2 2 4 3 1M9 21l3-6 4 2"
            stroke={c}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'Cycling':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx={6} cy={17} r={4} stroke={c} strokeWidth={2} />
          <Circle cx={18} cy={17} r={4} stroke={c} strokeWidth={2} />
          <Path
            d="M6 17l4-10h5l3 10"
            stroke={c}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'Strength':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M6 4v16M18 4v16M2 8h4M18 8h4M2 16h4M18 16h4M6 12h12"
            stroke={c}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'Swimming':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0"
            stroke={c}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M2 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0"
            stroke={c}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx={16} cy={7} r={2} stroke={c} strokeWidth={2} />
        </Svg>
      );
    case 'HIIT':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
            stroke={c}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </Svg>
      );
  }
}

// ── Stat Icon ─────────────────────────────────────────────

function StatIcon({ kind, color }: { kind: 'days' | 'minutes' | 'calories'; color: string }) {
  const s = 20;
  if (kind === 'days') {
    return (
      <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <Path
          d="M4 7a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7z"
          stroke={color}
          strokeWidth={2}
        />
        <Path d="M4 11h16M8 3v4M16 3v4" stroke={color} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }
  if (kind === 'minutes') {
    return (
      <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
        <Path d="M12 8v4l2.5 2.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2s5 5 5 10a5 5 0 01-10 0c0-3 2-5 3-7 1 2 2 3 2 5"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Week Summary ──────────────────────────────────────────

function WeekSummary({ stats }: { stats: WeekStats }) {
  const completion = (stats.activeDays / stats.totalDays) * 100;

  return (
    <View style={summaryStyles.card}>
      <View style={summaryStyles.header}>
        <Text style={typography.label}>THIS WEEK</Text>
        <Text style={[typography.caption, { color: colors.accent }]}>
          {Math.round(completion)}% complete
        </Text>
      </View>

      <View style={summaryStyles.progressBar}>
        <View style={[summaryStyles.progressFill, { width: `${completion}%` }]} />
      </View>

      <View style={summaryStyles.statsRow}>
        <View style={summaryStyles.stat}>
          <StatIcon kind="days" color={colors.accent} />
          <Text style={[typography.h2, summaryStyles.statValue, { color: colors.accent }]}>
            {stats.activeDays}
            <Text style={[typography.caption, { color: colors.muted }]}>/{stats.totalDays}</Text>
          </Text>
          <Text style={typography.caption}>Active Days</Text>
        </View>

        <View style={summaryStyles.divider} />

        <View style={summaryStyles.stat}>
          <StatIcon kind="minutes" color={colors.accent2} />
          <Text style={[typography.h2, summaryStyles.statValue, { color: colors.accent2 }]}>
            {stats.totalMinutes}
          </Text>
          <Text style={typography.caption}>Minutes</Text>
        </View>

        <View style={summaryStyles.divider} />

        <View style={summaryStyles.stat}>
          <StatIcon kind="calories" color={colors.danger} />
          <Text style={[typography.h2, summaryStyles.statValue, { color: colors.danger }]}>
            {stats.calories >= 1000 ? `${(stats.calories / 1000).toFixed(1)}k` : String(stats.calories)}
          </Text>
          <Text style={typography.caption}>Calories</Text>
        </View>
      </View>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  card: {
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
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(240,240,248,0.06)',
    overflow: 'hidden',
    marginBottom: 18,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.cardBorder,
  },
});

// ── Start Workout Cards ───────────────────────────────────

function StartWorkoutRow() {
  const handleStart = (type: WorkoutType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(`Starting ${type}...`, 'Your workout is now being tracked.', [
      { text: 'OK' },
    ]);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={startStyles.scroll}
    >
      {WORKOUT_TYPES.map((w) => (
        <LinearGradient
          key={w.name}
          colors={w.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={startStyles.card}
        >
          <View style={[startStyles.iconWrap, { backgroundColor: `${w.color}22` }]}>
            <WorkoutIcon type={w.name} size={24} color={w.color} />
          </View>
          <Text style={[typography.bodyBold, { marginTop: 12, color: colors.text }]}>
            {w.name}
          </Text>
          <TouchableOpacity
            style={[startStyles.startBtn, { backgroundColor: w.color }]}
            onPress={() => handleStart(w.name)}
            activeOpacity={0.8}
          >
            <Text style={[typography.caption, { color: colors.background, fontFamily: 'DMSans_700Bold', fontSize: 11, letterSpacing: 0.5 }]}>
              START
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      ))}
    </ScrollView>
  );
}

const startStyles = StyleSheet.create({
  scroll: { gap: 12, paddingRight: 4 },
  card: {
    width: 130,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtn: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
});

// ── Activity Row ──────────────────────────────────────────

function ActivityRow({ activity }: { activity: Activity }) {
  const [expanded, setExpanded] = useState(false);
  const typeColor =
    WORKOUT_TYPES.find((w) => w.name === activity.type)?.color ?? colors.accent;

  return (
    <TouchableOpacity
      style={activityStyles.card}
      onPress={() => {
        Haptics.selectionAsync();
        setExpanded((e) => !e);
      }}
      activeOpacity={0.85}
    >
      <View style={activityStyles.top}>
        <View style={[activityStyles.iconWrap, { backgroundColor: `${typeColor}1F` }]}>
          <WorkoutIcon type={activity.type} size={20} color={typeColor} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={typography.bodyBold}>{activity.name}</Text>
          <Text style={[typography.caption, { marginTop: 2 }]}>{activity.date}</Text>
        </View>

        <View style={activityStyles.right}>
          <Text style={[typography.bodyBold, { color: typeColor }]}>
            {activity.durationMin}m
          </Text>
          <Text style={typography.caption}>{activity.calories} cal</Text>
        </View>
      </View>

      <View style={activityStyles.metaRow}>
        {activity.distanceKm != null && (
          <View style={activityStyles.metaPill}>
            <Text style={[typography.caption, { fontSize: 11 }]}>
              {activity.distanceKm} km
            </Text>
          </View>
        )}
        {activity.avgHr != null && (
          <View style={activityStyles.metaPill}>
            <Text style={[typography.caption, { fontSize: 11 }]}>
              ♥ {activity.avgHr} avg
            </Text>
          </View>
        )}
        {activity.pace && (
          <View style={activityStyles.metaPill}>
            <Text style={[typography.caption, { fontSize: 11 }]}>{activity.pace}</Text>
          </View>
        )}
        <View style={[activityStyles.intensityPill, { borderColor: typeColor }]}>
          <Text style={[typography.caption, { fontSize: 11, color: typeColor }]}>
            RPE {activity.intensity}
          </Text>
        </View>
      </View>

      {expanded && (
        <View style={activityStyles.details}>
          <View style={activityStyles.detailGrid}>
            <DetailItem label="Duration" value={`${activity.durationMin} min`} />
            <DetailItem label="Calories" value={`${activity.calories}`} />
            {activity.distanceKm != null && (
              <DetailItem label="Distance" value={`${activity.distanceKm} km`} />
            )}
            {activity.pace && <DetailItem label="Pace" value={activity.pace} />}
            {activity.avgHr != null && (
              <DetailItem label="Avg HR" value={`${activity.avgHr} bpm`} />
            )}
            {activity.maxHr != null && (
              <DetailItem label="Max HR" value={`${activity.maxHr} bpm`} />
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={activityStyles.detailItem}>
      <Text style={[typography.caption, { fontSize: 11, marginBottom: 4 }]}>
        {label.toUpperCase()}
      </Text>
      <Text style={typography.bodyBold}>{value}</Text>
    </View>
  );
}

const activityStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: { alignItems: 'flex-end', gap: 2 },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  metaPill: {
    backgroundColor: 'rgba(240,240,248,0.04)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  intensityPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  details: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  detailItem: { width: '30%', minWidth: 90 },
});

// ── Weekly Progress Chart ─────────────────────────────────

function WeeklyProgress({ weeklyLoad }: { weeklyLoad: DayLoad[] }) {
  const maxLoad = Math.max(...weeklyLoad.map((d) => d.load), 1);
  const chartHeight = 140;

  const intensityColor = (i: number) => {
    if (i === 0) return colors.cardBorder;
    if (i >= 8) return colors.danger;
    if (i >= 5) return WARNING;
    return colors.accent;
  };

  return (
    <View style={chartStyles.card}>
      <View style={chartStyles.header}>
        <Text style={typography.label}>WEEKLY LOAD</Text>
        <View style={chartStyles.legend}>
          <LegendDot color={colors.accent} label="Easy" />
          <LegendDot color={WARNING} label="Mod" />
          <LegendDot color={colors.danger} label="Hard" />
        </View>
      </View>

      <View style={[chartStyles.chart, { height: chartHeight }]}>
        {weeklyLoad.map((day) => {
          const barH = day.load > 0 ? Math.max((day.load / maxLoad) * chartHeight, 6) : 0;
          const barColor = intensityColor(day.intensity);

          return (
            <View key={day.day} style={chartStyles.barCol}>
              <View style={[chartStyles.barTrack, { height: chartHeight }]}>
                {day.load > 0 && (
                  <View style={[chartStyles.barValueLabel]}>
                    <Text style={[typography.caption, { fontSize: 10 }]}>{day.load}m</Text>
                  </View>
                )}
                {day.isToday && day.load > 0 ? (
                  <LinearGradient
                    colors={[colors.accent, colors.accent2]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[chartStyles.bar, { height: barH }]}
                  />
                ) : day.load > 0 ? (
                  <View
                    style={[
                      chartStyles.bar,
                      { height: barH, backgroundColor: `${barColor}66` },
                    ]}
                  />
                ) : (
                  <View style={chartStyles.restBar}>
                    <Text style={[typography.caption, { fontSize: 10 }]}>·</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  typography.caption,
                  chartStyles.dayLabel,
                  day.isToday && { color: colors.accent, fontFamily: 'DMSans_700Bold' },
                ]}
              >
                {day.day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={chartStyles.legendItem}>
      <View style={[chartStyles.legendDot, { backgroundColor: color }]} />
      <Text style={[typography.caption, { fontSize: 11 }]}>{label}</Text>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  card: {
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
  legend: { flexDirection: 'row', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
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
  },
  barValueLabel: { position: 'absolute', top: -4, width: '100%', alignItems: 'center' },
  bar: { width: 20, borderRadius: 10 },
  restBar: {
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: { marginTop: 10, fontSize: 11 },
});

// ── Main Screen ───────────────────────────────────────────

export default function TrainingScreen() {
  const insets = useSafeAreaInsets();
  const [whoopWorkouts, setWhoopWorkouts] = useState<WhoopWorkout[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);
  const [whoopConnected, setWhoopConnected] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const connected = await whoopStatus();
        if (cancelled) return;
        setWhoopConnected(connected);

        if (connected) {
          const workouts = await getWhoopWorkouts();
          if (cancelled) return;
          if (workouts.length > 0) {
            setWhoopWorkouts(workouts);
          }
        }
      } finally {
        if (!cancelled) setLoadingWorkouts(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const activityToShow = whoopWorkouts.length > 0 ? whoopWorkouts.slice(0, 5) : null;

  const last7Days = whoopWorkouts.filter((w) => {
    const daysAgo = (Date.now() - new Date(w.start).getTime()) / 86400000;
    return daysAgo <= 7;
  });
  const weekMinutes = last7Days.reduce((sum, w) => {
    return sum + Math.round((new Date(w.end).getTime() - new Date(w.start).getTime()) / 60000);
  }, 0);
  const weekCalories = last7Days.reduce(
    (sum, w) => sum + Math.round((w.score?.kilojoule ?? 0) / 4.184),
    0,
  );
  const activeDays = new Set(last7Days.map((w) => new Date(w.start).toDateString())).size;
  const weekPct = Math.min(Math.round((activeDays / 7) * 100), 100);

  const weekStats: WeekStats =
    whoopWorkouts.length > 0
      ? { activeDays, totalDays: 7, totalMinutes: weekMinutes, calories: weekCalories }
      : MOCK_WEEK_STATS;

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top + 16 }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[typography.caption, { marginBottom: 4 }]}>{TODAY_LABEL}</Text>
        <View style={styles.titleRow}>
          <Text style={typography.h1}>Training</Text>
          {whoopConnected && (
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>WHOOP LIVE</Text>
            </View>
          )}
        </View>
      </View>

      {/* This Week */}
      <View style={styles.section}>
        <WeekSummary stats={weekStats} />
      </View>

      {/* Start Workout */}
      <View style={styles.section}>
        <Text style={[typography.label, styles.sectionLabel]}>START WORKOUT</Text>
        <StartWorkoutRow />
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={typography.label}>RECENT ACTIVITY</Text>
          <Text style={[typography.caption, { color: colors.accent }]}>Last 7 days</Text>
        </View>
        {loadingWorkouts ? (
          <ActivityIndicator size={36} color={colors.accent} style={{ marginTop: 20 }} />
        ) : activityToShow ? (
          activityToShow.map((w) => {
            const id = String(w.id);
            const sport = getSportName(w.sport_id);
            const icon = getSportIcon(w.sport_id);
            const duration = formatDuration(w.start, w.end);
            const date = formatDate(w.start);
            const calories = w.score ? kJToKcal(w.score.kilojoule) : '— kcal';
            const distance = metersToKm(w.score?.distance_meter);
            const hr = w.score ? `${w.score.average_heart_rate} avg` : '—';
            const strain = w.score ? w.score.strain.toFixed(1) : null;

            return (
              <TouchableOpacity
                key={id}
                onPress={() => {
                  Haptics.selectionAsync();
                  setExpanded(expanded === id ? null : id);
                }}
                activeOpacity={0.85}
              >
                <View style={whoopStyles.card}>
                  <View style={whoopStyles.row}>
                    <Text style={whoopStyles.icon}>{icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={typography.bodyBold}>{sport}</Text>
                      <Text style={[typography.caption, { marginTop: 2 }]}>{date}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[typography.bodyBold, { color: colors.accent }]}>
                        {duration}
                      </Text>
                      <Text style={typography.caption}>{calories}</Text>
                    </View>
                  </View>
                  <View style={whoopStyles.pillRow}>
                    {distance && (
                      <View style={whoopStyles.pill}>
                        <Text style={whoopStyles.pillText}>📍 {distance}</Text>
                      </View>
                    )}
                    <View style={whoopStyles.pill}>
                      <Text style={whoopStyles.pillText}>♥ {hr}</Text>
                    </View>
                    {strain && (
                      <View
                        style={[
                          whoopStyles.pill,
                          {
                            backgroundColor:
                              rpeColor(Math.round(Number(strain))) + '22',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            whoopStyles.pillText,
                            { color: rpeColor(Math.round(Number(strain))) },
                          ]}
                        >
                          Strain {strain}
                        </Text>
                      </View>
                    )}
                  </View>
                  {expanded === id && (
                    <View style={whoopStyles.details}>
                      <View style={whoopStyles.detailGrid}>
                        {[
                          ['DURATION', duration],
                          ['CALORIES', calories],
                          ['DISTANCE', distance ?? '—'],
                          ['AVG HR', hr],
                          ['MAX HR', w.score ? `${w.score.max_heart_rate} bpm` : '—'],
                          ['STRAIN', strain ?? '—'],
                        ].map(([label, val]) => (
                          <View key={label} style={whoopStyles.detailCell}>
                            <Text style={whoopStyles.detailLabel}>{label}</Text>
                            <Text style={whoopStyles.detailValue}>{val}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          MOCK_ACTIVITIES.map((a) => <ActivityRow key={a.id} activity={a} />)
        )}
      </View>

      {/* Weekly Progress */}
      <View style={styles.section}>
        <WeeklyProgress weeklyLoad={MOCK_WEEKLY_LOAD} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  liveBadge: {
    backgroundColor: 'rgba(200,241,53,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(200,241,53,0.30)',
  },
  liveBadgeText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.accent,
  },
  section: { marginTop: 24 },
  sectionLabel: { marginBottom: 14 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
});

const whoopStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { fontSize: 24 },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  pill: {
    backgroundColor: 'rgba(240,240,248,0.04)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pillText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: colors.muted,
  },
  details: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  detailCell: { width: '30%' as unknown as number, minWidth: 90 },
  detailLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: colors.muted,
    marginBottom: 4,
  },
  detailValue: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: colors.text,
  },
});
