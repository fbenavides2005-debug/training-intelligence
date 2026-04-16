import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { TrainingMode } from '../types';

// ── Mock Data ─────────────────────────────────────────────

const PROFILE = {
  firstName: 'Felipe',
  lastName: 'Benavides',
  email: 'felipe@trainiq.app',
  sport: 'Running',
};

const STATS_30D = {
  workouts: 18,
  hours: 24.7,
  streak: 6,
};

const CONNECTED = {
  appleHealth: true,
  whoop: false,
};

const SETTINGS_INFO = {
  units: 'Metric',
  weekStartsOn: 'Monday',
  notifications: true,
};

const TRAINING_MODES: { key: TrainingMode; label: string; desc: string }[] = [
  { key: 'casual', label: 'Casual', desc: 'Stay active & healthy' },
  { key: 'professional', label: 'Professional', desc: 'Peak performance' },
  { key: 'health', label: 'Health', desc: 'Wellness focused' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [currentMode, setCurrentMode] = useState<TrainingMode>('professional');

  const fullName = `${PROFILE.firstName} ${PROFILE.lastName}`;
  const initials = `${PROFILE.firstName.charAt(0)}${PROFILE.lastName.charAt(0)}`.toUpperCase();

  const handleModeChange = (mode: TrainingMode) => {
    if (mode === currentMode) return;
    Haptics.selectionAsync();
    setCurrentMode(mode);
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive' },
    ]);
  };

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
        <Text style={[typography.body, { color: colors.muted, marginTop: 4 }]}>
          {PROFILE.email}
        </Text>
        <View style={styles.sportBadge}>
          <Text style={[typography.caption, { color: colors.accent }]}>
            {PROFILE.sport.toUpperCase()}
          </Text>
        </View>
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
              {STATS_30D.workouts}
            </Text>
            <Text style={typography.caption}>Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Circle cx={12} cy={12} r={9} stroke={colors.accent2} strokeWidth={2} />
              <Path d="M12 8v4l2.5 2.5" stroke={colors.accent2} strokeWidth={2} strokeLinecap="round" />
            </Svg>
            <Text style={[typography.h2, { color: colors.accent2, marginTop: 8 }]}>
              {STATS_30D.hours}
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
              {STATS_30D.streak}
            </Text>
            <Text style={typography.caption}>Day Streak</Text>
          </View>
        </View>
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
                {CONNECTED.appleHealth ? 'Connected' : 'Not connected'}
              </Text>
            </View>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: CONNECTED.appleHealth ? colors.success : colors.muted,
                },
              ]}
            />
          </View>
          <View
            style={[
              styles.deviceRow,
              { borderTopWidth: 1, borderTopColor: colors.cardBorder, paddingTop: 14, marginTop: 14 },
            ]}
          >
            <View style={[styles.deviceIcon, { backgroundColor: 'rgba(91,141,239,0.12)' }]}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.accent2 }}>W</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={typography.bodyBold}>WHOOP</Text>
              <Text style={[typography.caption, { marginTop: 2 }]}>
                {CONNECTED.whoop ? 'Connected' : 'Not connected'}
              </Text>
            </View>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: CONNECTED.whoop ? colors.success : colors.muted,
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
              {SETTINGS_INFO.units}
            </Text>
          </View>
          <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: colors.cardBorder }]}>
            <Text style={typography.body}>Week starts on</Text>
            <Text style={[typography.bodyBold, { color: colors.accent }]}>
              {SETTINGS_INFO.weekStartsOn}
            </Text>
          </View>
          <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: colors.cardBorder }]}>
            <Text style={typography.body}>Notifications</Text>
            <Text
              style={[
                typography.bodyBold,
                { color: SETTINGS_INFO.notifications ? colors.success : colors.muted },
              ]}
            >
              {SETTINGS_INFO.notifications ? 'On' : 'Off'}
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
