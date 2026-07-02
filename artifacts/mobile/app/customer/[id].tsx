import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { deleteCustomer, getCustomer } from '@/services/customers';
import { getEntries } from '@/services/entries';
import { getSettings } from '@/services/settingsService';
import { AppSettings, Customer, DailyEntry } from '@/types';
import { useFocusEffect } from 'expo-router';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ businessName: '', defaultCurrency: '₹', defaultWaterRate: 10 });

  const load = useCallback(async () => {
    if (!id) return;
    const [c, allEntries, s] = await Promise.all([getCustomer(id), getEntries(), getSettings()]);
    setCustomer(c);
    setEntries(allEntries.filter((e) => e.customerId === id));
    setSettings(s);
  }, [id]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]));

  const handleDelete = () => {
    Alert.alert('Delete Customer', `Delete ${customer?.name}? All data will be lost.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          if (id) await deleteCustomer(id);
          router.back();
        },
      },
    ]);
  };

  const cur = settings.defaultCurrency;
  const totalPaid = entries.filter((e) => e.paymentStatus === 'paid').reduce((s, e) => s + e.totalAmount, 0);
  const totalPending = entries.filter((e) => e.paymentStatus === 'pending').reduce((s, e) => s + e.totalAmount, 0);
  const totalQty = entries.reduce((s, e) => s + e.waterQuantity, 0);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingHorizontal: 20, paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 80) },
    profileCard: { backgroundColor: colors.primary, borderRadius: 20, padding: 20, marginTop: 16, marginBottom: 16 },
    avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
    avatar: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    name: { fontSize: 20, fontWeight: '700', color: '#fff', fontFamily: 'Inter_700Bold' },
    custId: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter_400Regular', marginTop: 2 },
    profileInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    infoText: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontFamily: 'Inter_400Regular' },
    badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
    badgeText: { fontSize: 12, fontWeight: '600', color: '#fff', fontFamily: 'Inter_600SemiBold' },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    statCard: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    statVal: { fontSize: 18, fontWeight: '700', fontFamily: 'Inter_700Bold', marginBottom: 2 },
    statLabel: { fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    section: { marginBottom: 12 },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.text, fontFamily: 'Inter_600SemiBold', marginBottom: 10 },
    entryCard: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 13, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
    entryLeft: { flex: 1 },
    entryDate: { fontSize: 13, fontWeight: '600', color: colors.text, fontFamily: 'Inter_600SemiBold' },
    entrySub: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 1 },
    entryRight: { alignItems: 'flex-end', gap: 4 },
    entryAmt: { fontSize: 14, fontWeight: '700', color: colors.text, fontFamily: 'Inter_700Bold' },
    entryBadge: { borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
    entryBadgeText: { fontSize: 10, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
    actionRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    editBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 13, alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
    editBtnText: { color: '#fff', fontSize: 15, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
    delBtn: { backgroundColor: '#FEF2F2', borderRadius: 12, paddingVertical: 13, paddingHorizontal: 20, alignItems: 'center', borderWidth: 1, borderColor: '#FECACA' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    detailCard: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.border },
    detailLabel: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    detailValue: { fontSize: 13, fontWeight: '500', color: colors.text, fontFamily: 'Inter_500Medium', textAlign: 'right', flex: 1, marginLeft: 16 },
  });

  if (loading) return <View style={[s.container, s.center]}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (!customer) return <View style={[s.container, s.center]}><Text style={{ color: colors.mutedForeground }}>Customer not found</Text></View>;

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.profileCard}>
          <View style={s.avatarRow}>
            <View style={s.avatar}>
              <Feather name="user" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{customer.name}</Text>
              <Text style={s.custId}>{customer.customerId}</Text>
            </View>
            <View style={s.badge}>
              <Text style={s.badgeText}>{customer.status === 'active' ? 'Active' : 'Inactive'}</Text>
            </View>
          </View>
          <View style={s.profileInfo}>
            <View style={s.infoItem}>
              <Feather name="phone" size={13} color="rgba(255,255,255,0.75)" />
              <Text style={s.infoText}>{customer.mobile}</Text>
            </View>
            <View style={s.infoItem}>
              <Feather name="map-pin" size={13} color="rgba(255,255,255,0.75)" />
              <Text style={s.infoText}>{customer.area}</Text>
            </View>
            <View style={s.infoItem}>
              <Feather name="droplet" size={13} color="rgba(255,255,255,0.75)" />
              <Text style={s.infoText}>{cur}{customer.waterRate}/unit</Text>
            </View>
          </View>
        </View>

        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={[s.statVal, { color: colors.success }]}>{cur}{totalPaid.toFixed(0)}</Text>
            <Text style={s.statLabel}>Total Paid</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statVal, { color: '#D97706' }]}>{cur}{totalPending.toFixed(0)}</Text>
            <Text style={s.statLabel}>Pending</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statVal, { color: colors.primary }]}>{totalQty}</Text>
            <Text style={s.statLabel}>Units Used</Text>
          </View>
        </View>

        {customer.address || customer.notes ? (
          <View style={s.detailCard}>
            {customer.address ? (
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Address</Text>
                <Text style={s.detailValue}>{customer.address}</Text>
              </View>
            ) : null}
            {customer.notes ? (
              <View style={[s.detailRow, { borderBottomWidth: 0 }]}>
                <Text style={s.detailLabel}>Notes</Text>
                <Text style={s.detailValue}>{customer.notes}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={s.actionRow}>
          <TouchableOpacity style={s.editBtn} onPress={() => router.push(`/customer/add?id=${customer.id}`)}>
            <Text style={s.editBtnText}>Edit Customer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.delBtn} onPress={handleDelete}>
            <Feather name="trash-2" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Entry History ({entries.length})</Text>
          {entries.length === 0 ? (
            <EmptyState icon="droplet" title="No entries yet" subtitle="Add a water entry for this customer" />
          ) : (
            entries.map((e) => (
              <View key={e.id} style={s.entryCard}>
                <View style={s.entryLeft}>
                  <Text style={s.entryDate}>{e.date}</Text>
                  <Text style={s.entrySub}>{e.waterQuantity} units × {cur}{e.rate} {e.paymentMethod ? `· ${e.paymentMethod.toUpperCase()}` : ''}</Text>
                </View>
                <View style={s.entryRight}>
                  <Text style={s.entryAmt}>{cur}{e.totalAmount.toFixed(0)}</Text>
                  <View style={[s.entryBadge, { backgroundColor: e.paymentStatus === 'paid' ? '#D1FAE5' : '#FEF3C7' }]}>
                    <Text style={[s.entryBadgeText, { color: e.paymentStatus === 'paid' ? '#065F46' : '#92400E' }]}>
                      {e.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
