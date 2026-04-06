// TrainIQ — Expo Snack compatible single-file version
// Paste this into https://snack.expo.dev as App.tsx

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import {
  useFonts,
  Syne_600SemiBold,
  Syne_700Bold,
} from '@expo-google-fonts/syne';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';

// ── Theme ──────────────────────────────────────────────

const C = {
  background: '#0A0A0F',
  surface: '#12121A',
  accent: '#C8F135',
  accent2: '#5B8DEF',
  text: '#F0F0F8',
  muted: 'rgba(240,240,248,0.45)',
  danger: '#EF4444',
  border: 'rgba(240,240,248,0.08)',
};

// ── Components ─────────────────────────────────────────

function ReadinessRing({ score, max, size = 180 }: { score: number; max: number; size?: number }) {
  const sw = 12;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const progress = (score / max) * circ;
  const cx = size / 2;
  const color = score >= 75 ? C.accent : score >= 50 ? C.accent2 : C.danger;

  return (
    <View style={{ width: size, height: size, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cx} r={r} stroke={C.border} strokeWidth={sw} fill="none" />
        <Circle
          cx={cx} cy={cx} r={r}
          stroke={color} strokeWidth={sw} fill="none"
          strokeDasharray={`${progress} ${circ}`}
          strokeLinecap="round"
          rotation={-90} origin={`${cx}, ${cx}`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Syne_700Bold', fontSize: size * 0.22, color: C.text }}>{score}</Text>
        <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, color: C.muted, letterSpacing: 2 }}>READINESS</Text>
      </View>
    </View>
  );
}

function MetricCard({ label, value, unit, color }: { label: string; value: string; unit?: string; color: string }) {
  return (
    <View style={s.metricCard}>
      <Text style={s.label}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
        <Text style={{ fontFamily: 'Syne_700Bold', fontSize: 22, color }}>{value}</Text>
        {unit && <Text style={[s.caption, { marginBottom: 3 }]}>{unit}</Text>}
      </View>
    </View>
  );
}

function CoachCard() {
  return (
    <LinearGradient
      colors={['rgba(200,241,53,0.08)', 'rgba(91,141,239,0.06)']}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={s.coachCard}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <View style={s.coachIcon}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={9} stroke={C.accent} strokeWidth={2} />
            <Path d="M12 8v4l2.5 2.5" stroke={C.accent} strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </View>
        <View style={s.tag}>
          <Text style={[s.caption, { color: C.accent2, fontFamily: 'DMSans_500Medium' }]}>AI INSIGHT</Text>
        </View>
      </View>
      <Text style={{ fontFamily: 'Syne_600SemiBold', fontSize: 17, color: C.text, marginBottom: 8 }}>
        Easy aerobic session recommended
      </Text>
      <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 15, color: C.muted, lineHeight: 22 }}>
        Your HRV is trending up and recovery is strong. A moderate zone-2 session will build your aerobic base without accumulating excess fatigue.
      </Text>
    </LinearGradient>
  );
}

function WeeklyLoadChart() {
  const data = [
    { day: 'Mon', load: 65 }, { day: 'Tue', load: 80 }, { day: 'Wed', load: 45 },
    { day: 'Thu', load: 90 }, { day: 'Fri', load: 30 }, { day: 'Sat', load: 70 },
    { day: 'Today', load: 55 },
  ];
  return (
    <View style={s.chartCard}>
      <Text style={s.sectionLabel}>WEEKLY LOAD</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 20 }}>
        {data.map((d) => {
          const h = (d.load / 100) * 120;
          const today = d.day === 'Today';
          return (
            <View key={d.day} style={{ flex: 1, alignItems: 'center' }}>
              <View style={{ height: 120, justifyContent: 'flex-end', alignItems: 'center' }}>
                {today ? (
                  <LinearGradient colors={[C.accent, C.accent2]} style={{ width: 20, height: h, borderRadius: 10 }} />
                ) : (
                  <View style={{ width: 20, height: h, borderRadius: 10, backgroundColor: 'rgba(200,241,53,0.25)' }} />
                )}
              </View>
              <Text style={[s.caption, { marginTop: 10 }, today && { color: C.accent }]}>{d.day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ── Screens ────────────────────────────────────────────

function HomeScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={[s.screen, { paddingTop: insets.top }]} contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <View>
          <Text style={s.caption}>GOOD MORNING</Text>
          <Text style={{ fontFamily: 'Syne_700Bold', fontSize: 28, color: C.text }}>Hey, Athlete</Text>
        </View>
        <View style={s.avatar}><Text style={s.avatarText}>A</Text></View>
      </View>

      <View style={{ marginTop: 28 }}>
        <ReadinessRing score={80} max={100} />
      </View>

      <View style={{ marginTop: 28 }}>
        <Text style={s.sectionLabel}>RECOVERY SNAPSHOT</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <MetricCard label="Sleep" value="7.4" unit="hrs" color={C.accent2} />
          <MetricCard label="HRV" value="68" unit="ms" color={C.accent} />
          <MetricCard label="Strain" value="12.3" color={C.danger} />
        </View>
      </View>

      <View style={{ marginTop: 28 }}>
        <Text style={s.sectionLabel}>AI COACH</Text>
        <View style={{ marginTop: 14 }}><CoachCard /></View>
      </View>

      <View style={{ marginTop: 28 }}><WeeklyLoadChart /></View>

      <LinearGradient
        colors={['rgba(200,241,53,0.10)', 'rgba(91,141,239,0.08)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={s.insightStrip}
      >
        <Text style={[s.caption, { color: C.accent, marginBottom: 4 }]}>INSIGHT</Text>
        <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 15, color: C.text }}>
          Your training load this week is 12% below target. Consider adding a tempo session tomorrow to stay on track.
        </Text>
      </LinearGradient>
    </ScrollView>
  );
}

function PlaceholderScreen({ title, subtitle }: { title: string; subtitle: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.screen, { padding: 20, paddingTop: insets.top + 16 }]}>
      <Text style={{ fontFamily: 'Syne_700Bold', fontSize: 28, color: C.text }}>{title}</Text>
      <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 15, color: C.muted, marginTop: 8 }}>{subtitle}</Text>
    </View>
  );
}

