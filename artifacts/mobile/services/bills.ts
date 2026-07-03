import { MonthlyBill } from '../types';
import { api } from './api';

function toBill(row: any): MonthlyBill {
  return {
    id: row.id,
    billNumber: row.billNumber ?? row.bill_number ?? '',
    customerId: row.customerId ?? row.customer_id ?? '',
    customerName: row.customerName ?? row.customer_name ?? '',
    customerMobile: row.customerMobile ?? row.customer_mobile ?? '',
    customerAddress: row.customerAddress ?? row.customer_address ?? '',
    customerArea: row.customerArea ?? row.customer_area ?? '',
    billingMonth: row.billingMonth ?? row.billing_month ?? '',
    billingDate: row.billingDate ?? row.billing_date ?? '',
    totalQuantity: Number(row.totalQuantity ?? row.total_quantity ?? 0),
    totalAmount: Number(row.totalAmount ?? row.total_amount ?? 0),
    previousDue: Number(row.previousDue ?? row.previous_due ?? 0),
    grandTotal: Number(row.grandTotal ?? row.grand_total ?? 0),
    status: row.status ?? 'pending',
    paidAmount: Number(row.paidAmount ?? row.paid_amount ?? 0),
    paidDate: row.paidDate ?? row.paid_date ?? null,
    paymentMode: row.paymentMode ?? row.payment_mode ?? '',
    waterRate: Number(row.waterRate ?? row.water_rate ?? 0),
    createdAt: row.createdAt ?? row.created_at ?? null,
  };
}

export async function getBills(): Promise<MonthlyBill[]> {
  const rows = await api.get<any[]>('/bills');
  return rows.map(toBill);
}

export async function getBillsByMonth(month: string): Promise<MonthlyBill[]> {
  const all = await getBills();
  return all.filter((b) => b.billingMonth === month);
}

export async function generateMonthlyBills(
  month: string,
  billingDay = 1
): Promise<{ generated: number; skipped: number }> {
  return api.post<{ generated: number; skipped: number }>('/bills/generate', { month, billingDay });
}

export async function updateBill(id: string, data: Partial<MonthlyBill>): Promise<void> {
  await api.put(`/bills/${id}`, data);
}

export async function markBillPaid(
  id: string,
  amount: number,
  paidDate: string,
  paymentMode: string
): Promise<void> {
  await api.put(`/bills/${id}`, { status: 'paid', paidAmount: amount, paidDate, paymentMode });
}

export async function deleteBill(id: string): Promise<void> {
  await api.delete(`/bills/${id}`);
}
