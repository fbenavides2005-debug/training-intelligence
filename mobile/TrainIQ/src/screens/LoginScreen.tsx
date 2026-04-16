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
import type { AuthStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLocalError('');
    clearError();

    if (!email.trim() || !password) {
      setLocalError('Completa todos los campos');
      return;
    }

    try {
      await login(email.trim().toLowerCase(), password);
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
        {/* Brand */}
        <View style={styles.brand}>
          <Text style={[typography.h1, styles.logo]}>TrainIQ</Text>
          <Text style={[typography.body, styles.subtitle]}>
            Entrena inteligente. Recupera mejor.
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
            placeholder="Tu contrasena"
            placeholderTextColor={colors.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            editable={!isLoading}
          />

          <TouchableOpacity
            onPress={handleLogin}
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
                <Text style={styles.buttonText}>Iniciar Sesion</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            navigation.navigate('Register');
          }}
          style={styles.footer}
        >
          <Text style={[typography.body, { color: colors.muted }]}>
            No tienes cuenta?{' '}
            <Text style={{ color: colors.accent }}>Registrate</Text>
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
    justifyContent: 'center',
  },
  brand: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 36,
    color: colors.accent,
    letterSpacing: 2,
  },
  subtitle: {
    color: colors.muted,
    marginTop: 8,
    textAlign: 'center',
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
    marginTop: 32,
    paddingBottom: 24,
  },
});
