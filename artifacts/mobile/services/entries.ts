import { DailyEntry } from '../types';
import { api } from './api';

function toEntry(row: any): DailyEntry {
  return {
    id: row.id,
    date: row.date ?? '',
    customerId: row.customerId ?? row.customer_id ?? '',
    customerName: row.customerName ?? row.customer_name ?? '',
    waterQuantity: Number(row.waterQuantity ?? row.water_quantity ?? 0),
    rate: Number(row.rate ?? 0),
    totalAmount: Number(row.totalAmount ?? row.total_amount ?? 0),
    paymentStatus: row.paymentStatus ?? row.payment_status ?? 'pending',
    paymentMethod: row.paymentMethod ?? row.payment_method ?? '',
    remarks: row.remarks ?? '',
    createdAt: row.createdAt ?? row.created_at ?? null,
  };
}

export async function getEntries(): Promise<DailyEntry[]> {
  const rows = await api.get<any[]>('/entries');
  return rows.map(toEntry);
}

export async function getEntry(id: string): Promise<DailyEntry | null> {
  try {
    const row = await api.get<any>(`/entries/${id}`);
    return toEntry(row);
  } catch {
    return null;
  }
}

export async function addEntry(data: Omit<DailyEntry, 'id' | 'createdAt'>): Promise<string> {
  const row = await api.post<any>('/entries', data);
  return row.id;
}

export async function updateEntry(id: string, data: Partial<DailyEntry>): Promise<void> {
  await api.put(`/entries/${id}`, data);
}

export async function deleteEntry(id: string): Promise<void> {
  await api.delete(`/entries/${id}`);
}
