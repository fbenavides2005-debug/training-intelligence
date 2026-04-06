import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface Props {
  score: number;
  maxScore: number;
  size?: number;
}

export default function ReadinessRing({ score, maxScore, size = 180 }: Props) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / maxScore) * circumference;
  const center = size / 2;

  const getColor = () => {
    if (score >= 75) return colors.accent;
    if (score >= 50) return colors.accent2;
    return colors.danger;
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.cardBorder}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={styles.inner}>
        <Text style={[typography.h1, styles.score, { fontSize: size * 0.22 }]}>
          {score}
        </Text>
        <Text style={[typography.caption, styles.label]}>READINESS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  inner: {
    position: 'absolute',
    alignItems: 'center',
  },
  score: {
    color: colors.text,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 2,
  },
});
