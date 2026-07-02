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
import { deleteCustomer, getCustomers } from '@/services/customers';
import { Customer } from '@/types';

export default function CustomersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const load = useCallback(async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
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
    Alert.alert('Delete Customer', `Delete ${name}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteCustomer(id);
          setCustomers((prev) => prev.filter((c) => c.id !== id));
        },
      },
    ]);
  };

  const filtered = customers.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.customerId.toLowerCase().includes(search.toLowerCase()) ||
      c.area.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search);
    const matchFilter = filter === 'all' || c.status === filter;
    return matchSearch && matchFilter;
  });

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 20, paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16), paddingBottom: 12 },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    title: { fontSize: 22, fontWeight: '700', color: colors.text, fontFamily: 'Inter_700Bold' },
    count: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    addBtn: { backgroundColor: colors.primary, borderRadius: 12, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
    filterRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
    filterBtn: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
    filterBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterBtnInactive: { backgroundColor: colors.card, borderColor: colors.border },
    filterText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
    list: { paddingHorizontal: 20, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 100) },
    card: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
    avatar: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
    nameBlock: { flex: 1 },
    name: { fontSize: 15, fontWeight: '600', color: colors.text, fontFamily: 'Inter_600SemiBold' },
    custId: { fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 1 },
    actions: { flexDirection: 'row', gap: 6 },
    actionBtn: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
    infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    infoText: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
    badgeText: { fontSize: 11, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  });

  const renderItem = ({ item }: { item: Customer }) => (
    <TouchableOpacity style={s.card} onPress={() => router.push(`/customer/${item.id}`)} activeOpacity={0.75}>
      <View style={s.cardTop}>
        <View style={s.nameRow}>
          <View style={s.avatar}>
            <Feather name="user" size={16} color={colors.primary} />
          </View>
          <View style={s.nameBlock}>
            <Text style={s.name}>{item.name}</Text>
            <Text style={s.custId}>{item.customerId}</Text>
          </View>
        </View>
        <View style={s.actions}>
          <TouchableOpacity
            style={[s.actionBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => router.push(`/customer/add?id=${item.id}`)}
          >
            <Feather name="edit-2" size={14} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.actionBtn, { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }]}
            onPress={() => handleDelete(item.id, item.name)}
          >
            <Feather name="trash-2" size={14} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={s.divider} />
      <View style={s.infoRow}>
        <View style={s.infoItem}>
          <Feather name="phone" size={12} color={colors.mutedForeground} />
          <Text style={s.infoText}>{item.mobile}</Text>
        </View>
        <View style={s.infoItem}>
          <Feather name="map-pin" size={12} color={colors.mutedForeground} />
          <Text style={s.infoText}>{item.area}</Text>
        </View>
        <View style={s.infoItem}>
          <Feather name="droplet" size={12} color={colors.mutedForeground} />
          <Text style={s.infoText}>₹{item.waterRate}/unit</Text>
        </View>
        <View style={[s.badge, { backgroundColor: item.status === 'active' ? '#D1FAE5' : '#F1F5F9' }]}>
          <Text style={[s.badgeText, { color: item.status === 'active' ? '#065F46' : colors.mutedForeground }]}>
            {item.status === 'active' ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.titleRow}>
          <View>
            <Text style={s.title}>Customers</Text>
            <Text style={s.count}>{filtered.length} of {customers.length} customers</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => router.push('/customer/add')}>
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search by name, ID, area..." />
        <View style={s.filterRow}>
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[s.filterBtn, filter === f ? s.filterBtnActive : s.filterBtnInactive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[s.filterText, { color: filter === f ? '#fff' : colors.mutedForeground }]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <EmptyState icon="users" title="No customers found" subtitle={search ? 'Try a different search' : 'Tap + to add your first customer'} />
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
