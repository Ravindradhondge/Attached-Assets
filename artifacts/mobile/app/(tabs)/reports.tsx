import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EmptyState from '@/components/EmptyState';
import { useColors } from '@/hooks/useColors';
import { getCustomers } from '@/services/customers';
import { getEntries } from '@/services/entries';
import { getSettings } from '@/services/settingsService';
import { AppSettings, Customer, DailyEntry } from '@/types';

type Tab = 'daily' | 'monthly' | 'customer';

function todayStr() { return new Date().toISOString().split('T')[0]; }
function monthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

interface ReportRowProps { label: string; value: string; color?: string }
function ReportRow({ label, value, color }: ReportRowProps) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <Text style={{ fontSize: 14, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>{label}</Text>
      <Text style={{ fontSize: 15, fontWeight: '600', color: color ?? colors.text, fontFamily: 'Inter_600SemiBold' }}>{value}</Text>
    </View>
  );
}

export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('daily');
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ businessName: '', defaultCurrency: '₹', defaultWaterRate: 10 });
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [selectedMonth, setSelectedMonth] = useState(monthStr());
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);

  const load = useCallback(async () => {
    const [c, e, s] = await Promise.all([getCustomers(), getEntries(), getSettings()]);
    setCustomers(c);
    setEntries(e);
    setSettings(s);
  }, []);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]));

  const cur = settings.defaultCurrency;

  const dailyEntries = entries.filter((e) => e.date === selectedDate);
  const dailyTotal = dailyEntries.reduce((s, e) => s + e.totalAmount, 0);
  const dailyPaid = dailyEntries.filter((e) => e.paymentStatus === 'paid').reduce((s, e) => s + e.totalAmount, 0);
  const dailyPending = dailyEntries.filter((e) => e.paymentStatus === 'pending').reduce((s, e) => s + e.totalAmount, 0);
  const dailyQty = dailyEntries.reduce((s, e) => s + e.waterQuantity, 0);

  const monthEntries = entries.filter((e) => e.date.startsWith(selectedMonth));
  const monthRevenue = monthEntries.filter((e) => e.paymentStatus === 'paid').reduce((s, e) => s + e.totalAmount, 0);
  const monthPending = monthEntries.filter((e) => e.paymentStatus === 'pending').reduce((s, e) => s + e.totalAmount, 0);

  const custEntries = selectedCustomerId ? entries.filter((e) => e.customerId === selectedCustomerId) : [];
  const custPaid = custEntries.filter((e) => e.paymentStatus === 'paid').reduce((s, e) => s + e.totalAmount, 0);
  const custPending = custEntries.filter((e) => e.paymentStatus === 'pending').reduce((s, e) => s + e.totalAmount, 0);
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 20, paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16), paddingBottom: 12 },
    title: { fontSize: 22, fontWeight: '700', color: colors.text, fontFamily: 'Inter_700Bold', marginBottom: 14 },
    tabRow: { flexDirection: 'row', backgroundColor: colors.muted, borderRadius: 12, padding: 3 },
    tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
    tabText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
    scroll: { paddingHorizontal: 20, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 100) },
    section: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 18, marginTop: 16 },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.text, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
    dateInput: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.background, marginBottom: 16 },
    dateText: { fontSize: 14, color: colors.text, fontFamily: 'Inter_500Medium', flex: 1 },
    pickerItem: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 10 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    summaryIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  });

  const tabs: { key: Tab; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { key: 'daily', label: 'Daily', icon: 'calendar' },
    { key: 'monthly', label: 'Monthly', icon: 'bar-chart-2' },
    { key: 'customer', label: 'Customer', icon: 'user' },
  ];

  if (loading) return <View style={[s.container, s.center]}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Reports</Text>
        <View style={s.tabRow}>
          {tabs.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[s.tabBtn, tab === t.key && { backgroundColor: colors.card }]}
              onPress={() => setTab(t.key)}
            >
              <Text style={[s.tabText, { color: tab === t.key ? colors.primary : colors.mutedForeground }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {tab === 'daily' && (
          <View style={s.section}>
            <View style={s.summaryHeader}>
              <View style={s.summaryIcon}><Feather name="calendar" size={16} color={colors.primary} /></View>
              <Text style={s.sectionTitle}>Daily Report</Text>
            </View>
            <View style={s.dateInput}>
              <Feather name="calendar" size={14} color={colors.mutedForeground} />
              <Text style={s.dateText}>{selectedDate}</Text>
            </View>
            <ReportRow label="Customers Served" value={String(new Set(dailyEntries.map(e => e.customerId)).size)} />
            <ReportRow label="Total Water Supplied" value={`${dailyQty} units`} />
            <ReportRow label="Total Amount" value={`${cur}${dailyTotal.toFixed(0)}`} />
            <ReportRow label="Amount Collected" value={`${cur}${dailyPaid.toFixed(0)}`} color={colors.success} />
            <ReportRow label="Pending Amount" value={`${cur}${dailyPending.toFixed(0)}`} color={dailyPending > 0 ? '#D97706' : colors.success} />
          </View>
        )}

        {tab === 'monthly' && (
          <View style={s.section}>
            <View style={s.summaryHeader}>
              <View style={[s.summaryIcon, { backgroundColor: '#EDE9FE' }]}><Feather name="bar-chart-2" size={16} color="#7C3AED" /></View>
              <Text style={s.sectionTitle}>Monthly Report</Text>
            </View>
            <View style={s.dateInput}>
              <Feather name="calendar" size={14} color={colors.mutedForeground} />
              <Text style={s.dateText}>{selectedMonth}</Text>
            </View>
            <ReportRow label="Total Entries" value={String(monthEntries.length)} />
            <ReportRow label="Customers Served" value={String(new Set(monthEntries.map(e => e.customerId)).size)} />
            <ReportRow label="Total Water Supplied" value={`${monthEntries.reduce((sum, e) => sum + e.waterQuantity, 0)} units`} />
            <ReportRow label="Revenue Collected" value={`${cur}${monthRevenue.toFixed(0)}`} color={colors.success} />
            <ReportRow label="Pending Amount" value={`${cur}${monthPending.toFixed(0)}`} color={monthPending > 0 ? '#D97706' : colors.success} />
            <ReportRow label="Total Billing" value={`${cur}${(monthRevenue + monthPending).toFixed(0)}`} />
          </View>
        )}

        {tab === 'customer' && (
          <View>
            <View style={s.section}>
              <View style={s.summaryHeader}>
                <View style={[s.summaryIcon, { backgroundColor: '#D1FAE5' }]}><Feather name="user" size={16} color="#059669" /></View>
                <Text style={s.sectionTitle}>Customer Report</Text>
              </View>
              <TouchableOpacity style={s.dateInput} onPress={() => setShowCustomerPicker(!showCustomerPicker)}>
                <Feather name="user" size={14} color={colors.mutedForeground} />
                <Text style={s.dateText}>{selectedCustomer ? selectedCustomer.name : 'Select a customer...'}</Text>
                <Feather name={showCustomerPicker ? 'chevron-up' : 'chevron-down'} size={14} color={colors.mutedForeground} />
              </TouchableOpacity>
              {showCustomerPicker && (
                <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, marginBottom: 16, overflow: 'hidden' }}>
                  {customers.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[s.pickerItem, selectedCustomerId === c.id && { backgroundColor: colors.accent }]}
                      onPress={() => { setSelectedCustomerId(c.id); setShowCustomerPicker(false); }}
                    >
                      <Feather name="user" size={14} color={colors.primary} />
                      <Text style={{ fontSize: 14, color: colors.text, fontFamily: 'Inter_500Medium', flex: 1 }}>{c.name}</Text>
                      <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>{c.customerId}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {selectedCustomer ? (
                <>
                  <ReportRow label="Customer ID" value={selectedCustomer.customerId} />
                  <ReportRow label="Area" value={selectedCustomer.area} />
                  <ReportRow label="Water Rate" value={`${cur}${selectedCustomer.waterRate}/unit`} />
                  <ReportRow label="Total Entries" value={String(custEntries.length)} />
                  <ReportRow label="Total Water Used" value={`${custEntries.reduce((s, e) => s + e.waterQuantity, 0)} units`} />
                  <ReportRow label="Total Paid" value={`${cur}${custPaid.toFixed(0)}`} color={colors.success} />
                  <ReportRow label="Total Pending" value={`${cur}${custPending.toFixed(0)}`} color={custPending > 0 ? '#D97706' : colors.success} />
                  <ReportRow label="Total Billing" value={`${cur}${(custPaid + custPending).toFixed(0)}`} />
                </>
              ) : (
                <EmptyState icon="user" title="Select a customer" subtitle="Choose a customer to view their report" />
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
