import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const workoutTypes = [
  { id: '1', name: 'Running', icon: '🏃', color: '#C8F135' },
  { id: '2', name: 'Cycling', icon: '🚴', color: '#4A9EFF' },
  { id: '3', name: 'Strength', icon: '🏋️', color: '#EF4444' },
  { id: '4', name: 'Swimming', icon: '🏊', color: '#00BCD4' },
  { id: '5', name: 'HIIT', icon: '⚡', color: '#F5A623' },
];

const recentActivity = [
  { id: '1', type: 'Running', icon: '🏃', date: 'Today · 6:30 AM', duration: '48 min', calories: '520 kcal', distance: '10.4 km', hr: '152 avg', pace: '5:58 /km', rpe: 6 },
  { id: '2', type: 'Strength', icon: '🏋️', date: 'Yesterday · 6:15 PM', duration: '42 min', calories: '380 kcal', distance: null, hr: '138 avg', pace: null, rpe: 7 },
  { id: '3', type: 'Cycling', icon: '🚴', date: 'Mon · 7:00 AM', duration: '61 min', calories: '610 kcal', distance: '28.3 km', hr: '145 avg', pace: '2:09 /km', rpe: 5 },
  { id: '4', type: 'HIIT', icon: '⚡', date: 'Sun · 5:45 PM', duration: '28 min', calories: '340 kcal', distance: null, hr: '168 avg', pace: null, rpe: 9 },
  { id: '5', type: 'Running', icon: '🏃', date: 'Sat · 8:00 AM', duration: '35 min', calories: '390 kcal', distance: '7.2 km', hr: '148 avg', pace: '6:12 /km', rpe: 5 },
];

const weekLoad = [
  { day: 'Mon', minutes: 61, type: 'moderate' },
  { day: 'Tue', minutes: 0, type: 'rest' },
  { day: 'Wed', minutes: 42, type: 'hard' },
  { day: 'Thu', minutes: 48, type: 'moderate', isToday: true },
  { day: 'Fri', minutes: 0, type: 'rest' },
  { day: 'Sat', minutes: 35, type: 'easy' },
  { day: 'Sun', minutes: 28, type: 'hard' },
];

const barColor = (type: string) => {
  if (type === 'easy') return '#C8F135';
  if (type === 'moderate') return '#4A9EFF';
  if (type === 'hard') return '#EF4444';
  return 'rgba(240,240,248,0.1)';
};

const rpeColor = (rpe: number) => rpe >= 8 ? '#EF4444' : rpe >= 5 ? '#F5A623' : '#C8F135';

