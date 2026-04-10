import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import * as apiService from '../services/apiService';
import type { TrainingMode, NormalizedHealthResponse } from '../types';

const TRAINING_MODES: { key: TrainingMode; label: string; desc: string }[] = [
  { key: 'casual', label: 'Casual', desc: 'Stay active & healthy' },
  { key: 'professional', label: 'Professional', desc: 'Peak performance' },
  { key: 'health', label: 'Health', desc: 'Wellness focused' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, refreshUser } = useAuth();

  const [history, setHistory] = useState<NormalizedHealthResponse[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [savingMode, setSavingMode] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const data = await apiService.getHealthHistory(30);
      setHistory(data);
    } catch {
      // ignore
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleModeChange = async (mode: TrainingMode) => {
    if (mode === user?.profile?.trainingMode) return;
    setSavingMode(true);
    try {
      await apiService.updateProfile({ trainingMode: mode });
      await refreshUser();
    } catch {
      Alert.alert('Error', 'Could not update training mode');
    } finally {
      setSavingMode(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  // ── Stats ───────────────────────────────────────────────

  const totalWorkoutDays = history.filter(
    (d) => (d.activity?.exerciseMin ?? 0) > 0,
  ).length;
  const totalMinutes = history.reduce(
    (s, d) => s + (d.activity?.exerciseMin ?? 0),
    0,
  );
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Calculate streak (consecutive days with exercise from today backwards)
  const streak = (() => {
    let count = 0;
    const sorted = [...history].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    for (const day of sorted) {
      if ((day.activity?.exerciseMin ?? 0) > 0) count++;
      else break;
    }
    return count;
  })();

  // ── Render ──────────────────────────────────────────────

  const firstName = user?.profile?.firstName ?? '';
  const lastName = user?.profile?.lastName ?? '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Athlete';
  const email = user?.email ?? '';
  const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'A';
  const currentMode = user?.profile?.trainingMode ?? 'casual';

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: insets.top + 16 }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={typography.h1}>Profile</Text>

      {/* User Card */}
      <View style={styles.userCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>{initials}</Text>
        </View>
        <Text style={[typography.h2, { marginTop: 14 }]}>{fullName}</Text>
        <Text style={[typography.body, { color: colors.muted, marginTop: 4 }]}>{email}</Text>
        {user?.profile?.sport && (
          <View style={styles.sportBadge}>
            <Text style={[typography.caption, { color: colors.accent }]}>
              {user.profile.sport.toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Training Mode */}
      <View style={styles.section}>
        <Text style={[typography.label, styles.sectionLabel]}>TRAINING MODE</Text>
        {TRAINING_MODES.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[styles.modeCard, currentMode === m.key && styles.modeCardActive]}
            onPress={() => handleModeChange(m.key)}
            activeOpacity={0.7}
            disabled={savingMode}
          >
            <View style={styles.modeRadio}>
              {currentMode === m.key && <View style={styles.modeRadioFill} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={typography.bodyBold}>{m.label}</Text>
              <Text style={[typography.caption, { marginTop: 2 }]}>{m.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={[typography.label, styles.sectionLabel]}>30-DAY STATS</Text>
        {loadingStats ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                  stroke={colors.accent}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={[typography.h2, { color: colors.accent, marginTop: 8 }]}>
                {totalWorkoutDays}
              </Text>
              <Text style={typography.caption}>Workouts</Text>
            </View>
            <View style={styles.statCard}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={12} r={9} stroke={colors.accent2} strokeWidth={2} />
                <Path d="M12 8v4l2.5 2.5" stroke={colors.accent2} strokeWidth={2} strokeLinecap="round" />
              </Svg>
              <Text style={[typography.h2, { color: colors.accent2, marginTop: 8 }]}>
                {totalHours}
              </Text>
              <Text style={typography.caption}>Hours</Text>
            </View>
            <View style={styles.statCard}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M4 17l4-4 3 3 5-7 4 4"
                  stroke={colors.danger}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={[typography.h2, { color: colors.danger, marginTop: 8 }]}>
                {streak}
              </Text>
              <Text style={typography.caption}>Day Streak</Text>
            </View>
          </View>
        )}
      </View>

      {/* Connected Devices */}
      <View style={styles.section}>
        <Text style={[typography.label, styles.sectionLabel]}>CONNECTED DEVICES</Text>
        <View style={styles.deviceCard}>
          <View style={styles.deviceRow}>
            <View style={[styles.deviceIcon, { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 21C12 21 4 14.5 4 9a4 4 0 018 0 4 4 0 018 0c0 5.5-8 12-8 12z"
                  stroke={colors.danger}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={typography.bodyBold}>Apple Health</Text>
              <Text style={[typography.caption, { marginTop: 2 }]}>
                {user?.connectedSources?.appleHealth ? 'Connected' : 'Not connected'}
              </Text>
            </View>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: user?.connectedSources?.appleHealth
                    ? colors.success
                    : colors.muted,
                },
              ]}
            />
          </View>
          <View style={[styles.deviceRow, { borderTopWidth: 1, borderTopColor: colors.cardBorder, paddingTop: 14, marginTop: 14 }]}>
            <View style={[styles.deviceIcon, { backgroundColor: 'rgba(91,141,239,0.12)' }]}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.accent2 }}>W</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={typography.bodyBold}>WHOOP</Text>
              <Text style={[typography.caption, { marginTop: 2 }]}>
                {user?.connectedSources?.whoop?.connected ? 'Connected' : 'Not connected'}
              </Text>
            </View>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: user?.connectedSources?.whoop?.connected
                    ? colors.success
                    : colors.muted,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={[typography.label, styles.sectionLabel]}>SETTINGS</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <Text style={typography.body}>Units</Text>
            <Text style={[typography.bodyBold, { color: colors.accent }]}>
              {user?.settings?.units === 'imperial' ? 'Imperial' : 'Metric'}
            </Text>
          </View>
          <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: colors.cardBorder }]}>
            <Text style={typography.body}>Week starts on</Text>
            <Text style={[typography.bodyBold, { color: colors.accent }]}>
              {user?.settings?.weekStartsOn === 'sunday' ? 'Sunday' : 'Monday'}
            </Text>
          </View>
          <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: colors.cardBorder }]}>
            <Text style={typography.body}>Notifications</Text>
            <Text style={[typography.bodyBold, { color: user?.settings?.notifications ? colors.success : colors.muted }]}>
              {user?.settings?.notifications ? 'On' : 'Off'}
            </Text>
          </View>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
        <Text style={[typography.bodyBold, { color: colors.danger }]}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  section: { marginTop: 28 },
  sectionLabel: { marginBottom: 14 },
  userCard: {
    marginTop: 20,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLargeText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 28,
    color: colors.background,
  },
  sportBadge: {
    marginTop: 10,
    backgroundColor: 'rgba(200,241,53,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 10,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 14,
  },
  modeCardActive: { borderColor: colors.accent },
  modeRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeRadioFill: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  deviceCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  deviceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deviceIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  logoutBtn: {
    marginTop: 32,
    backgroundColor: 'rgba(239,68,68,0.10)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.20)',
  },
});
