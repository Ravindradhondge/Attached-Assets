import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useAuth } from '@/contexts/AuthContext';
import { useColors } from '@/hooks/useColors';
import { getSettings, saveSettings } from '@/services/settingsService';
import { AppSettings } from '@/types';

const CURRENCIES = ['₹', '$', '€', '£', '¥'];
const BILLING_DAYS = [1, 2, 5, 10, 15];

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signOut, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AppSettings>({ businessName: '', defaultCurrency: '₹', defaultWaterRate: 10, billingDay: 1 });
  const [customDay, setCustomDay] = useState('');
  const [useCustomDay, setUseCustomDay] = useState(false);

  const load = useCallback(async () => {
    const s = await getSettings();
    setForm(s);
    const isPreset = BILLING_DAYS.includes(s.billingDay);
    setUseCustomDay(!isPreset);
    if (!isPreset) setCustomDay(String(s.billingDay));
  }, []);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]));

  const handleSave = async () => {
    if (!form.businessName.trim()) { Alert.alert('Error', 'Business name is required.'); return; }
    if (form.defaultWaterRate <= 0) { Alert.alert('Error', 'Water rate must be greater than 0.'); return; }
    const billingDay = useCustomDay ? parseInt(customDay) || 1 : form.billingDay;
    if (billingDay < 1 || billingDay > 28) { Alert.alert('Error', 'Billing day must be between 1 and 28.'); return; }
    setSaving(true);
    try {
      await saveSettings({ ...form, billingDay });
      Alert.alert('Success', 'Settings saved.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 20, paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16), paddingBottom: 16 },
    title: { fontSize: 22, fontWeight: '700', color: colors.text, fontFamily: 'Inter_700Bold' },
    scroll: { paddingHorizontal: 20, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 100) },
    section: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 18, marginBottom: 16 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    sectionIcon: { width: 34, height: 34, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.text, fontFamily: 'Inter_600SemiBold' },
    label: { fontSize: 13, fontWeight: '600', color: colors.text, fontFamily: 'Inter_600SemiBold', marginBottom: 6, marginTop: 14 },
    input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 9, fontSize: 15, color: colors.text, fontFamily: 'Inter_400Regular', backgroundColor: colors.background, marginBottom: 2 },
    chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    chip: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1.5, minWidth: 46, alignItems: 'center' },
    chipText: { fontSize: 14, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
    saveBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 4, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', fontFamily: 'Inter_700Bold' },
    logoutSection: { backgroundColor: '#FEF2F2', borderRadius: 16, borderWidth: 1, borderColor: '#FECACA', padding: 18, marginBottom: 16 },
    logoutBtn: { backgroundColor: '#DC2626', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
    logoutText: { color: '#fff', fontSize: 15, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
    userRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    hint: { fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 4, marginBottom: 8 },
  });

  if (loading) return <View style={[s.container, s.center]}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.header}><Text style={s.title}>Settings</Text></View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={s.sectionIcon}><Feather name="briefcase" size={15} color={colors.primary} /></View>
            <Text style={s.sectionTitle}>Business Settings</Text>
          </View>
          <Text style={s.label}>Business Name</Text>
          <TextInput style={s.input} value={form.businessName} onChangeText={(v) => setForm((f) => ({ ...f, businessName: v }))} placeholder="e.g. Sharma Water Supply" placeholderTextColor={colors.mutedForeground} />
          <Text style={s.label}>Default Water Rate (per unit)</Text>
          <TextInput style={s.input} value={String(form.defaultWaterRate)} onChangeText={(v) => setForm((f) => ({ ...f, defaultWaterRate: parseFloat(v) || 0 }))} keyboardType="decimal-pad" placeholder="e.g. 10" placeholderTextColor={colors.mutedForeground} />
          <Text style={s.label}>Default Currency</Text>
          <View style={s.chipRow}>
            {CURRENCIES.map((c) => (
              <TouchableOpacity key={c} style={[s.chip, { borderColor: form.defaultCurrency === c ? colors.primary : colors.border, backgroundColor: form.defaultCurrency === c ? colors.accent : colors.background }]} onPress={() => setForm((f) => ({ ...f, defaultCurrency: c }))}>
                <Text style={[s.chipText, { color: form.defaultCurrency === c ? colors.primary : colors.mutedForeground }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionIcon, { backgroundColor: '#EDE9FE' }]}><Feather name="calendar" size={15} color="#7C3AED" /></View>
            <Text style={s.sectionTitle}>Billing Date</Text>
          </View>
          <Text style={s.hint}>The day of the month when bills are generated.</Text>
          <View style={s.chipRow}>
            {BILLING_DAYS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[s.chip, { borderColor: !useCustomDay && form.billingDay === d ? colors.primary : colors.border, backgroundColor: !useCustomDay && form.billingDay === d ? colors.accent : colors.background }]}
                onPress={() => { setForm((f) => ({ ...f, billingDay: d })); setUseCustomDay(false); }}
              >
                <Text style={[s.chipText, { color: !useCustomDay && form.billingDay === d ? colors.primary : colors.mutedForeground }]}>{d}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[s.chip, { borderColor: useCustomDay ? colors.primary : colors.border, backgroundColor: useCustomDay ? colors.accent : colors.background }]}
              onPress={() => setUseCustomDay(true)}
            >
              <Text style={[s.chipText, { color: useCustomDay ? colors.primary : colors.mutedForeground }]}>Custom</Text>
            </TouchableOpacity>
          </View>
          {useCustomDay && (
            <>
              <Text style={s.label}>Custom Day (1–28)</Text>
              <TextInput style={s.input} value={customDay} onChangeText={setCustomDay} keyboardType="number-pad" placeholder="e.g. 7" placeholderTextColor={colors.mutedForeground} />
            </>
          )}
        </View>

        <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Save Settings</Text>}
        </TouchableOpacity>

        <View style={s.logoutSection}>
          <View style={s.userRow}>
            <Feather name="user" size={14} color="#DC2626" />
            <Text style={{ fontSize: 13, color: '#DC2626', fontFamily: 'Inter_400Regular' }}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={s.logoutBtn} onPress={() => Alert.alert('Sign Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: signOut },
          ])}>
            <Text style={s.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
