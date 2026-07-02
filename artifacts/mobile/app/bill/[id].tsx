import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { deleteBill, getBills, markBillPaid, updateBill } from '@/services/bills';
import { getEntries } from '@/services/entries';
import { downloadBillPDF, sendWhatsApp } from '@/services/pdfService';
import { getSettings } from '@/services/settingsService';
import { AppSettings, DailyEntry, MonthlyBill } from '@/types';
import { useFocusEffect } from 'expo-router';

export default function BillDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bill, setBill] = useState<MonthlyBill | null>(null);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ businessName: '', defaultCurrency: '₹', defaultWaterRate: 10, billingDay: 1 });
  const [pdfLoading, setPdfLoading] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payMode, setPayMode] = useState<'cash' | 'upi' | 'bank'>('cash');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const [bills, allEntries, s] = await Promise.all([getBills(), getEntries(), getSettings()]);
    const found = bills.find((b) => b.id === id) ?? null;
    setBill(found);
    if (found) {
      setEntries(allEntries.filter((e) => e.customerId === found.customerId && e.date.startsWith(found.billingMonth)));
      setPayAmount(String(found.grandTotal));
    }
    setSettings(s);
  }, [id]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]));

  const handlePay = async () => {
    if (!bill) return;
    const amount = parseFloat(payAmount) || 0;
    if (amount <= 0) { Alert.alert('Error', 'Enter a valid amount.'); return; }
    setSaving(true);
    try {
      await markBillPaid(bill.id, amount, payDate, payMode);
      setPayModal(false);
      await load();
      Alert.alert('Success', 'Payment recorded.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save payment.');
    } finally {
      setSaving(false);
    }
  };

  const handlePDF = async () => {
    if (!bill) return;
    setPdfLoading(true);
    try {
      await downloadBillPDF(bill, entries, settings);
    } catch (e) {
      Alert.alert('Error', 'Could not generate PDF.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleWhatsApp = async () => {
    if (!bill) return;
    try {
      await sendWhatsApp(bill, entries, settings);
    } catch (e) {
      Alert.alert('Error', 'Could not open WhatsApp.');
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Bill', 'Delete this bill permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          if (bill) await deleteBill(bill.id);
          router.back();
        },
      },
    ]);
  };

  const cur = settings.defaultCurrency;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingHorizontal: 20, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 80) },
    heroCard: { backgroundColor: colors.primary, borderRadius: 20, padding: 20, marginTop: 16, marginBottom: 16 },
    heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
    billNo: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter_400Regular' },
    billName: { fontSize: 20, fontWeight: '700', color: '#fff', fontFamily: 'Inter_700Bold', marginTop: 2 },
    heroRight: { alignItems: 'flex-end' },
    statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
    statusText: { fontSize: 12, fontWeight: '600', color: '#fff', fontFamily: 'Inter_600SemiBold' },
    heroAmount: { fontSize: 32, fontWeight: '700', color: '#fff', fontFamily: 'Inter_700Bold' },
    heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_400Regular', marginTop: 2 },
    heroInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 14 },
    heroInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    heroInfoText: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontFamily: 'Inter_400Regular' },
    actionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, paddingVertical: 12, borderWidth: 1 },
    actionText: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
    section: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 14 },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.text, fontFamily: 'Inter_600SemiBold', marginBottom: 12 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.border },
    infoLabel: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    infoValue: { fontSize: 13, fontWeight: '500', color: colors.text, fontFamily: 'Inter_500Medium', textAlign: 'right', flex: 1, marginLeft: 16 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9 },
    grandRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 2, borderTopColor: colors.primary, marginTop: 4 },
    grandLabel: { fontSize: 16, fontWeight: '700', color: colors.primary, fontFamily: 'Inter_700Bold' },
    grandVal: { fontSize: 18, fontWeight: '700', color: colors.primary, fontFamily: 'Inter_700Bold' },
    entryRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 8 },
    entryDate: { fontSize: 12, color: colors.text, fontFamily: 'Inter_500Medium', width: 88 },
    entryQty: { fontSize: 12, color: colors.text, fontFamily: 'Inter_400Regular', width: 60, textAlign: 'center' },
    entryAmt: { fontSize: 12, fontWeight: '600', color: colors.text, fontFamily: 'Inter_600SemiBold', flex: 1, textAlign: 'right' },
    entryStatus: { fontSize: 11, fontWeight: '600', fontFamily: 'Inter_600SemiBold', width: 50, textAlign: 'right' },
    tableHeader: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 8 },
    tableHeaderText: { fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase' },
    payBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 14, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    payBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', fontFamily: 'Inter_700Bold' },
    delBtn: { borderRadius: 14, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FEF2F2', marginBottom: 16 },
    delBtnText: { color: '#DC2626', fontSize: 14, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    modal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    modalTitle: { fontSize: 17, fontWeight: '700', color: colors.text, fontFamily: 'Inter_700Bold', marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '600', color: colors.text, fontFamily: 'Inter_600SemiBold', marginBottom: 6, marginTop: 12 },
    input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 9, fontSize: 15, color: colors.text, fontFamily: 'Inter_400Regular', backgroundColor: colors.background },
    modeRow: { flexDirection: 'row', gap: 10 },
    modeBtn: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5 },
    modalSave: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
    modalCancel: { alignItems: 'center', paddingVertical: 12 },
  });

  if (loading) return <View style={[s.container, s.center]}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (!bill) return <View style={[s.container, s.center]}><Text style={{ color: colors.mutedForeground }}>Bill not found</Text></View>;

  const isPaid = bill.status === 'paid';

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.heroCard}>
          <View style={s.heroTop}>
            <View>
              <Text style={s.billNo}>{bill.billNumber}</Text>
              <Text style={s.billName}>{bill.customerName}</Text>
            </View>
            <View style={s.heroRight}>
              <View style={s.statusBadge}>
                <Text style={s.statusText}>{isPaid ? '✓ Paid' : 'Pending'}</Text>
              </View>
            </View>
          </View>
          <Text style={s.heroAmount}>{cur}{bill.grandTotal.toFixed(0)}</Text>
          <Text style={s.heroSub}>Grand Total · {bill.billingMonth}</Text>
          <View style={s.heroInfo}>
            <View style={s.heroInfoItem}><Feather name="phone" size={12} color="rgba(255,255,255,0.75)" /><Text style={s.heroInfoText}>{bill.customerMobile}</Text></View>
            <View style={s.heroInfoItem}><Feather name="map-pin" size={12} color="rgba(255,255,255,0.75)" /><Text style={s.heroInfoText}>{bill.customerArea}</Text></View>
            <View style={s.heroInfoItem}><Feather name="calendar" size={12} color="rgba(255,255,255,0.75)" /><Text style={s.heroInfoText}>{bill.billingDate}</Text></View>
          </View>
        </View>

        <View style={s.actionRow}>
          <TouchableOpacity style={[s.actionBtn, { borderColor: colors.border, backgroundColor: colors.background }]} onPress={handlePDF} disabled={pdfLoading}>
            {pdfLoading ? <ActivityIndicator size="small" color={colors.primary} /> : <><Feather name="download" size={14} color={colors.primary} /><Text style={[s.actionText, { color: colors.primary }]}>PDF</Text></>}
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionBtn, { borderColor: '#D1FAE5', backgroundColor: '#F0FDF4' }]} onPress={handleWhatsApp}>
            <Feather name="message-circle" size={14} color="#059669" />
            <Text style={[s.actionText, { color: '#059669' }]}>WhatsApp</Text>
          </TouchableOpacity>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Bill Summary</Text>
          <View style={[s.infoRow]}><Text style={s.infoLabel}>Customer</Text><Text style={s.infoValue}>{bill.customerName}</Text></View>
          <View style={[s.infoRow]}><Text style={s.infoLabel}>Billing Period</Text><Text style={s.infoValue}>{bill.billingMonth}</Text></View>
          <View style={[s.infoRow]}><Text style={s.infoLabel}>Mobile</Text><Text style={s.infoValue}>{bill.customerMobile}</Text></View>
          {bill.customerAddress ? <View style={[s.infoRow]}><Text style={s.infoLabel}>Address</Text><Text style={s.infoValue}>{bill.customerAddress}</Text></View> : null}
          <View style={[s.infoRow]}><Text style={s.infoLabel}>Water Rate</Text><Text style={s.infoValue}>{cur}{bill.waterRate}/unit</Text></View>
          {isPaid && bill.paidDate ? <View style={[s.infoRow]}><Text style={s.infoLabel}>Paid On</Text><Text style={[s.infoValue, { color: colors.success }]}>{bill.paidDate} via {bill.paymentMode?.toUpperCase()}</Text></View> : null}
          <View style={s.totalRow}><Text style={s.infoLabel}>Water Charges ({bill.totalQuantity} units)</Text><Text style={[s.infoValue, { fontWeight: '600' }]}>{cur}{bill.totalAmount.toFixed(0)}</Text></View>
          {bill.previousDue > 0 && <View style={s.totalRow}><Text style={[s.infoLabel, { color: '#DC2626' }]}>Previous Due</Text><Text style={[s.infoValue, { color: '#DC2626', fontWeight: '600' }]}>{cur}{bill.previousDue.toFixed(0)}</Text></View>}
          <View style={s.grandRow}><Text style={s.grandLabel}>Grand Total</Text><Text style={s.grandVal}>{cur}{bill.grandTotal.toFixed(0)}</Text></View>
        </View>

        {entries.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Daily Entries ({entries.length})</Text>
            <View style={s.tableHeader}>
              <Text style={[s.tableHeaderText, { width: 88 }]}>Date</Text>
              <Text style={[s.tableHeaderText, { width: 60, textAlign: 'center' }]}>Units</Text>
              <Text style={[s.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Amount</Text>
              <Text style={[s.tableHeaderText, { width: 50, textAlign: 'right' }]}>Status</Text>
            </View>
            {entries.map((e) => (
              <View key={e.id} style={s.entryRow}>
                <Text style={s.entryDate}>{e.date}</Text>
                <Text style={s.entryQty}>{e.waterQuantity}</Text>
                <Text style={s.entryAmt}>{cur}{e.totalAmount.toFixed(0)}</Text>
                <Text style={[s.entryStatus, { color: e.paymentStatus === 'paid' ? '#059669' : '#D97706' }]}>
                  {e.paymentStatus === 'paid' ? 'Paid' : 'Pend.'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {!isPaid && (
          <TouchableOpacity style={s.payBtn} onPress={() => setPayModal(true)}>
            <Text style={s.payBtnText}>Record Payment</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={s.delBtn} onPress={handleDelete}>
          <Text style={s.delBtnText}>Delete Bill</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={payModal} transparent animationType="slide">
        <View style={s.modal}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Record Payment</Text>
            <Text style={s.label}>Amount</Text>
            <TextInput style={s.input} value={payAmount} onChangeText={setPayAmount} keyboardType="decimal-pad" placeholder="Enter amount" placeholderTextColor={colors.mutedForeground} />
            <Text style={s.label}>Payment Date</Text>
            <TextInput style={s.input} value={payDate} onChangeText={setPayDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.mutedForeground} />
            <Text style={s.label}>Payment Mode</Text>
            <View style={s.modeRow}>
              {(['cash', 'upi', 'bank'] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[s.modeBtn, { borderColor: payMode === m ? colors.primary : colors.border, backgroundColor: payMode === m ? colors.accent : colors.card }]}
                  onPress={() => setPayMode(m)}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold', color: payMode === m ? colors.primary : colors.mutedForeground }}>
                    {m.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={s.modalSave} onPress={handlePay} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: 'Inter_700Bold' }}>Confirm Payment</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={s.modalCancel} onPress={() => setPayModal(false)}>
              <Text style={{ color: colors.mutedForeground, fontSize: 14, fontFamily: 'Inter_500Medium' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