function TrainingScreen() { return <PlaceholderScreen title="Training" subtitle="Your training plan and session history will appear here." />; }
function CoachScreen() { return <PlaceholderScreen title="AI Coach" subtitle="Personalized recommendations and coaching insights will appear here." />; }
function RecoveryScreen() { return <PlaceholderScreen title="Recovery" subtitle="Detailed recovery metrics from WHOOP and Apple Health will appear here." />; }
function ProfileScreen() { return <PlaceholderScreen title="Profile" subtitle="Your profile settings and connected accounts will appear here." />; }

// ── Navigation ─────────────────────────────────────────

type TabName = 'Home' | 'Training' | 'Coach' | 'Recovery' | 'Profile';

function TabIcon({ name, focused }: { name: TabName; focused: boolean }) {
  const color = focused ? C.accent : C.muted;
  const paths: Record<TabName, React.ReactNode> = {
    Home: <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={color} strokeWidth={2} strokeLinejoin="round" />,
    Training: <Path d="M6 4v16M18 4v16M2 8h4M18 8h4M2 16h4M18 16h4M6 12h12" stroke={color} strokeWidth={2} strokeLinecap="round" />,
    Coach: <><Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} /><Path d="M8 12l2.5 2.5L16 9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></>,
    Recovery: <Path d="M12 21C12 21 4 14.5 4 9a4 4 0 018 0 4 4 0 018 0c0 5.5-8 12-8 12z" stroke={color} strokeWidth={2} strokeLinejoin="round" />,
    Profile: <><Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={2} /><Path d="M4 21v-1a6 6 0 0112 0v1" stroke={color} strokeWidth={2} strokeLinecap="round" /></>,
  };
  return <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">{paths[name]}</Svg>;
}

const Tab = createBottomTabNavigator();

// ── App ────────────────────────────────────────────────

export default function App() {
  const [fontsLoaded] = useFonts({ Syne_600SemiBold, Syne_700Bold, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: C.background, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color={C.accent} /></View>;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon name={route.name as TabName} focused={focused} />,
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.muted,
        tabBarStyle: { backgroundColor: C.surface, borderTopColor: C.border, borderTopWidth: 1, height: 88, paddingTop: 8, paddingBottom: 28 },
        tabBarLabelStyle: { fontFamily: 'DMSans_500Medium', fontSize: 11, marginTop: 4 },
      })}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Training" component={TrainingScreen} />
        <Tab.Screen name="Coach" component={CoachScreen} />
        <Tab.Screen name="Recovery" component={RecoveryScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ── Styles ─────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.background },
  caption: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: C.muted },
  label: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: C.muted, marginBottom: 8 },
  sectionLabel: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Syne_700Bold', fontSize: 18, color: C.background },
  metricCard: { flex: 1, backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
  coachCard: { borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border },
  coachIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(200,241,53,0.12)', alignItems: 'center', justifyContent: 'center' },
  tag: { backgroundColor: 'rgba(91,141,239,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  chartCard: { backgroundColor: C.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border },
  insightStrip: { marginTop: 28, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: C.border },
});
