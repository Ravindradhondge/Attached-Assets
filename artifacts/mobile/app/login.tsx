import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFirebaseAuthError, useAuth } from '@/contexts/AuthContext';
import { useColors } from '@/hooks/useColors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(getFirebaseAuthError(err?.code ?? ''));
    } finally {
      setLoading(false);
    }
  };

  const s = StyleSheet.create({
    outer: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
    header: { alignItems: 'center', marginBottom: 40 },
    logo: { width: 72, height: 72, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
    title: { fontSize: 26, fontWeight: '700', color: colors.text, fontFamily: 'Inter_700Bold', marginBottom: 4 },
    subtitle: { fontSize: 14, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    card: { backgroundColor: colors.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    errorBox: { backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#FECACA' },
    errorText: { color: '#DC2626', fontSize: 13, fontFamily: 'Inter_400Regular' },
    label: { fontSize: 13, fontWeight: '600', color: colors.text, fontFamily: 'Inter_600SemiBold', marginBottom: 6 },
    inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 13 : 10, gap: 10, backgroundColor: colors.background, marginBottom: 16 },
    input: { flex: 1, fontSize: 15, color: colors.text, fontFamily: 'Inter_400Regular', padding: 0 },
    btn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', marginTop: 8, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    btnDisabled: { opacity: 0.7 },
    btnText: { color: colors.primaryForeground, fontSize: 16, fontWeight: '700', fontFamily: 'Inter_700Bold' },
    footer: { marginTop: 24, alignItems: 'center' },
    footerText: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
  });

  return (
    <KeyboardAvoidingView style={s.outer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <View style={s.logo}>
            <Feather name="droplet" size={32} color="#fff" />
          </View>
          <Text style={s.title}>Water Billing</Text>
          <Text style={s.subtitle}>Sign in to your admin account</Text>
        </View>

        <View style={s.card}>
          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={s.label}>Email Address</Text>
          <View style={s.inputRow}>
            <Feather name="mail" size={16} color={colors.mutedForeground} />
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="admin@example.com"
              placeholderTextColor={colors.mutedForeground}
              returnKeyType="next"
            />
          </View>

          <Text style={s.label}>Password</Text>
          <View style={s.inputRow}>
            <Feather name="lock" size={16} color={colors.mutedForeground} />
            <TextInput
              style={s.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="Enter your password"
              placeholderTextColor={colors.mutedForeground}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Only authorized administrators can access this system</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
