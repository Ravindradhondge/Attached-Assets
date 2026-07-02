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
import SearchBar from '@/components/SearchBar';
import { useColors } from '@/hooks/useColors';
import { deleteEntry, getEntries } from '@/services/entries';
import { getSettings } from '@/services/settingsService';
import { DailyEntry } from '@/types';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function EntriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(todayStr());
  const [showAllDates, setShowAllDates] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currency, setCurrency] = useState('₹');

  const load = useCallback(async () => {
    try {
      const [data, s] = await Promise.all([getEntries(), getSettings()]);
      setEntries(data);
      setCurrency(s.defaultCurrency);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Entry', `Delete entry for ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteEntry(id);
          setEntries((prev) => prev.filter((e) => e.id !== id));
        },
      },
    ]);
  };

  const filtered = entries.filter((e) => {
    const matchDate = showAllDates || e.date === dateFilter;
    const matchSearch = e.customerName.toLowerCase().includes(search.toLowerCase()) ||
      e.remarks.toLowerCase().includes(search.toLowerCase());
    return matchDate && matchSearch;
  });

  const totalAmount = filtered.reduce((sum, e) => sum + e.totalAmount, 0);
  const paidAmount = filtered.filter((e) => e.paymentStatus === 'paid').reduce((sum, e) => sum + e.totalAmount, 0);
  const pendingAmount = filtered.filter((e) => e.paymentStatus === 'pending').reduce((sum, e) => sum + e.totalAmount, 0);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 20, paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16), paddingBottom: 12 },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    title: { fontSize: 22, fontWeight: '700', color: colors.text, fontFamily: 'Inter_700Bold' },
    addBtn: { backgroundColor: colors.primary, borderRadius: 12, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
    dateRow: { flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' },
    dateBtn: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
    dateText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
    summaryRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
    summaryCard: { flex: 1, borderRadius: 12, padding: 10, alignItems: 'center' },
    summaryVal: { fontSize: 14, fontWeight: '700', fontFamily: 'Inter_700Bold' },
    summaryLabel: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 1 },
    list: { paddingHorizontal: 20, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 100) },
    card: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 15, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    left: { flex: 1 },
    name: { fontSize: 15, fontWeight: '600', color: colors.text, fontFamily: 'Inter_600SemiBold' },
    date: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 2 },
    right: { alignItems: 'flex-end', gap: 6 },
    amount: { fontSize: 16, fontWeight: '700', color: colors.text, fontFamily: 'Inter_700Bold' },
    badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
    badgeText: { fontSize: 11, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
    infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    infoText: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    actions: { flexDirection: 'row', gap: 6 },
    actionBtn: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  });

  const renderItem = ({ item }: { item: DailyEntry }) => (
    <View style={s.card}>
      <View style={s.cardTop}>
        <View style={s.left}>
          <Text style={s.name}>{item.customerName}</Text>
          <Text style={s.date}>{item.date}</Text>
        </View>
        <View style={s.right}>
          <Text style={s.amount}>{currency}{item.totalAmount.toFixed(0)}</Text>
          <View style={[s.badge, { backgroundColor: item.paymentStatus === 'paid' ? '#D1FAE5' : '#FEF3C7' }]}>
            <Text style={[s.badgeText, { color: item.paymentStatus === 'paid' ? '#065F46' : '#92400E' }]}>
              {item.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
            </Text>
          </View>
        </View>
      </View>
      <View style={s.divider} />
      <View style={s.infoRow}>
        <View style={s.infoItem}>
          <Feather name="droplet" size={12} color={colors.mutedForeground} />
          <Text style={s.infoText}>{item.waterQuantity} units × {currency}{item.rate}</Text>
        </View>
        {item.paymentMethod ? (
          <View style={s.infoItem}>
            <Feather name={item.paymentMethod === 'cash' ? 'dollar-sign' : 'smartphone'} size={12} color={colors.mutedForeground} />
            <Text style={s.infoText}>{item.paymentMethod.toUpperCase()}</Text>
          </View>
        ) : null}
        <View style={s.actions}>
          <TouchableOpacity
            style={[s.actionBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => router.push(`/entry/add?id=${item.id}`)}
          >
            <Feather name="edit-2" size={12} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.actionBtn, { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }]}
            onPress={() => handleDelete(item.id, item.customerName)}
          >
            <Feather name="trash-2" size={12} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
      {item.remarks ? (
        <Text style={[s.infoText, { marginTop: 6 }]}>"{item.remarks}"</Text>
      ) : null}
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.titleRow}>
          <Text style={s.title}>Entries</Text>
          <TouchableOpacity style={s.addBtn} onPress={() => router.push('/entry/add')}>
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search by customer or remarks..." />
        <View style={s.dateRow}>
          <TouchableOpacity
            style={[s.dateBtn, { borderColor: !showAllDates ? colors.primary : colors.border, backgroundColor: !showAllDates ? colors.accent : colors.card }]}
            onPress={() => { setShowAllDates(false); setDateFilter(todayStr()); }}
          >
            <Feather name="calendar" size={12} color={!showAllDates ? colors.primary : colors.mutedForeground} />
            <Text style={[s.dateText, { color: !showAllDates ? colors.primary : colors.mutedForeground }]}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.dateBtn, { borderColor: showAllDates ? colors.primary : colors.border, backgroundColor: showAllDates ? colors.accent : colors.card }]}
            onPress={() => setShowAllDates(true)}
          >
            <Feather name="list" size={12} color={showAllDates ? colors.primary : colors.mutedForeground} />
            <Text style={[s.dateText, { color: showAllDates ? colors.primary : colors.mutedForeground }]}>All Entries</Text>
          </TouchableOpacity>
        </View>
        <View style={s.summaryRow}>
          <View style={[s.summaryCard, { backgroundColor: '#EFF6FF' }]}>
            <Text style={[s.summaryVal, { color: colors.primary }]}>{currency}{totalAmount.toFixed(0)}</Text>
            <Text style={[s.summaryLabel, { color: colors.primary }]}>Total</Text>
          </View>
          <View style={[s.summaryCard, { backgroundColor: '#D1FAE5' }]}>
            <Text style={[s.summaryVal, { color: '#065F46' }]}>{currency}{paidAmount.toFixed(0)}</Text>
            <Text style={[s.summaryLabel, { color: '#065F46' }]}>Collected</Text>
          </View>
          <View style={[s.summaryCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[s.summaryVal, { color: '#92400E' }]}>{currency}{pendingAmount.toFixed(0)}</Text>
            <Text style={[s.summaryLabel, { color: '#92400E' }]}>Pending</Text>
          </View>
        </View>
      </View>
      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          ListEmptyComponent={<EmptyState icon="droplet" title="No entries found" subtitle="Tap + to add a water entry" />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
