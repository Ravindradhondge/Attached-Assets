import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
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
import { getCustomers } from '@/services/customers';
import { addEntry, getEntry, updateEntry } from '@/services/entries';
import { Customer } from '@/types';

function todayStr() { return new Date().toISOString().split('T')[0]; }

export default function EntryAddScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  const [date, setDate] = useState(todayStr());
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [waterQty, setWaterQty] = useState('');
  const [rate, setRate] = useState('');
  const [totalAmount, setTotalAmount] = useState('0');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('pending');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | ''>('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    async function init() {
      const c = await getCustomers();
      const activeCustomers = c.filter((cust) => cust.status === 'active');
      setCustomers(activeCustomers);
      if (isEdit && id) {
        const entry = await getEntry(id);
        if (entry) {
          setDate(entry.date);
          const cust = c.find((cu) => cu.id === entry.customerId) ?? null;
          setSelectedCustomer(cust);
          setWaterQty(String(entry.waterQuantity));
          setRate(String(entry.rate));
          setTotalAmount(String(entry.totalAmount));
          setPaymentStatus(entry.paymentStatus);
          setPaymentMethod(entry.paymentMethod);
          setRemarks(entry.remarks);
        }
      }
      setLoading(false);
    }
    init();
  }, [id, isEdit]);

  useEffect(() => {
    const qty = parseFloat(waterQty) || 0;
    const r = parseFloat(rate) || 0;
    setTotalAmount((qty * r).toFixed(0));
  }, [waterQty, rate]);

  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    setRate(String(c.waterRate));
    setShowPicker(false);
  };

  const validate = () => {
    if (!date) { Alert.alert('Error', 'Date is required.'); return false; }
    if (!selectedCustomer) { Alert.alert('Error', 'Please select a customer.'); return false; }
    if (!waterQty || parseFloat(waterQty) <= 0) { Alert.alert('Error', 'Valid water quantity is required.'); return false; }
    if (!rate || parseFloat(rate) <= 0) { Alert.alert('Error', 'Valid rate is required.'); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validate() || !selectedCustomer) return;
    setSaving(true);
    try {
      const data = {
        date, customerId: selectedCustomer.id, customerName: selectedCustomer.name,
        waterQuantity: parseFloat(waterQty), rate: parseFloat(rate),
        totalAmount: parseFloat(totalAmount), paymentStatus, paymentMethod,
        remarks: remarks.trim(),
      };
      if (isEdit && id) {
        await updateEntry(id, data);
        Alert.alert('Success', 'Entry updated.');
      } else {
        await addEntry(data);
        Alert.alert('Success', 'Entry added.');
      }
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to save entry.');
    } finally {
      setSaving(false);
    }
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: insets.bottom + 32 },
    label: { fontSize: 13, fontWeight: '600', color: colors.text, fontFamily: 'Inter_600SemiBold', marginBottom: 6, marginTop: 14 },
    input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 9, fontSize: 15, color: colors.text, fontFamily: 'Inter_400Regular', backgroundColor: colors.card },
    picker: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 9, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card },
    pickerText: { flex: 1, fontSize: 15, color: colors.text, fontFamily: 'Inter_400Regular' },
    row: { flexDirection: 'row', gap: 12 },
    flex: { flex: 1 },
    totalCard: { backgroundColor: colors.accent, borderRadius: 14, padding: 16, marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    totalLabel: { fontSize: 14, color: colors.primary, fontFamily: 'Inter_500Medium' },
    totalVal: { fontSize: 24, fontWeight: '700', color: colors.primary, fontFamily: 'Inter_700Bold' },
    statusRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
    statusBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1.5 },
    statusText: { fontSize: 14, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
    methodRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
    saveBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 24, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', fontFamily: 'Inter_700Bold' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    modal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1, borderBottomColor: colors.border },
    modalTitle: { fontSize: 16, fontWeight: '600', color: colors.text, fontFamily: 'Inter_600SemiBold' },
    modalItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
    modalItemIcon: { width: 36, height: 36, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
    modalItemName: { fontSize: 14, fontWeight: '600', color: colors.text, fontFamily: 'Inter_600SemiBold', flex: 1 },
    modalItemSub: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    sectionTitle: { fontSize: 12, fontWeight: '600', color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5, marginTop: 20, marginBottom: -4, textTransform: 'uppercase' },
  });

  if (loading) return <View style={[s.container, s.center]}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={s.sectionTitle}>Entry Details</Text>
        <Text style={s.label}>Date *</Text>
        <TextInput style={s.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.mutedForeground} />

        <Text style={s.label}>Customer *</Text>
        <TouchableOpacity style={s.picker} onPress={() => setShowPicker(true)}>
          <Text style={[s.pickerText, !selectedCustomer && { color: colors.mutedForeground }]}>
            {selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.customerId})` : 'Select customer...'}
          </Text>
          <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>

        <Text style={s.sectionTitle}>Measurement</Text>
        <View style={s.row}>
          <View style={s.flex}>
            <Text style={s.label}>Water Quantity *</Text>
            <TextInput style={s.input} value={waterQty} onChangeText={setWaterQty} placeholder="0" placeholderTextColor={colors.mutedForeground} keyboardType="decimal-pad" />
          </View>
          <View style={s.flex}>
            <Text style={s.label}>Rate (per unit)</Text>
            <TextInput style={s.input} value={rate} onChangeText={setRate} placeholder="0" placeholderTextColor={colors.mutedForeground} keyboardType="decimal-pad" />
          </View>
        </View>

        <View style={s.totalCard}>
          <Text style={s.totalLabel}>Total Amount</Text>
          <Text style={s.totalVal}>₹{totalAmount}</Text>
        </View>

        <Text style={s.sectionTitle}>Payment</Text>
        <Text style={s.label}>Payment Status</Text>
        <View style={s.statusRow}>
          <TouchableOpacity
            style={[s.statusBtn, { borderColor: paymentStatus === 'pending' ? colors.warning : colors.border, backgroundColor: paymentStatus === 'pending' ? colors.muted : colors.card }]}
            onPress={() => { setPaymentStatus('pending'); setPaymentMethod(''); }}
          >
            <Text style={[s.statusText, { color: paymentStatus === 'pending' ? colors.warning : colors.mutedForeground }]}>Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.statusBtn, { borderColor: paymentStatus === 'paid' ? colors.success : colors.border, backgroundColor: paymentStatus === 'paid' ? colors.muted : colors.card }]}
            onPress={() => { setPaymentStatus('paid'); if (!paymentMethod) setPaymentMethod('cash'); }}
          >
            <Text style={[s.statusText, { color: paymentStatus === 'paid' ? colors.success : colors.mutedForeground }]}>Paid</Text>
          </TouchableOpacity>
        </View>

        {paymentStatus === 'paid' && (
          <>
            <Text style={s.label}>Payment Method</Text>
            <View style={s.methodRow}>
              {(['cash', 'upi'] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[s.statusBtn, { borderColor: paymentMethod === m ? colors.primary : colors.border, backgroundColor: paymentMethod === m ? colors.accent : colors.card }]}
                  onPress={() => setPaymentMethod(m)}
                >
                  <Text style={[s.statusText, { color: paymentMethod === m ? colors.primary : colors.mutedForeground }]}>{m.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={s.label}>Remarks</Text>
        <TextInput style={[s.input, { height: 70, textAlignVertical: 'top', paddingTop: 10 }]} value={remarks} onChangeText={setRemarks} placeholder="Optional remarks..." placeholderTextColor={colors.mutedForeground} multiline />

        <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>{isEdit ? 'Update Entry' : 'Save Entry'}</Text>}
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showPicker} transparent animationType="slide">
        <View style={s.modal}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select Customer</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {customers.map((c) => (
                <TouchableOpacity key={c.id} style={[s.modalItem, selectedCustomer?.id === c.id && { backgroundColor: colors.accent }]} onPress={() => handleSelectCustomer(c)}>
                  <View style={s.modalItemIcon}>
                    <Feather name="user" size={16} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.modalItemName}>{c.name}</Text>
                    <Text style={s.modalItemSub}>{c.customerId} · {c.area} · ₹{c.waterRate}/unit</Text>
                  </View>
                  {selectedCustomer?.id === c.id && <Feather name="check" size={16} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
