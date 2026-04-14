import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

// ── Design Tokens ─────────────────────────────────────────

const WARNING = '#F5A623';

// ── Types ─────────────────────────────────────────────────

type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
type WorkoutType = 'run' | 'strength' | 'rest' | 'cycle' | 'tempo' | 'easy' | 'intervals';

interface Recommendation {
  id: string;
  priority: Priority;
  type: WorkoutType;
  title: string;
  description: string;
  details: string;
  durationMin: number;
}

interface PlanDay {
  day: string;
  type: WorkoutType;
  title: string;
  durationMin: number;
  rpe: number; // 0-10
  completed: boolean;
  isToday: boolean;
}

// ── Mock Data ─────────────────────────────────────────────

const RECOVERY_SCORE = 82;
const READINESS_LABEL = 'PEAK';

const INITIAL_RECS: Recommendation[] = [
  {
    id: 'r1',
    priority: 'HIGH',
    type: 'intervals',
    title: 'Interval Training Session',
    description: 'Your recovery is excellent. Perfect day for high-intensity intervals.',
    details:
      'Warm up 10 min easy jog. 6x400m at 5K pace with 90s active recovery between reps. Cool down 10 min easy. Focus on smooth turnover and controlled breathing.',
    durationMin: 45,
  },
  {
    id: 'r2',
    priority: 'MEDIUM',
    type: 'strength',
    title: 'Lower Body Strength',
    description: 'Build on recent aerobic work with compound strength movements.',
    details:
      'Back Squat 4x6 @ 75%, Romanian Deadlift 3x8, Walking Lunges 3x10 each leg, Plank 3x45s. Rest 2 min between sets.',
    durationMin: 60,
  },
  {
    id: 'r3',
    priority: 'LOW',
    type: 'rest',
    title: 'Active Recovery',
    description: 'Light movement to promote blood flow and speed recovery.',
    details:
      '20 min easy walk or yoga flow, followed by 10 min of targeted stretching (hips, hamstrings, calves). Focus on breathing deeply.',
    durationMin: 30,
  },
];

const WEEKLY_PLAN: PlanDay[] = [
  { day: 'MON', type: 'run', title: 'Long Run', durationMin: 60, rpe: 6, completed: true, isToday: false },
  { day: 'TUE', type: 'strength', title: 'Upper Body', durationMin: 45, rpe: 7, completed: true, isToday: false },
  { day: 'WED', type: 'rest', title: 'Rest Day', durationMin: 0, rpe: 0, completed: true, isToday: false },
  { day: 'THU', type: 'intervals', title: 'Intervals', durationMin: 50, rpe: 9, completed: false, isToday: true },
  { day: 'FRI', type: 'easy', title: 'Easy Run', durationMin: 30, rpe: 3, completed: false, isToday: false },
  { day: 'SAT', type: 'tempo', title: 'Tempo Run', durationMin: 45, rpe: 7, completed: false, isToday: false },
  { day: 'SUN', type: 'rest', title: 'Rest Day', durationMin: 0, rpe: 0, completed: false, isToday: false },
];

const INSIGHTS = [
  'Drink 16oz of water within 30 min of waking to jump-start hydration.',
  'Morning sunlight exposure regulates circadian rhythm and improves sleep quality.',
  'Your HRV is trending up — the autonomic nervous system is recovering well.',
  'Include one rest day for every three training days to prevent overtraining.',
  'Protein timing within two hours post-workout maximizes muscle protein synthesis.',
  'Zone 2 training builds your aerobic base without compromising recovery.',
];

// ── Helpers ───────────────────────────────────────────────

function getBriefMessage(score: number): { title: string; body: string } {
  if (score >= 80) {
    return {
      title: "You're primed to train hard today",
      body:
        "Your readiness is peak. Nervous system, sleep, and strain all align. Consider a high-intensity session — this is the day to push your limits.",
    };
  }
  if (score >= 60) {
    return {
      title: 'Ready for a balanced effort',
      body:
        'Solid readiness across the board. A moderate session (tempo or threshold work) will drive fitness without spiking fatigue.',
    };
  }
  if (score >= 40) {
    return {
      title: 'Easy day recommended',
      body:
        'Readiness is below baseline. Zone 2 cardio, mobility, or a light strength circuit will keep momentum without digging a hole.',
    };
  }
  return {
    title: 'Prioritize recovery',
    body:
      'Your system needs rest. Sleep, hydration, and gentle movement only. Pushing today will cost you tomorrow.',
  };
}

function getPriorityStyle(p: Priority) {
  if (p === 'HIGH') return { color: colors.danger, bg: 'rgba(239,68,68,0.15)' };
  if (p === 'MEDIUM') return { color: WARNING, bg: 'rgba(245,166,35,0.15)' };
  return { color: colors.accent, bg: 'rgba(200,241,53,0.15)' };
}

// ── Workout Icon ──────────────────────────────────────────

