import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { RecoveryMetric } from '../types';

interface Props {
  metric: RecoveryMetric;
}

function TrendArrow({ trend, color }: { trend?: string; color: string }) {
  if (!trend || trend === 'neutral') return null;
  const d = trend === 'up' ? 'M4 8l4-4 4 4' : 'M4 4l4 4 4-4';
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      <Path d={d} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export default function MetricCard({ metric }: Props) {
  return (
    <View style={styles.card}>
      <Text style={[typography.caption, styles.label]}>{metric.label}</Text>
      <View style={styles.valueRow}>
        <Text style={[typography.h2, { color: metric.color }]}>{metric.value}</Text>
        {metric.unit && (
          <Text style={[typography.caption, styles.unit]}>{metric.unit}</Text>
        )}
        <TrendArrow trend={metric.trend} color={metric.color} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  label: {
    marginBottom: 8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  unit: {
    marginBottom: 3,
  },
});
