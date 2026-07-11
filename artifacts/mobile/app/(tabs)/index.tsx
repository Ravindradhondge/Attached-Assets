import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StatCard from '@/components/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { useColors } from '@/hooks/useColors';
import { getBills } from '@/services/bills';
import { getCustomers } from '@/services/customers';
import { getEntries } from '@/services/entries';
import { getSettings } from '@/services/settingsService';
import { AppSettings, Customer, DailyEntry, MonthlyBill } from '@/types';

function today() { return new Date().toISOString().split('T')[0]; }
function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [bills, setBills] = useState<MonthlyBill[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ businessName: 'Water Billing', defaultCurrency: '₹', defaultWaterRate: 10, billingDay: 1 });

  const load = useCallback(async () => {
    try {
      const [c, e, b, s] = await Promise.all([getCustomers(), getEntries(), getBills(), getSettings()]);
      setCustomers(c);
      setEntries(e);
      setBills(b);
      setSettings(s);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const todayStr = today();
  const monthStr = currentMonth();
  const todayEntries = entries.filter((e) => e.date === todayStr);
  const todayCollection = todayEntries.filter((e) => e.paymentStatus === 'paid').reduce((s, e) => s + e.totalAmount, 0);
  const pendingCount = entries.filter((e) => e.paymentStatus === 'pending').length;
  const monthlyRevenue = entries.filter((e) => e.date.startsWith(monthStr) && e.paymentStatus === 'paid').reduce((s, e) => s + e.totalAmount, 0);

  const monthBills = bills.filter((b) => b.billingMonth === monthStr);
  const totalBills = monthBills.length;
  const paidBills = monthBills.filter((b) => b.status === 'paid').length;
  const pendingBills = monthBills.filter((b) => b.status !== 'paid').length;
  const monthBillingAmount = monthBills.reduce((s, b) => s + b.grandTotal, 0);

  const cur = settings.defaultCurrency;
  const recentEntries = entries.slice(0, 5);
  const recentBills = bills.slice(0, 3);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16), paddingBottom: 12 },
    headerLeft: { gap: 2 },
    greeting: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    bizName: { fontSize: 20, fontWeight: '700', color: colors.text, fontFamily: 'Inter_700Bold' },
    scroll: { paddingHorizontal: 20 },
    sectionTitle: { fontSize: 15, fontWeight: '600', color: colors.text, fontFamily: 'Inter_600SemiBold', marginTop: 20, marginBottom: 10 },
    row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    recentCard: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    recentIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
    recentMain: { flex: 1 },
    recentName: { fontSize: 14, fontWeight: '600', color: colors.text, fontFamily: 'Inter_600SemiBold' },
    recentSub: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 1 },
    badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
    badgeText: { fontSize: 11, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    monthCard: { backgroundColor: colors.primary, borderRadius: 16, padding: 18, marginTop: 4 },
    monthLabel: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter_500Medium' },
    monthValue: { fontSize: 28, fontWeight: '700', color: '#fff', fontFamily: 'Inter_700Bold', marginTop: 4 },
    monthSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter_400Regular', marginTop: 2 },
    billCard: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    billIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  });

  if (loading) {
    return (
      <View style={[s.container, s.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.greeting}>{greeting}</Text>
          <Text style={s.bizName}>{settings.businessName}</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 100) }}
      >
        <View style={s.row}>
          <StatCard title="Total Customers" value={customers.length} icon="users" color="#2563EB" />
          <StatCard title="Today's Entries" value={todayEntries.length} icon="droplet" color="#7C3AED" />
        </View>
        <View style={s.row}>
          <StatCard title="Today's Collection" value={`${cur}${todayCollection.toFixed(0)}`} icon="dollar-sign" color="#059669" />
          <StatCard title="Pending Entries" value={pendingCount} icon="clock" color="#D97706" />
        </View>

        <View style={s.monthCard}>
          <Text style={s.monthLabel}>Monthly Revenue (Entries)</Text>
          <Text style={s.monthValue}>{cur}{monthlyRevenue.toFixed(0)}</Text>
          <Text style={s.monthSub}>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
        </View>

        <Text style={s.sectionTitle}>Billing Overview</Text>
        <View style={s.row}>
          <StatCard title="Generated Bills" value={totalBills} icon="file-text" color="#7C3AED" />
          <StatCard title="Pending Bills" value={pendingBills} icon="alert-circle" color="#D97706" />
        </View>
        <View style={s.row}>
          <StatCard title="Paid Bills" value={paidBills} icon="check-circle" color="#059669" />
          <StatCard title="Monthly Billing" value={`${cur}${monthBillingAmount.toFixed(0)}`} icon="trending-up" color="#2563EB" />
        </View>

        {recentBills.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Recent Bills</Text>
            {recentBills.map((b) => (
              <TouchableOpacity key={b.id} style={s.billCard} onPress={() => router.push(`/bill/${b.id}`)}>
                <View style={s.billIcon}>
                  <Feather name="file-text" size={16} color="#7C3AED" />
                </View>
                <View style={s.recentMain}>
                  <Text style={s.recentName}>{b.customerName}</Text>
                  <Text style={s.recentSub}>{b.billNumber} · {b.billingMonth} · {cur}{b.grandTotal.toFixed(0)}</Text>
                </View>
                <View style={[s.badge, { backgroundColor: b.status === 'paid' ? '#0D2218' : '#241A06' }]}>
                  <Text style={[s.badgeText, { color: b.status === 'paid' ? '#34D399' : '#FBBF24' }]}>
                    {b.status === 'paid' ? 'Paid' : 'Pending'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        <Text style={s.sectionTitle}>Recent Entries</Text>
        {recentEntries.length === 0 ? (
          <Text style={{ color: colors.mutedForeground, fontSize: 13, fontFamily: 'Inter_400Regular', paddingVertical: 8 }}>No entries yet</Text>
        ) : (
          recentEntries.map((e) => (
            <TouchableOpacity key={e.id} style={s.recentCard} onPress={() => router.push(`/entry/add?id=${e.id}`)}>
              <View style={s.recentIcon}>
                <Feather name="droplet" size={16} color={colors.primary} />
              </View>
              <View style={s.recentMain}>
                <Text style={s.recentName}>{e.customerName}</Text>
                <Text style={s.recentSub}>{e.date} · {e.waterQuantity} units · {cur}{e.totalAmount}</Text>
              </View>
              <View style={[s.badge, { backgroundColor: e.paymentStatus === 'paid' ? '#0D2218' : '#241A06' }]}>
                <Text style={[s.badgeText, { color: e.paymentStatus === 'paid' ? '#34D399' : '#FBBF24' }]}>
                  {e.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
