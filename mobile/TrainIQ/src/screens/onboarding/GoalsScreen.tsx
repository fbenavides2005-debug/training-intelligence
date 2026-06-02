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
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import ProgressIndicator from './ProgressIndicator';

type GoalKey = 'performance' | 'health' | 'weightLoss' | 'recovery';

interface Goal {
  key: GoalKey;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const GOALS: Goal[] = [
  {
    key: 'performance',
    title: 'Performance',
    description: 'Train for peak athletic output',
    icon: (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
          stroke={colors.accent}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </Svg>
    ),
  },
  {
    key: 'health',
    title: 'Health',
    description: 'Build sustainable daily fitness',
    icon: (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 21C12 21 4 14.5 4 9a4 4 0 018 0 4 4 0 018 0c0 5.5-8 12-8 12z"
          stroke={colors.accent}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </Svg>
    ),
  },
  {
    key: 'weightLoss',
    title: 'Weight Loss',
    description: 'Burn fat while keeping strength',
    icon: (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="M4 17l4-4 3 3 5-7 4 4"
          stroke={colors.accent}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
  },
  {
    key: 'recovery',
    title: 'Recovery',
    description: 'Rebuild and prevent burnout',
    icon: (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={9} stroke={colors.accent} strokeWidth={2} />
        <Path
          d="M12 7v5l3 2"
          stroke={colors.accent}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    ),
  },
];

export default function GoalsScreen({ onNext }: { onNext: () => void }) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<GoalKey | null>(null);

  const handleSelect = (key: GoalKey) => {
    Haptics.selectionAsync();
    setSelected(key);
  };

  const handleContinue = () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onNext();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.header}>
        <ProgressIndicator step={2} total={3} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[typography.h1, styles.title]}>What brings you here?</Text>
        <Text style={[typography.body, styles.subtitle]}>
          Pick your primary goal. You can always change this later.
        </Text>

        <View style={styles.list}>
          {GOALS.map((goal) => {
            const isActive = selected === goal.key;
            return (
              <TouchableOpacity
                key={goal.key}
                style={[styles.card, isActive && styles.cardActive]}
                onPress={() => handleSelect(goal.key)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                  {goal.icon}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={typography.bodyBold}>{goal.title}</Text>
                  <Text style={[typography.caption, { marginTop: 2 }]}>
                    {goal.description}
                  </Text>
                </View>
                <View style={[styles.radio, isActive && styles.radioActive]}>
                  {isActive && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.primaryBtn, !selected && styles.primaryBtnDisabled]}
        onPress={handleContinue}
        activeOpacity={0.85}
        disabled={!selected}
      >
        <Text
          style={[
            typography.bodyBold,
            { color: selected ? colors.background : colors.muted },
          ]}
        >
          Continue
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
  cardActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(200,241,53,0.05)',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(200,241,53,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(200,241,53,0.18)',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.accent,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: 'rgba(240,240,248,0.08)',
  },
});