export default function TrainingScreen() {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<string | null>(null);
  const maxMinutes = Math.max(...weekLoad.map(d => d.minutes), 1);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40 }}>
      <Text style={[typography.h1, styles.title]}>Training</Text>

      <View style={styles.card}>
        <View style={styles.weekHeader}>
          <Text style={styles.sectionTitle}>THIS WEEK</Text>
          <Text style={styles.weekPct}>57% complete</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: "57%" }]} />
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: "#C8F135" }]}>4</Text>
            <Text style={styles.statSub}>/ 7 days</Text>
            <Text style={styles.statLabel}>Active Days</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: "#4A9EFF" }]}>187</Text>
            <Text style={styles.statSub}>min</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: "#EF4444" }]}>1.8k</Text>
            <Text style={styles.statSub}>kcal</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { marginHorizontal: 20, marginTop: 24, marginBottom: 12 }]}>START WORKOUT</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
        {workoutTypes.map(w => (
          <TouchableOpacity key={w.id} onPress={() => Alert.alert("Starting " + w.name + "...", "Your workout is now being tracked.")} style={[styles.workoutCard, { borderColor: w.color + "44" }]}>
            <Text style={styles.workoutIcon}>{w.icon}</Text>
            <Text style={styles.workoutName}>{w.name}</Text>
            <View style={[styles.startBtn, { backgroundColor: w.color }]}>
              <Text style={styles.startBtnText}>START</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[styles.sectionTitle, { marginHorizontal: 20, marginTop: 28, marginBottom: 12 }]}>RECENT ACTIVITY</Text>
      <View style={{ paddingHorizontal: 20, gap: 10 }}>
        {recentActivity.map(a => (
          <TouchableOpacity key={a.id} onPress={() => setExpanded(expanded === a.id ? null : a.id)}>
            <View style={styles.activityCard}>
              <View style={styles.activityRow}>
                <Text style={styles.activityIcon}>{a.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityName}>{a.type}</Text>
                  <Text style={styles.activityDate}>{a.date}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.activityDuration}>{a.duration}</Text>
                  <Text style={styles.activityCals}>{a.calories}</Text>
                </View>
              </View>
              <View style={styles.pillRow}>
                {a.distance && <View style={styles.pill}><Text style={styles.pillText}>📍 {a.distance}</Text></View>}
                <View style={styles.pill}><Text style={styles.pillText}>♥ {a.hr}</Text></View>
                {a.pace && <View style={styles.pill}><Text style={styles.pillText}>⚡ {a.pace}</Text></View>}
                <View style={[styles.pill, { backgroundColor: rpeColor(a.rpe) + "22" }]}>
                  <Text style={[styles.pillText, { color: rpeColor(a.rpe) }]}>RPE {a.rpe}</Text>
                </View>
              </View>
              {expanded === a.id && (
                <View style={styles.detailGrid}>
                  {[["DURATION", a.duration], ["CALORIES", a.calories], ["DISTANCE", a.distance || "—"], ["PACE", a.pace || "—"], ["AVG HR", a.hr], ["RPE", String(a.rpe)]].map(([label, val]) => (
                    <View key={label} style={styles.detailCell}>
                      <Text style={styles.detailLabel}>{label}</Text>
                      <Text style={styles.detailValue}>{val}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { marginHorizontal: 20, marginTop: 28, marginBottom: 12 }]}>WEEKLY LOAD</Text>
      <View style={[styles.card, { marginHorizontal: 20 }]}>
        <View style={styles.legend}>
          {[["Easy", "#C8F135"], ["Mod", "#4A9EFF"], ["Hard", "#EF4444"]].map(([l, c]) => (
            <View key={l} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: c }]} />
              <Text style={styles.legendText}>{l}</Text>
            </View>
          ))}
        </View>
        <View style={styles.chartRow}>
          {weekLoad.map((d, i) => (
            <View key={i} style={styles.barWrapper}>
              <Text style={styles.barValue}>{d.minutes > 0 ? d.minutes + "m" : ""}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { height: d.minutes > 0 ? (d.minutes / maxMinutes) * 80 : 6, backgroundColor: barColor(d.type), opacity: d.type === "rest" ? 0.2 : 1 }]} />
              </View>
              <Text style={[styles.barDay, d.isToday && { color: "#C8F135", fontWeight: "700" }]}>{d.day}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0A0A0F" },
  title: { marginBottom: 20, paddingHorizontal: 20 },
  card: { backgroundColor: "#12121A", borderRadius: 16, padding: 16, marginHorizontal: 20, borderWidth: 1, borderColor: "rgba(240,240,248,0.08)" },
  weekHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  sectionTitle: { color: "rgba(240,240,248,0.45)", fontSize: 11, fontWeight: "700", letterSpacing: 1.5 },
  weekPct: { color: "#C8F135", fontSize: 11, fontWeight: "700" },
  progressTrack: { height: 4, backgroundColor: "rgba(240,240,248,0.08)", borderRadius: 2, marginBottom: 16 },
  progressFill: { height: 4, backgroundColor: "#C8F135", borderRadius: 2 },
  statsRow: { flexDirection: "row", justifyContent: "space-around" },
  stat: { alignItems: "center" },
  statValue: { fontSize: 28, fontWeight: "800" },
  statSub: { color: "rgba(240,240,248,0.45)", fontSize: 11, marginTop: -4 },
  statLabel: { color: "rgba(240,240,248,0.45)", fontSize: 11, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: "rgba(240,240,248,0.08)" },
  workoutCard: { width: 110, backgroundColor: "#12121A", borderRadius: 16, padding: 14, alignItems: "center", borderWidth: 1, gap: 8 },
  workoutIcon: { fontSize: 28 },
  workoutName: { color: "#F0F0F8", fontSize: 13, fontWeight: "600" },
  startBtn: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 6 },
  startBtnText: { color: "#000", fontSize: 11, fontWeight: "800" },
  activityCard: { backgroundColor: "#12121A", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(240,240,248,0.08)" },
  activityRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  activityIcon: { fontSize: 24 },
  activityName: { color: "#F0F0F8", fontSize: 15, fontWeight: "700" },
  activityDate: { color: "rgba(240,240,248,0.45)", fontSize: 12, marginTop: 2 },
  activityDuration: { color: "#F0F0F8", fontSize: 14, fontWeight: "700" },
  activityCals: { color: "rgba(240,240,248,0.45)", fontSize: 12 },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  pill: { backgroundColor: "rgba(240,240,248,0.08)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  pillText: { color: "rgba(240,240,248,0.6)", fontSize: 11 },
  detailGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 12, gap: 8 },
  detailCell: { width: "30%", backgroundColor: "rgba(240,240,248,0.04)", borderRadius: 8, padding: 8 },
  detailLabel: { color: "rgba(240,240,248,0.35)", fontSize: 9, fontWeight: "700", letterSpacing: 1, marginBottom: 4 },
  detailValue: { color: "#F0F0F8", fontSize: 13, fontWeight: "700" },
  legend: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginBottom: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { color: "rgba(240,240,248,0.45)", fontSize: 10 },
  chartRow: { flexDirection: "row", justifyContent: "space-between", height: 120, alignItems: "flex-end" },
  barWrapper: { flex: 1, alignItems: "center" },
  barValue: { color: "rgba(240,240,248,0.45)", fontSize: 9, marginBottom: 4 },
  barTrack: { width: 20, justifyContent: "flex-end" },
  barFill: { width: "100%", borderRadius: 4 },
  barDay: { color: "rgba(240,240,248,0.45)", fontSize: 10, marginTop: 6 },
});
