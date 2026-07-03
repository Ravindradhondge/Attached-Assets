import { Customer } from '../types';
import { api } from './api';

function toCustomer(row: any): Customer {
  return {
    id: row.id,
    customerId: row.customerId ?? row.customer_id ?? '',
    name: row.name ?? '',
    mobile: row.mobile ?? '',
    address: row.address ?? '',
    area: row.area ?? '',
    waterRate: Number(row.waterRate ?? row.water_rate ?? 0),
    status: row.status ?? 'active',
    notes: row.notes ?? '',
    createdAt: row.createdAt ?? row.created_at ?? null,
  };
}

export async function getCustomers(): Promise<Customer[]> {
  const rows = await api.get<any[]>('/customers');
  return rows.map(toCustomer);
}

export async function getCustomer(id: string): Promise<Customer | null> {
  try {
    const row = await api.get<any>(`/customers/${id}`);
    return toCustomer(row);
  } catch {
    return null;
  }
}

export async function addCustomer(
  data: Omit<Customer, 'id' | 'customerId' | 'createdAt'>
): Promise<string> {
  const row = await api.post<any>('/customers', data);
  return row.id;
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<void> {
  await api.put(`/customers/${id}`, data);
}

export async function deleteCustomer(id: string): Promise<void> {
  await api.delete(`/customers/${id}`);
}
