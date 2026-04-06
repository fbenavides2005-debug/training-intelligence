import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { CoachRecommendation } from '../types';

interface Props {
  recommendation: CoachRecommendation;
}

export default function CoachCard({ recommendation }: Props) {
  return (
    <LinearGradient
      colors={['rgba(200,241,53,0.08)', 'rgba(91,141,239,0.06)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={9} stroke={colors.accent} strokeWidth={2} />
            <Path
              d="M12 8v4l2.5 2.5"
              stroke={colors.accent}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </View>
        <View style={styles.tag}>
          <Text style={[typography.caption, styles.tagText]}>{recommendation.tag}</Text>
        </View>
      </View>
      <Text style={[typography.h3, styles.title]}>{recommendation.title}</Text>
      <Text style={[typography.body, styles.desc]}>{recommendation.description}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(200,241,53,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: 'rgba(91,141,239,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    color: colors.accent2,
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
  },
  title: {
    marginBottom: 8,
  },
  desc: {
    color: colors.muted,
    lineHeight: 22,
  },
});
