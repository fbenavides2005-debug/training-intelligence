import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import type { AuthStackParamList, TrainingMode } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

const TRAINING_MODES: { value: TrainingMode; label: string; emoji: string; desc: string }[] = [
  { value: 'casual', label: 'Casual', emoji: '🏃', desc: 'Quiero estar mas sano' },
  { value: 'professional', label: 'Pro', emoji: '🏆', desc: 'Soy atleta competitivo' },
  { value: 'health', label: 'Health', emoji: '💚', desc: 'Quiero mejorar mi salud' },
];

export default function RegisterScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { register, isLoading, error, clearError } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [trainingMode, setTrainingMode] = useState<TrainingMode>('casual');
  const [localError, setLocalError] = useState('');

  const handleRegister = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLocalError('');
    clearError();

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setLocalError('Completa todos los campos');
      return;
    }
    if (password.length < 8) {
      setLocalError('La contrasena debe tener al menos 8 caracteres');
      return;
    }

    try {
      await register(
        firstName.trim(),
        lastName.trim(),
        email.trim().toLowerCase(),
        password,
        trainingMode,
      );
    } catch {
      // error is set via context
    }
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={typography.h1}>Crea tu cuenta</Text>
          <Text style={[typography.body, { color: colors.muted, marginTop: 8 }]}>
            Empieza a entrenar mas inteligente
          </Text>
        </View>

        {/* Error */}
        {displayError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{displayError}</Text>
          </View>
        ) : null}

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.label, styles.inputLabel]}>NOMBRE</Text>
              <TextInput
                style={styles.input}
                placeholder="Juan"
                placeholderTextColor={colors.muted}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.label, styles.inputLabel]}>APELLIDO</Text>
              <TextInput
                style={styles.input}
                placeholder="Perez"
                placeholderTextColor={colors.muted}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
          </View>

          <Text style={[typography.label, styles.inputLabel]}>EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="tu@email.com"
            placeholderTextColor={colors.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            editable={!isLoading}
          />

          <Text style={[typography.label, styles.inputLabel]}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimo 8 caracteres"
            placeholderTextColor={colors.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            editable={!isLoading}
          />

          {/* Training Mode Selector */}
          <Text style={[typography.label, styles.inputLabel, { marginTop: 24 }]}>
            COMO ENTRENAS?
          </Text>
          <View style={styles.modeRow}>
            {TRAINING_MODES.map((mode) => {
              const selected = trainingMode === mode.value;
              return (
                <TouchableOpacity
                  key={mode.value}
                  style={[
                    styles.modeCard,
                    selected && styles.modeCardSelected,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setTrainingMode(mode.value);
                  }}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  <Text style={styles.modeEmoji}>{mode.emoji}</Text>
                  <Text
                    style={[
                      typography.bodyBold,
                      { fontSize: 14, textAlign: 'center' },
                      selected && { color: colors.accent },
                    ]}
                  >
                    {mode.label}
                  </Text>
                  <Text
                    style={[
                      typography.caption,
                      { textAlign: 'center', marginTop: 4, fontSize: 11 },
                    ]}
                  >
                    {mode.desc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.accent, '#A8D12E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.buttonText}>Crear Cuenta</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            navigation.navigate('Login');
          }}
          style={styles.footer}
        >
          <Text style={[typography.body, { color: colors.muted }]}>
            Ya tienes cuenta?{' '}
            <Text style={{ color: colors.accent }}>Inicia Sesion</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 32,
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  errorText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
  },
  form: {
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    padding: 16,
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: colors.text,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  modeCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeCardSelected: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(200,241,53,0.06)',
  },
  modeEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 28,
  },
  buttonText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 17,
    color: colors.background,
  },
  footer: {
    alignItems: 'center',
    marginTop: 28,
    paddingBottom: 24,
  },
});
