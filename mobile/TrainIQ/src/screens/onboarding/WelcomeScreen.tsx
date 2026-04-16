import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import ProgressIndicator from './ProgressIndicator';

export default function WelcomeScreen({ onNext }: { onNext: () => void }) {
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onNext();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.header}>
        <ProgressIndicator step={1} total={3} />
      </View>

      <View style={styles.hero}>
        <View style={styles.logoWrap}>
          <LinearGradient
            colors={['rgba(200,241,53,0.20)', 'rgba(91,141,239,0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGlow}
          />
          <View style={styles.logo}>
            <Svg width={52} height={52} viewBox="0 0 24 24" fill="none">
              <Path
                d="M4 17l4-4 3 3 5-7 4 4"
                stroke={colors.accent}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        </View>

        <Text style={[typography.h1, styles.wordmark]}>TrainIQ</Text>
        <Text style={[typography.body, styles.tagline]}>
          AI-powered training that adapts to your recovery, goals, and life.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handlePress}
          activeOpacity={0.85}
        >
          <Text style={[typography.bodyBold, { color: colors.background }]}>
            Get Started
          </Text>
        </TouchableOpacity>
        <Text style={[typography.caption, styles.footnote]}>
          Takes less than a minute
        </Text>
      </View>
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
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  logoWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  logo: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontSize: 40,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  tagline: {
    textAlign: 'center',
    color: colors.muted,
    lineHeight: 22,
    maxWidth: 320,
  },
  footer: {
    alignItems: 'center',
    gap: 12,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  footnote: {
    marginTop: 4,
  },
});
