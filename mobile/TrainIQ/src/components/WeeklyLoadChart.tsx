import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { WeeklyLoad } from '../types';

interface Props {
  data: WeeklyLoad[];
}

export default function WeeklyLoadChart({ data }: Props) {
  const maxLoad = Math.max(...data.map((d) => d.max));

  return (
    <View style={styles.container}>
      <Text style={[typography.label, styles.title]}>WEEKLY LOAD</Text>
      <View style={styles.chart}>
        {data.map((item) => {
          const height = (item.load / maxLoad) * 120;
          const isToday = item.day === 'Today';
          return (
            <View key={item.day} style={styles.barCol}>
              <View style={[styles.barTrack, { height: 120 }]}>
                {isToday ? (
                  <LinearGradient
                    colors={[colors.accent, colors.accent2]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[styles.bar, { height }]}
                  />
                ) : (
                  <View
                    style={[
                      styles.bar,
                      { height, backgroundColor: 'rgba(200,241,53,0.25)' },
                    ]}
                  />
                )}
              </View>
              <Text
                style={[
                  typography.caption,
                  styles.dayLabel,
                  isToday && { color: colors.accent },
                ]}
              >
                {item.day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  title: {
    marginBottom: 20,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: 20,
    borderRadius: 10,
  },
  dayLabel: {
    marginTop: 10,
  },
});