function WorkoutIcon({ type, size = 22, color }: { type: WorkoutType; size?: number; color?: string }) {
  const c = color ?? colors.accent;
  switch (type) {
    case 'run':
    case 'easy':
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
    case 'strength':
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
    case 'rest':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
            stroke={c}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'cycle':
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
    case 'tempo':
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
    case 'intervals':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 12h3l2-7 4 14 2-7h3"
            stroke={c}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
  }
}

// ── Daily Brief ───────────────────────────────────────────

function DailyBrief() {
  const pulse = useRef(new Animated.Value(1)).current;
  const brief = getBriefMessage(RECOVERY_SCORE);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.3,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulse]);

  return (
    <LinearGradient
      colors={['rgba(200,241,53,0.12)', 'rgba(91,141,239,0.06)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={briefStyles.card}
    >
      <View style={briefStyles.header}>
        <View style={briefStyles.iconContainer}>
          <Animated.View
            style={[
              briefStyles.pulse,
              { transform: [{ scale: pulse }], opacity: pulse.interpolate({ inputRange: [1, 1.3], outputRange: [0.6, 0] }) },
            ]}
          />
          <View style={briefStyles.iconInner}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
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
        </View>

        <View style={briefStyles.badgeRow}>
          <Text style={[typography.label, { color: colors.accent }]}>DAILY BRIEF</Text>
          <View style={briefStyles.scoreBadge}>
            <Text style={[typography.caption, { color: colors.accent, fontSize: 11 }]}>
              {READINESS_LABEL}
            </Text>
            <Text style={[typography.bodyBold, { color: colors.text, marginLeft: 6 }]}>
              {RECOVERY_SCORE}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[typography.h2, { fontSize: 20, marginTop: 16, marginBottom: 10 }]}>
        {brief.title}
      </Text>
      <Text style={[typography.body, { color: colors.muted, lineHeight: 22 }]}>
        {brief.body}
      </Text>
    </LinearGradient>
  );
}

const briefStyles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
  },
  iconInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(200,241,53,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(200,241,53,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(200,241,53,0.20)',
  },
});

// ── Recommendation Card ───────────────────────────────────

