import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const mockRecommendations = [
  { id: '1', priority: 'HIGH', type: 'Run', title: 'Zone 2 Easy Run', description: 'Your HRV is trending up. A 45-min easy aerobic run will build base fitness.', duration: '45 min', detail: 'Keep HR below 145bpm. Focus on nasal breathing. Good day for a long easy effort.' },
  { id: '2', priority: 'MEDIUM', type: 'Strength', title: 'Upper Body Strength', description: 'Low strain from yesterday makes today ideal for pushing upper body.', duration: '40 min', detail: '3x8 bench press, 3x10 rows, 3x12 shoulder press. RPE 7/10.' },
  { id: '3', priority: 'LOW', type: 'Recovery', title: 'Mobility & Stretching', description: 'Add a 15-min mobility session to improve your readiness for tomorrow.', duration: '15 min', detail: 'Focus on hip flexors, thoracic spine, and hamstrings.' },
];

const weekPlan = [
  { day: 'MON', type: 'Run', duration: '45m', rpe: 4, done: true },
  { day: 'TUE', type: 'Strength', duration: '40m', rpe: 7, done: true },
  { day: 'WED', type: 'REST', duration: '', rpe: 0, done: false },
  { day: 'THU', type: 'Run', duration: '60m', rpe: 6, done: false, isToday: true },
  { day: 'FRI', type: 'HIIT', duration: '30m', rpe: 8, done: false },
  { day: 'SAT', type: 'Cycle', duration: '90m', rpe: 5, done: false },
  { day: 'SUN', type: 'REST', duration: '', rpe: 0, done: false },
];

const insights = [
  'Your HRV has improved 12% this week — keep the momentum.',
  'Best training window today: 10am–12pm based on your patterns.',
  'You\'ve hit your weekly load target 3 weeks in a row. 🔥',
  'Sleep consistency is your #1 recovery lever right now.',
  'Zone 2 training builds the aerobic base elite athletes rely on.',
  'Recovery score above 80 — green light for intensity today.',
];

