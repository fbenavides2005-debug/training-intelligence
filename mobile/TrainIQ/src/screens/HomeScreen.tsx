import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { getWhoopRecovery, getWhoopSleep, whoopStatus } from '../services/whoopService';

const mockData = {
  readiness: 80,
  sleep: 7.4,
  hrv: 68,
  strain: 12.3,
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'GOOD MORNING';
  if (h < 18) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [data, setData] = useState(mockData);

  useEffect(() => {
    async function loadData() {
      try {
        const status = await whoopStatus();
        if (status.connected) {
          const [recovery, sleep] = await Promise.all([
            getWhoopRecovery(),
            getWhoopSleep(),
          ]);
          if (recovery) {
            setIsLive(true);
            const sleepHours = sleep
              ? (sleep.stage_summary.total_in_bed_time_milli - sleep.stage_summary.total_awake_time_milli) / 1000 / 60 / 60
              : mockData.sleep;
            setData({
              readiness: Math.round(recovery.recovery_score),
              hrv: Math.round(recovery.hrv_rmssd_milli),
              sleep: Math.round(sleepHours * 10) / 10,
              strain: mockData.strain,
            });
          }
        }
      } catch (e) {
        console.warn('Failed to load WHOOP data, using mock');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const d = data;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40 }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={[typography.h1, { color: colors.text }]}>Hey, Felipe</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>F</Text>
        </View>
      </View>

      {isLive && (
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>WHOOP LIVE</Text>
        </View>
      )}

      <View style={styles.ringContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.accent} />
        ) : (
          <View style={[styles.ring, { borderColor: d.readiness >= 67 ? colors.accent : d.readiness >= 34 ? '#F5A623' : '#EF4444' }]}>
            <Text style={styles.ringScore}>{d.readiness}</Text>
            <Text style={styles.ringLabel}>READINESS</Text>
          </View>
        )}
      </View>

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

      <View style={styles.coachCard}>
        <Text style={styles.coachBadge}>AI INSIGHT</Text>
        <Text style={styles.coachTitle}>
          {d.readiness >= 67 ? 'High recovery — time to push' : d.readiness >= 34 ? 'Moderate recovery — stay balanced' : 'Low recovery — prioritize rest'}
        </Text>
        <Text style={styles.coachBody}>
          {d.readiness >= 67
            ? 'Your body is ready for intense training today. HRV is strong and sleep was solid.'
            : d.readiness >= 34
            ? 'Your body is in maintenance mode. A moderate aerobic session will keep you progressing.'
            : 'Focus on recovery today. Sleep, hydration, and light movement will help you bounce back.'}
        </Text>
      </View>

      <View style={styles.insightCard}>
        <Text style={styles.insightLabel}>READINESS</Text>
        <Text style={styles.insightText}>
          {isLive
            ? `Live data from WHOOP. Recovery score ${d.readiness}%, HRV ${d.hrv}ms.`
            : 'Connect WHOOP in Profile to see your real biometric data here.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0A0A0F' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  greeting: { color: 'rgba(240,240,248,0.45)', fontSize: 12, fontWeight: '600', letterSpacing: 1.5, marginBottom: 4 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#C8F135', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#000', fontSize: 18, fontWeight: '800' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', backgroundColor: '#C8F13522', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 16, gap: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#C8F135' },
  liveText: { color: '#C8F135', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  ringContainer: { alignItems: 'center', marginBottom: 32, minHeight: 160, justifyContent: 'center' },
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
  insightCard: { marginHorizontal: 20, backgroundColor: '#12121A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#C8F13522' },
  insightLabel: { color: '#C8F135', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  insightText: { color: 'rgba(240,240,248,0.8)', fontSize: 14, lineHeight: 20 },
});
