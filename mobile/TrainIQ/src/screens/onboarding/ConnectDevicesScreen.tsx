import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import ProgressIndicator from './ProgressIndicator';

type DeviceKey = 'appleHealth' | 'whoop';

interface Device {
  key: DeviceKey;
  name: string;
  description: string;
  accent: string;
  iconBg: string;
  icon: React.ReactNode;
}

const DEVICES: Device[] = [
  {
    key: 'appleHealth',
    name: 'Apple Health',
    description: 'Workouts, heart rate, sleep, and activity',
    accent: '#EF4444',
    iconBg: 'rgba(239,68,68,0.12)',
    icon: (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 21C12 21 4 14.5 4 9a4 4 0 018 0 4 4 0 018 0c0 5.5-8 12-8 12z"
          stroke="#EF4444"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </Svg>
    ),
  },
  {
    key: 'whoop',
    name: 'WHOOP',
    description: 'Recovery, strain, and HRV in real time',
    accent: colors.accent2,
    iconBg: 'rgba(91,141,239,0.12)',
    icon: (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.accent2 }}>
          W
        </Text>
      </View>
    ),
  },
];

export default function ConnectDevicesScreen({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [connected, setConnected] = useState<Record<DeviceKey, boolean>>({
    appleHealth: false,
    whoop: false,
  });

  const handleConnect = (key: DeviceKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setConnected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFinish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete();
  };

  const handleSkip = () => {
    Haptics.selectionAsync();
    onComplete();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.header}>
        <ProgressIndicator step={3} total={3} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[typography.h1, styles.title]}>Connect your devices</Text>
        <Text style={[typography.body, styles.subtitle]}>
          We sync your recovery and training data automatically. Add sources to
          personalize your coaching.
        </Text>

        <View style={styles.list}>
          {DEVICES.map((device) => {
            const isConnected = connected[device.key];
            return (
              <View key={device.key} style={styles.card}>
                <View style={[styles.iconWrap, { backgroundColor: device.iconBg }]}>
                  {device.icon}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={typography.bodyBold}>{device.name}</Text>
                  <Text style={[typography.caption, { marginTop: 2 }]}>
                    {device.description}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.connectBtn,
                    isConnected && styles.connectBtnActive,
                  ]}
                  onPress={() => handleConnect(device.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      typography.caption,
                      {
                        fontFamily: 'DMSans_700Bold',
                        color: isConnected ? colors.accent : colors.text,
                      },
                    ]}
                  >
                    {isConnected ? 'Connected' : 'Connect'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={styles.hint}>
          <Text style={[typography.caption, { lineHeight: 18 }]}>
            You can add or remove sources anytime from your profile.
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={handleFinish}
        activeOpacity={0.85}
      >
        <Text style={[typography.bodyBold, { color: colors.background }]}>
          Finish Setup
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={handleSkip}
        activeOpacity={0.6}
      >
        <Text style={[typography.caption, { color: colors.muted }]}>
          Skip for now
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 8,
    marginBottom: 24,
  },
  content: {
    paddingBottom: 24,
  },
  title: {
    marginBottom: 10,
  },
  subtitle: {
    color: colors.muted,
    marginBottom: 28,
    lineHeight: 22,
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: 'rgba(240,240,248,0.04)',
  },
  connectBtnActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(200,241,53,0.10)',
  },
  hint: {
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(240,240,248,0.03)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  skipBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
});