function RecommendationCard({
  rec,
  onDismiss,
}: {
  rec: Recommendation;
  onDismiss: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const prio = getPriorityStyle(rec.priority);

  return (
    <TouchableOpacity
      style={recStyles.card}
      onPress={() => setExpanded((e) => !e)}
      activeOpacity={0.85}
    >
      <View style={recStyles.topRow}>
        <View style={[recStyles.priorityBadge, { backgroundColor: prio.bg }]}>
          <Text style={[typography.caption, { color: prio.color, fontSize: 10, fontFamily: 'DMSans_700Bold' }]}>
            {rec.priority}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onDismiss(rec.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={recStyles.dismiss}
        >
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path
              d="M6 6l12 12M18 6L6 18"
              stroke={colors.muted}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>

      <View style={recStyles.body}>
        <View style={recStyles.iconWrap}>
          <WorkoutIcon type={rec.type} size={22} color={prio.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[typography.h3, { marginBottom: 6 }]}>{rec.title}</Text>
          <Text style={[typography.body, { color: colors.muted, lineHeight: 20 }]}>
            {rec.description}
          </Text>
        </View>
      </View>

      <View style={recStyles.footer}>
        <View style={recStyles.duration}>
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={9} stroke={colors.muted} strokeWidth={2} />
            <Path d="M12 8v4l2.5 2.5" stroke={colors.muted} strokeWidth={2} strokeLinecap="round" />
          </Svg>
          <Text style={[typography.caption, { marginLeft: 6 }]}>{rec.durationMin} min</Text>
        </View>
        <Text style={[typography.caption, { color: colors.accent }]}>
          {expanded ? 'Tap to collapse' : 'Tap for details'}
        </Text>
      </View>

      {expanded && (
        <View style={recStyles.details}>
          <Text style={[typography.caption, { marginBottom: 8, color: colors.accent2, letterSpacing: 1.2 }]}>
            WORKOUT DETAILS
          </Text>
          <Text style={[typography.body, { color: colors.text, lineHeight: 22 }]}>
            {rec.details}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const recStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dismiss: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(240,240,248,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(200,241,53,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  duration: { flexDirection: 'row', alignItems: 'center' },
  details: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
});

// ── Weekly Plan ───────────────────────────────────────────

function WeeklyPlan() {
  const [plan, setPlan] = useState<PlanDay[]>(WEEKLY_PLAN);

  const toggleComplete = (idx: number) => {
    setPlan((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, completed: !d.completed } : d)),
    );
  };

  const getRpeColor = (rpe: number) => {
    if (rpe === 0) return colors.muted;
    if (rpe >= 8) return colors.danger;
    if (rpe >= 5) return WARNING;
    return colors.accent;
  };

  return (
    <View style={planStyles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={planStyles.scroll}
      >
        {plan.map((day, idx) => {
          const isRest = day.type === 'rest';
          const rpeColor = getRpeColor(day.rpe);

          return (
            <TouchableOpacity
              key={day.day}
              onPress={() => toggleComplete(idx)}
              activeOpacity={0.7}
              style={[
                planStyles.dayCard,
                day.isToday && planStyles.todayCard,
                isRest && planStyles.restCard,
              ]}
            >
              <Text
                style={[
                  typography.caption,
                  planStyles.dayLabel,
                  day.isToday && { color: colors.accent, fontFamily: 'DMSans_700Bold' },
                ]}
              >
                {day.day}
              </Text>

              <View
                style={[
                  planStyles.iconCircle,
                  isRest && { backgroundColor: 'rgba(240,240,248,0.04)' },
                  day.isToday && !isRest && { backgroundColor: 'rgba(200,241,53,0.15)' },
                ]}
              >
                <WorkoutIcon
                  type={day.type}
                  size={18}
                  color={isRest ? colors.muted : day.isToday ? colors.accent : colors.text}
                />
              </View>

              <Text
                style={[
                  typography.caption,
                  planStyles.durationLabel,
                  isRest && { color: colors.muted },
                ]}
              >
                {isRest ? 'REST' : `${day.durationMin}m`}
              </Text>

              {!isRest && (
                <View style={[planStyles.rpePill, { backgroundColor: `${rpeColor}22`, borderColor: rpeColor }]}>
                  <Text style={[typography.caption, { fontSize: 9, color: rpeColor, fontFamily: 'DMSans_700Bold' }]}>
                    RPE {day.rpe}
                  </Text>
                </View>
              )}

              <View
                style={[
                  planStyles.check,
                  day.completed && { backgroundColor: colors.accent, borderColor: colors.accent },
                ]}
              >
                {day.completed && (
                  <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M5 12l5 5L20 7"
                      stroke={colors.background}
                      strokeWidth={4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const planStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  scroll: { paddingHorizontal: 12, gap: 8 },
  dayCard: {
    width: 68,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  todayCard: {
    backgroundColor: 'rgba(200,241,53,0.06)',
    borderColor: 'rgba(200,241,53,0.25)',
  },
  restCard: { opacity: 0.85 },
  dayLabel: { fontSize: 11, letterSpacing: 1.2, marginBottom: 10 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(240,240,248,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  durationLabel: {
    fontSize: 11,
    color: colors.text,
    marginBottom: 6,
    fontFamily: 'DMSans_500Medium',
  },
  rpePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 8,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ── AI Insight Strip ──────────────────────────────────────

function InsightStrip() {
  const [idx, setIdx] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -8, duration: 400, useNativeDriver: true }),
      ]).start(() => {
        setIdx((i) => (i + 1) % INSIGHTS.length);
        translateY.setValue(8);
        Animated.parallel([
          Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [fade, translateY]);

  return (
    <LinearGradient
      colors={['rgba(91,141,239,0.10)', 'rgba(200,241,53,0.06)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={insightStyles.strip}
    >
      <View style={insightStyles.header}>
        <View style={insightStyles.dot} />
        <Text style={[typography.caption, { color: colors.accent2, fontSize: 11, letterSpacing: 1.5 }]}>
          AI INSIGHT
        </Text>
      </View>
      <Animated.Text
        style={[
          typography.body,
          {
            color: colors.text,
            lineHeight: 22,
            marginTop: 10,
            opacity: fade,
            transform: [{ translateY }],
          },
        ]}
      >
        {INSIGHTS[idx]}
      </Animated.Text>
      <View style={insightStyles.dots}>
        {INSIGHTS.map((_, i) => (
          <View
            key={i}
            style={[
              insightStyles.indicator,
              i === idx && { backgroundColor: colors.accent, width: 14 },
            ]}
          />
        ))}
      </View>
    </LinearGradient>
  );
}

const insightStyles = StyleSheet.create({
  strip: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent2,
  },
  dots: { flexDirection: 'row', gap: 4, marginTop: 14 },
  indicator: {
    width: 6,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(240,240,248,0.15)',
  },
});

// ── Main Screen ───────────────────────────────────────────

export default function CoachScreen() {
  const insets = useSafeAreaInsets();
  const [recs, setRecs] = useState<Recommendation[]>(INITIAL_RECS);

  const handleDismiss = (id: string) => {
    setRecs((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top + 16 }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[typography.caption, { marginBottom: 4 }]}>YOUR AI COACH</Text>
        <Text style={typography.h1}>Today's Plan</Text>
      </View>

      {/* Daily Brief */}
      <View style={styles.section}>
        <DailyBrief />
      </View>

      {/* Recommendations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={typography.label}>RECOMMENDATIONS</Text>
          <Text style={[typography.caption, { color: colors.accent }]}>
            {recs.length} active
          </Text>
        </View>
        {recs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={[typography.body, { color: colors.muted, textAlign: 'center' }]}>
              All caught up.{'\n'}New recommendations arrive after your next sync.
            </Text>
          </View>
        ) : (
          recs.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} onDismiss={handleDismiss} />
          ))
        )}
      </View>

      {/* Weekly Plan */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={typography.label}>WEEKLY PLAN</Text>
          <Text style={[typography.caption, { color: colors.muted }]}>Tap to complete</Text>
        </View>
        <WeeklyPlan />
      </View>

      {/* AI Insight */}
      <View style={styles.section}>
        <InsightStrip />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  section: { marginTop: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
});
