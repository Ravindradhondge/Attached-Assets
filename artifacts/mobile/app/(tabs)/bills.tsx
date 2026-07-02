import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EmptyState from '@/components/EmptyState';
import { useColors } from '@/hooks/useColors';
import { deleteBill, generateMonthlyBills, getBills, markBillPaid } from '@/services/bills';
import { downloadBillPDF, sendWhatsApp } from '@/services/pdfService';
import { getSettings } from '@/services/settingsService';
import { AppSettings, MonthlyBill } from '@/types';
import { getEntries } from '@/services/entries';

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function prevMonth(m: string) {
  const [y, mo] = m.split('-').map(Number);
  const d = new Date(y, mo - 2);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function nextMonth(m: string) {
  const [y, mo] = m.split('-').map(Number);
  const d = new Date(y, mo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function monthLabel(m: string) {
  const [y, mo] = m.split('-');
  return new Date(parseInt(y), parseInt(mo) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
}

export default function BillsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [month, setMonth] = useState(currentMonth());
  const [allBills, setAllBills] = useState<MonthlyBill[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ businessName: 'Water Billing', defaultCurrency: '₹', defaultWaterRate: 10, billingDay: 1 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [b, s] = await Promise.all([getBills(), getSettings()]);
    setAllBills(b);
    setSettings(s);
  }, []);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const bills = allBills.filter((b) => b.billingMonth === month);
  const totalBills = bills.length;
  const paidBills = bills.filter((b) => b.status === 'paid').length;
  const pendingBills = bills.filter((b) => b.status !== 'paid').length;
  const monthTotal = bills.reduce((s, b) => s + b.grandTotal, 0);
  const cur = settings.defaultCurrency;

  const handleGenerate = async () => {
    Alert.alert(
      'Generate Bills',
      `Generate bills for ${monthLabel(month)}? Bills already generated for a customer will be skipped.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate', onPress: async () => {
            setGenerating(true);
            try {
              const { generated, skipped } = await generateMonthlyBills(month, settings.billingDay);
              await load();
              Alert.alert('Done', `${generated} bills generated, ${skipped} skipped (already exist).`);
            } catch (e) {
              Alert.alert('Error', 'Failed to generate bills.');
            } finally {
              setGenerating(false);
            }
          },
        },
      ]
    );
  };

  const handleMarkPaid = (bill: MonthlyBill) => {
    Alert.alert('Mark as Paid', `Mark bill for ${bill.customerName} as paid?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Cash', onPress: async () => {
          await markBillPaid(bill.id, bill.grandTotal, new Date().toISOString().split('T')[0], 'cash');
          await load();
        },
      },
      {
        text: 'UPI', onPress: async () => {
          await markBillPaid(bill.id, bill.grandTotal, new Date().toISOString().split('T')[0], 'upi');
          await load();
        },
      },
    ]);
  };

  const handlePDF = async (bill: MonthlyBill) => {
    setPdfLoading(bill.id);
    try {
      const entries = await getEntries();
      const billEntries = entries.filter((e) => e.customerId === bill.customerId && e.date.startsWith(bill.billingMonth));
      await downloadBillPDF(bill, billEntries, settings);
    } catch (e) {
      Alert.alert('Error', 'Could not generate PDF.');
    } finally {
      setPdfLoading(null);
    }
  };

  const handleWhatsApp = async (bill: MonthlyBill) => {
    try {
      const entries = await getEntries();
      const billEntries = entries.filter((e) => e.customerId === bill.customerId && e.date.startsWith(bill.billingMonth));
      await sendWhatsApp(bill, billEntries, settings);
    } catch (e) {
      Alert.alert('Error', 'Could not open WhatsApp.');
    }
  };

  const handleDelete = (bill: MonthlyBill) => {
    Alert.alert('Delete Bill', `Delete bill ${bill.billNumber}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteBill(bill.id);
          setAllBills((prev) => prev.filter((b) => b.id !== bill.id));
        },
      },
    ]);
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 20, paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16), paddingBottom: 12 },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    title: { fontSize: 22, fontWeight: '700', color: colors.text, fontFamily: 'Inter_700Bold' },
    genBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9, shadowColor: colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
    genBtnText: { color: '#fff', fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
    monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 12 },
    monthArrow: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
    monthLabel: { fontSize: 15, fontWeight: '600', color: colors.text, fontFamily: 'Inter_600SemiBold', minWidth: 160, textAlign: 'center' },
    statsRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
    statCard: { flex: 1, borderRadius: 12, padding: 10, alignItems: 'center' },
    statVal: { fontSize: 15, fontWeight: '700', fontFamily: 'Inter_700Bold' },
    statLabel: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 1 },
    list: { paddingHorizontal: 20, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 100) },
    card: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 15, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 },
    nameBlock: { flex: 1 },
    name: { fontSize: 15, fontWeight: '700', color: colors.text, fontFamily: 'Inter_700Bold' },
    billNum: { fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 2 },
    statusBadge: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4 },
    statusText: { fontSize: 11, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
    divider: { height: 1, backgroundColor: colors.border, marginBottom: 10 },
    amountRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
    amountBox: { flex: 1 },
    amountLabel: { fontSize: 10, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    amountVal: { fontSize: 14, fontWeight: '600', color: colors.text, fontFamily: 'Inter_600SemiBold', marginTop: 2 },
    actionRow: { flexDirection: 'row', gap: 6 },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 9, paddingVertical: 8, borderWidth: 1 },
    actionText: { fontSize: 11, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  });

  const renderItem = ({ item }: { item: MonthlyBill }) => {
    const isPaid = item.status === 'paid';
    return (
      <TouchableOpacity style={s.card} onPress={() => router.push(`/bill/${item.id}`)} activeOpacity={0.8}>
        <View style={s.cardTop}>
          <View style={s.nameBlock}>
            <Text style={s.name}>{item.customerName}</Text>
            <Text style={s.billNum}>{item.billNumber} · {item.customerArea}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: isPaid ? '#D1FAE5' : '#FEF3C7' }]}>
            <Text style={[s.statusText, { color: isPaid ? '#065F46' : '#92400E' }]}>
              {isPaid ? 'Paid' : 'Pending'}
            </Text>
          </View>
        </View>
        <View style={s.divider} />
        <View style={s.amountRow}>
          <View style={s.amountBox}>
            <Text style={s.amountLabel}>Water Used</Text>
            <Text style={s.amountVal}>{item.totalQuantity} units</Text>
          </View>
          <View style={s.amountBox}>
            <Text style={s.amountLabel}>Water Charges</Text>
            <Text style={s.amountVal}>{cur}{item.totalAmount.toFixed(0)}</Text>
          </View>
          {item.previousDue > 0 && (
            <View style={s.amountBox}>
              <Text style={s.amountLabel}>Previous Due</Text>
              <Text style={[s.amountVal, { color: '#DC2626' }]}>{cur}{item.previousDue.toFixed(0)}</Text>
            </View>
          )}
          <View style={s.amountBox}>
            <Text style={s.amountLabel}>Grand Total</Text>
            <Text style={[s.amountVal, { color: colors.primary, fontSize: 15 }]}>{cur}{item.grandTotal.toFixed(0)}</Text>
          </View>
        </View>
        <View style={s.actionRow}>
          <TouchableOpacity
            style={[s.actionBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
            onPress={() => handlePDF(item)}
          >
            {pdfLoading === item.id
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <><Feather name="download" size={12} color={colors.primary} /><Text style={[s.actionText, { color: colors.primary }]}>PDF</Text></>}
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.actionBtn, { borderColor: '#D1FAE5', backgroundColor: '#F0FDF4' }]}
            onPress={() => handleWhatsApp(item)}
          >
            <Feather name="message-circle" size={12} color="#059669" />
            <Text style={[s.actionText, { color: '#059669' }]}>WhatsApp</Text>
          </TouchableOpacity>
          {!isPaid && (
            <TouchableOpacity
              style={[s.actionBtn, { borderColor: '#DBEAFE', backgroundColor: '#EFF6FF' }]}
              onPress={() => handleMarkPaid(item)}
            >
              <Feather name="check-circle" size={12} color={colors.primary} />
              <Text style={[s.actionText, { color: colors.primary }]}>Mark Paid</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[s.actionBtn, { borderColor: '#FECACA', backgroundColor: '#FEF2F2', flex: 0, paddingHorizontal: 10 }]}
            onPress={() => handleDelete(item)}
          >
            <Feather name="trash-2" size={12} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.titleRow}>
          <Text style={s.title}>Bills</Text>
          <TouchableOpacity style={s.genBtn} onPress={handleGenerate} disabled={generating}>
            {generating
              ? <ActivityIndicator size="small" color="#fff" />
              : <><Feather name="zap" size={13} color="#fff" /><Text style={s.genBtnText}>Generate</Text></>}
          </TouchableOpacity>
        </View>
        <View style={s.monthRow}>
          <TouchableOpacity style={s.monthArrow} onPress={() => setMonth(prevMonth(month))}>
            <Feather name="chevron-left" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
          <Text style={s.monthLabel}>{monthLabel(month)}</Text>
          <TouchableOpacity style={s.monthArrow} onPress={() => setMonth(nextMonth(month))}>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
        <View style={s.statsRow}>
          <View style={[s.statCard, { backgroundColor: '#EFF6FF' }]}>
            <Text style={[s.statVal, { color: colors.primary }]}>{totalBills}</Text>
            <Text style={[s.statLabel, { color: colors.primary }]}>Total Bills</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: '#D1FAE5' }]}>
            <Text style={[s.statVal, { color: '#065F46' }]}>{paidBills}</Text>
            <Text style={[s.statLabel, { color: '#065F46' }]}>Paid</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[s.statVal, { color: '#92400E' }]}>{pendingBills}</Text>
            <Text style={[s.statLabel, { color: '#92400E' }]}>Pending</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: '#F3E8FF' }]}>
            <Text style={[s.statVal, { color: '#7C3AED' }]}>{cur}{monthTotal.toFixed(0)}</Text>
            <Text style={[s.statLabel, { color: '#7C3AED' }]}>Total Amount</Text>
          </View>
        </View>
      </View>
      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={bills}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <EmptyState icon="file-text" title="No bills for this month" subtitle={`Tap "Generate" to create bills from this month's entries`} />
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
