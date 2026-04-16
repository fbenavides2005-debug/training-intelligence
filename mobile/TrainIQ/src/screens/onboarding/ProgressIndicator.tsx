import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default function ProgressIndicator({
  step,
  total,
}: {
  step: number;
  total: number;
}) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.segment, i < step && styles.segmentActive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(240,240,248,0.10)',
  },
  segmentActive: {
    backgroundColor: colors.accent,
  },
});
