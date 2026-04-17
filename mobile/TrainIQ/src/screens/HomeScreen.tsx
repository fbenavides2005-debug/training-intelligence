import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const mockData = {
  name: 'Felipe',
  readiness: 80,
  sleep: 7.4,
  hrv: 68,
  strain: 12.3,
  weekLoad: [
    { day: 'Sat', minutes: 45 },
    { day: 'Sun', minutes: 0 },
    { day: 'Mon', minutes: 61 },
    { day: 'Tue', minutes: 42 },
    { day: 'Wed', minutes: 35 },
    { day: 'Thu', minutes: 48 },
    { day: 'Today', minutes: 30 },
  ],
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'GOOD MORNING';
  if (h < 18) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const d = mockData;
  const maxMin = Math.max(...d.weekLoad.map(w => w.minutes), 1);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={[typography.h1, { color: colors.text }]}>Hey, {d.name}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{d.name[0]}</Text>
        </View>
      </View>

      {/* Readiness Ring */}
      <View style={styles.ringContainer}>
        <View style={[styles.ring, { borderColor: colors.accent }]}>
          <Text style={styles.ringScore}>{d.readiness}</Text>
          <Text style={styles.ringLabel}>READINESS</Text>
        </View>
      </View>

      {/* Recovery Snapshot */}
      <Text style={styles.sectionTitle}>RECOVERY SNAPSHOT</Text>
      <View style={styles.snapshotRow}>
        <View style={styles.snapshotCard}>
          <Text style={styles.snapshotLabel}>Sleep</Text>
          <Text style={[styles.snapshotValue, { color: '#4A9EFF' }]}>{d.sleep}<Text style={styles.snapshotUnit}> hrs</Text></Text>
        </View>
        <View style={styles.snapshotCard}>
          <Text style={styles.snapshotLabel}>HRV</Text>
          <Text style={[styles.snapshotValue, { color: colors.accent }]}>{d.hrv}<Text style={styles.snapshotUnit}> ms</Text></Text>
        </View>
        <View style={styles.snapshotCard}>
          <Text style={styles.snapshotLabel}>Strain</Text>
          <Text style={[styles.snapshotValue, { color: '#EF4444' }]}>{d.strain}</Text>
        </View>
      </View>

      {/* AI Coach Card */}
      <View style={styles.coachCard}>
        <Text style={styles.coachBadge}>AI INSIGHT</Text>
        <Text style={styles.coachTitle}>Easy aerobic session recommended</Text>
        <Text style={styles.coachBody}>Your HRV is trending up and recovery is strong. A moderate zone-2 session will build your aerobic base without accumulating excess fatigue.</Text>
      </View>

      {/* Weekly Load */}
      <View style={styles.weekCard}>
        <Text style={styles.sectionTitle}>WEEKLY LOAD</Text>
        <View style={styles.chartRow}>
          {d.weekLoad.map((w, i) => (
            <View key={i} style={styles.barWrapper}>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, {
                  height: w.minutes > 0 ? (w.minutes / maxMin) * 80 : 4,
                  backgroundColor: w.day === 'Today' ? colors.accent : colors.accent + '66',
                  opacity: w.minutes === 0 ? 0.2 : 1,
                }]} />
              </View>
              <Text style={[styles.barDay, w.day === 'Today' && { color: colors.accent, fontWeight: '700' }]}>{w.day}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Insight Strip */}
      <View style={styles.insightCard}>
        <Text style={styles.insightLabel}>READINESS</Text>
        <Text style={styles.insightText}>Your training load this week is 12% below target. Consider adding a tempo session tomorrow to stay on track.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0A0A0F' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 24 },
  greeting: { color: 'rgba(240,240,248,0.45)', fontSize: 12, fontWeight: '600', letterSpacing: 1.5, marginBottom: 4 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#C8F135', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#000', fontSize: 18, fontWeight: '800' },
  ringContainer: { alignItems: 'center', marginBottom: 32 },
  ring: { width: 160, height: 160, borderRadius: 80, borderWidth: 8, alignItems: 'center', justifyContent: 'center' },
  ringScore: { color: '#F0F0F8', fontSize: 48, fontWeight: '800' },
  ringLabel: { color: 'rgba(240,240,248,0.45)', fontSize: 11, letterSpacing: 1.5 },
  sectionTitle: { color: 'rgba(240,240,248,0.45)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginHorizontal: 20, marginBottom: 12 },
  snapshotRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  snapshotCard: { flex: 1, backgroundColor: '#12121A', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(240,240,248,0.08)' },
  snapshotLabel: { color: 'rgba(240,240,248,0.45)', fontSize: 11, marginBottom: 6 },
  snapshotValue: { fontSize: 24, fontWeight: '800' },
  snapshotUnit: { fontSize: 12, fontWeight: '400' },
  coachCard: { marginHorizontal: 20, backgroundColor: '#12121A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#C8F13533', marginBottom: 20 },
  coachBadge: { color: '#C8F135', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  coachTitle: { color: '#F0F0F8', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  coachBody: { color: 'rgba(240,240,248,0.6)', fontSize: 13, lineHeight: 20 },
  weekCard: { marginHorizontal: 20, backgroundColor: '#12121A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(240,240,248,0.08)', marginBottom: 16 },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', height: 100, alignItems: 'flex-end', marginTop: 12 },
  barWrapper: { flex: 1, alignItems: 'center' },
  barTrack: { width: 20, justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 4 },
  barDay: { color: 'rgba(240,240,248,0.45)', fontSize: 9, marginTop: 6 },
  insightCard: { marginHorizontal: 20, backgroundColor: '#12121A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#C8F13522' },
  insightLabel: { color: '#C8F135', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  insightText: { color: 'rgba(240,240,248,0.8)', fontSize: 14, lineHeight: 20 },
});