export default function CoachScreen() {
  const insets = useSafeAreaInsets();
  const [recs, setRecs] = useState(mockRecommendations);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [plan, setPlan] = useState(weekPlan);
  const [insightIndex, setInsightIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setInsightIndex(i => (i + 1) % insights.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const priorityColor = (p: string) => p === 'HIGH' ? colors.danger : p === 'MEDIUM' ? '#F5A623' : colors.accent;
  const rpeColor = (rpe: number) => rpe >= 8 ? colors.danger : rpe >= 5 ? '#F5A623' : colors.accent;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40 }}>
      <Text style={[typography.h1, { marginBottom: 20, paddingHorizontal: 20 }]}>AI Coach</Text>

      {/* Daily Brief */}
      <View style={[styles.card, styles.briefCard, { marginHorizontal: 20 }]}>
        <View style={styles.briefHeader}>
          <Animated.View style={[styles.pulseIcon, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={{ fontSize: 18 }}>✦</Text>
          </Animated.View>
          <Text style={styles.briefLabel}>DAILY BRIEF</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>PEAK 82</Text></View>
        </View>
        <Text style={styles.briefTitle}>You're primed to train hard today</Text>
        <Text style={styles.briefBody}>HRV trending up, sleep quality excellent. This is a green light day — push intensity with confidence.</Text>
      </View>

      {/* Recommendations */}
      <View style={{ marginTop: 28, paddingHorizontal: 20 }}>
        <Text style={styles.sectionTitle}>RECOMMENDATIONS <Text style={styles.sectionCount}>{recs.length} active</Text></Text>
        {recs.length === 0 && (
          <View style={[styles.card, styles.emptyCard]}>
            <Text style={styles.emptyText}>All caught up! Check back tomorrow.</Text>
          </View>
        )}
        {recs.map(rec => (
          <View key={rec.id} style={styles.card}>
            <View style={styles.recHeader}>
              <View style={[styles.priorityBadge, { backgroundColor: priorityColor(rec.priority) + '22', borderColor: priorityColor(rec.priority) }]}>
                <Text style={[styles.priorityText, { color: priorityColor(rec.priority) }]}>{rec.priority}</Text>
              </View>
              <View style={styles.durationPill}>
                <Text style={styles.durationText}>{rec.duration}</Text>
              </View>
              <TouchableOpacity onPress={() => setRecs(r => r.filter(x => x.id !== rec.id))} style={styles.dismissBtn}>
                <Text style={styles.dismissText}>✕</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setExpanded(expanded === rec.id ? null : rec.id)}>
              <Text style={styles.recTitle}>{rec.title}</Text>
              <Text style={styles.recDesc}>{rec.description}</Text>
              {expanded === rec.id && (
                <View style={styles.expandedDetail}>
                  <Text style={styles.detailText}>{rec.detail}</Text>
                </View>
              )}
              <Text style={styles.expandHint}>{expanded === rec.id ? '▲ Less' : '▼ Details'}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Weekly Plan */}
      <View style={{ marginTop: 28, paddingHorizontal: 20 }}>
        <Text style={styles.sectionTitle}>WEEKLY PLAN</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
          {plan.map((day, i) => (
            <TouchableOpacity key={i} onPress={() => setPlan(p => p.map((d, j) => j === i ? { ...d, done: !d.done } : d))}>
              <View style={[styles.dayCard, day.isToday && styles.dayCardToday, day.done && styles.dayCardDone]}>
                <Text style={[styles.dayLabel, day.isToday && { color: colors.accent }]}>{day.day}</Text>
                <Text style={styles.dayType}>{day.type}</Text>
                {day.duration ? <Text style={styles.dayDuration}>{day.duration}</Text> : null}
                {day.rpe > 0 && (
                  <View style={[styles.rpePill, { backgroundColor: rpeColor(day.rpe) + '22' }]}>
                    <Text style={[styles.rpeText, { color: rpeColor(day.rpe) }]}>RPE {day.rpe}</Text>
                  </View>
                )}
                <Text style={styles.checkmark}>{day.done ? '✓' : '○'}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* AI Insight */}
      <View style={[styles.card, styles.insightCard, { marginHorizontal: 20, marginTop: 28 }]}>
        <Text style={styles.insightLabel}>💡 INSIGHT</Text>
        <Animated.Text style={[styles.insightText, { opacity: fadeAnim }]}>{insights[insightIndex]}</Animated.Text>
        <View style={styles.dots}>
          {insights.map((_, i) => (
            <View key={i} style={[styles.dot, i === insightIndex && styles.dotActive]} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(240,240,248,0.08)' },
  briefCard: { borderColor: colors.accent + '33' },
  briefHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  pulseIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accent + '22', alignItems: 'center', justifyContent: 'center' },
  briefLabel: { color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, flex: 1 },
  badge: { backgroundColor: colors.accent, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: '#000', fontSize: 10, fontWeight: '800' },
  briefTitle: { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 8 },
  briefBody: { color: 'rgba(240,240,248,0.6)', fontSize: 14, lineHeight: 20 },
  sectionTitle: { color: 'rgba(240,240,248,0.45)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },
  sectionCount: { color: colors.accent },
  emptyCard: { alignItems: 'center', padding: 24 },
  emptyText: { color: 'rgba(240,240,248,0.45)', fontSize: 14 },
  recHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  priorityBadge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  priorityText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  durationPill: { backgroundColor: 'rgba(240,240,248,0.08)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  durationText: { color: 'rgba(240,240,248,0.6)', fontSize: 11 },
  dismissBtn: { marginLeft: 'auto', padding: 4 },
  dismissText: { color: 'rgba(240,240,248,0.3)', fontSize: 16 },
  recTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 6 },
  recDesc: { color: 'rgba(240,240,248,0.6)', fontSize: 13, lineHeight: 18 },
  expandedDetail: { marginTop: 12, padding: 12, backgroundColor: 'rgba(200,241,53,0.06)', borderRadius: 10 },
  detailText: { color: 'rgba(240,240,248,0.8)', fontSize: 13, lineHeight: 20 },
  expandHint: { color: colors.accent, fontSize: 11, marginTop: 8, fontWeight: '600' },
  dayCard: { width: 80, marginRight: 10, backgroundColor: colors.surface, borderRadius: 14, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(240,240,248,0.08)' },
  dayCardToday: { borderColor: colors.accent, backgroundColor: colors.accent + '11' },
  dayCardDone: { opacity: 0.6 },
  dayLabel: { color: 'rgba(240,240,248,0.45)', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  dayType: { color: colors.text, fontSize: 11, fontWeight: '600', marginBottom: 4, textAlign: 'center' },
  dayDuration: { color: 'rgba(240,240,248,0.45)', fontSize: 10, marginBottom: 6 },
  rpePill: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 8 },
  rpeText: { fontSize: 9, fontWeight: '700' },
  checkmark: { color: colors.accent, fontSize: 16, fontWeight: '700' },
  insightCard: { borderColor: colors.accent + '22' },
  insightLabel: { color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 },
  insightText: { color: colors.text, fontSize: 15, lineHeight: 22, fontWeight: '500', marginBottom: 14 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(240,240,248,0.2)' },
  dotActive: { width: 16, backgroundColor: colors.accent },
});
