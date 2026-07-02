import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { useColors } from '@/hooks/useColors';
import { addCustomer, getCustomer, updateCustomer } from '@/services/customers';
import { getSettings } from '@/services/settingsService';

export default function CustomerAddScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [waterRate, setWaterRate] = useState('10');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const [s] = await Promise.all([getSettings()]);
        setWaterRate(String(s.defaultWaterRate));
        if (isEdit && id) {
          const customer = await getCustomer(id);
          if (customer) {
            setName(customer.name);
            setMobile(customer.mobile);
            setAddress(customer.address);
            setArea(customer.area);
            setWaterRate(String(customer.waterRate));
            setStatus(customer.status);
            setNotes(customer.notes);
          }
        }
      } catch (e: any) {
        console.error('Init error:', e?.message ?? e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id, isEdit]);

  const validate = () => {
    if (!name.trim()) { Alert.alert('Error', 'Customer name is required.'); return false; }
    if (!mobile.trim()) { Alert.alert('Error', 'Mobile number is required.'); return false; }
    if (!area.trim()) { Alert.alert('Error', 'Area is required.'); return false; }
    if (!waterRate || parseFloat(waterRate) <= 0) { Alert.alert('Error', 'Valid water rate is required.'); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const data = { name: name.trim(), mobile: mobile.trim(), address: address.trim(), area: area.trim(), waterRate: parseFloat(waterRate), status, notes: notes.trim() };
      if (isEdit && id) {
        await updateCustomer(id, data);
      } else {
        await addCustomer(data);
      }
      router.back();
    } catch (e: any) {
      const msg = e?.message || e?.code || 'Unknown error';
      Alert.alert('Failed to Save', msg);
    } finally {
      setSaving(false);
    }
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: insets.bottom + 32 },
    label: { fontSize: 13, fontWeight: '600', color: colors.text, fontFamily: 'Inter_600SemiBold', marginBottom: 6, marginTop: 14 },
    input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 9, fontSize: 15, color: colors.text, fontFamily: 'Inter_400Regular', backgroundColor: colors.card },
    inputFocused: { borderColor: colors.primary },
    row: { flexDirection: 'row', gap: 12 },
    flex: { flex: 1 },
    statusRow: { flexDirection: 'row', gap: 12 },
    statusBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1.5 },
    statusText: { fontSize: 14, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
    saveBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 24, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', fontFamily: 'Inter_700Bold' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    sectionTitle: { fontSize: 12, fontWeight: '600', color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5, marginTop: 20, marginBottom: -4, textTransform: 'uppercase' },
  });

  if (loading) return <View style={[s.container, s.center]}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={s.sectionTitle}>Personal Info</Text>
        <Text style={s.label}>Customer Name *</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={colors.mutedForeground} />

        <Text style={s.label}>Mobile Number *</Text>
        <TextInput style={s.input} value={mobile} onChangeText={setMobile} placeholder="10-digit number" placeholderTextColor={colors.mutedForeground} keyboardType="phone-pad" />

        <Text style={s.sectionTitle}>Location</Text>
        <Text style={s.label}>Address</Text>
        <TextInput style={[s.input, { height: 70, textAlignVertical: 'top', paddingTop: 10 }]} value={address} onChangeText={setAddress} placeholder="Street address" placeholderTextColor={colors.mutedForeground} multiline numberOfLines={2} />

        <Text style={s.label}>Area *</Text>
        <TextInput style={s.input} value={area} onChangeText={setArea} placeholder="Colony / Area / Ward" placeholderTextColor={colors.mutedForeground} />

        <Text style={s.sectionTitle}>Billing</Text>
        <Text style={s.label}>Water Rate (per unit) *</Text>
        <TextInput style={s.input} value={waterRate} onChangeText={setWaterRate} placeholder="e.g. 10" placeholderTextColor={colors.mutedForeground} keyboardType="decimal-pad" />

        <Text style={s.label}>Status</Text>
        <View style={s.statusRow}>
          <TouchableOpacity
            style={[s.statusBtn, { borderColor: status === 'active' ? colors.success : colors.border, backgroundColor: status === 'active' ? '#D1FAE5' : colors.card }]}
            onPress={() => setStatus('active')}
          >
            <Text style={[s.statusText, { color: status === 'active' ? '#065F46' : colors.mutedForeground }]}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.statusBtn, { borderColor: status === 'inactive' ? colors.destructive : colors.border, backgroundColor: status === 'inactive' ? '#FEF2F2' : colors.card }]}
            onPress={() => setStatus('inactive')}
          >
            <Text style={[s.statusText, { color: status === 'inactive' ? '#DC2626' : colors.mutedForeground }]}>Inactive</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.sectionTitle}>Additional</Text>
        <Text style={s.label}>Notes</Text>
        <TextInput style={[s.input, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]} value={notes} onChangeText={setNotes} placeholder="Any notes or remarks..." placeholderTextColor={colors.mutedForeground} multiline numberOfLines={3} />

        <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>{isEdit ? 'Update Customer' : 'Add Customer'}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
