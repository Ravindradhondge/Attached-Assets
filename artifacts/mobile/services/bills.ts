import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { MonthlyBill } from '../types';
import { getCustomers } from './customers';
import { getEntries } from './entries';
import { db } from './firebase';

const COL = 'monthly_bills';

export async function getBills(): Promise<MonthlyBill[]> {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MonthlyBill));
}

export async function getBillsByMonth(month: string): Promise<MonthlyBill[]> {
  const bills = await getBills();
  return bills.filter((b) => b.billingMonth === month);
}

export async function generateMonthlyBills(
  month: string,
  billingDay: number = 1
): Promise<{ generated: number; skipped: number }> {
  const [allEntries, allCustomers, allBills] = await Promise.all([
    getEntries(),
    getCustomers(),
    getBills(),
  ]);

  const monthEntries = allEntries.filter((e) => e.date.startsWith(month));
  const existingBillCustomers = new Set(
    allBills.filter((b) => b.billingMonth === month).map((b) => b.customerId)
  );

  const grouped: Record<string, typeof monthEntries> = {};
  for (const entry of monthEntries) {
    if (!grouped[entry.customerId]) grouped[entry.customerId] = [];
    grouped[entry.customerId].push(entry);
  }

  let billCount = allBills.length;
  let generated = 0;
  let skipped = 0;

  for (const [customerId, entries] of Object.entries(grouped)) {
    if (existingBillCustomers.has(customerId)) {
      skipped++;
      continue;
    }

    const customer = allCustomers.find((c) => c.id === customerId);
    if (!customer) continue;

    const prevPendingEntries = allEntries.filter(
      (e) =>
        e.customerId === customerId &&
        !e.date.startsWith(month) &&
        e.paymentStatus === 'pending'
    );
    const previousDue = prevPendingEntries.reduce((s, e) => s + e.totalAmount, 0);
    const totalQuantity = entries.reduce((s, e) => s + e.waterQuantity, 0);
    const totalAmount = entries.reduce((s, e) => s + e.totalAmount, 0);
    const grandTotal = totalAmount + previousDue;

    billCount++;
    const billNumber = `WB-${month.replace('-', '')}-${String(billCount).padStart(3, '0')}`;
    const [year, mon] = month.split('-');
    const day = Math.min(billingDay, new Date(parseInt(year), parseInt(mon), 0).getDate());
    const billingDate = `${year}-${mon}-${String(day).padStart(2, '0')}`;

    await addDoc(collection(db, COL), {
      billNumber,
      customerId: customer.id,
      customerName: customer.name,
      customerMobile: customer.mobile,
      customerAddress: customer.address,
      customerArea: customer.area,
      billingMonth: month,
      billingDate,
      totalQuantity,
      totalAmount,
      previousDue,
      grandTotal,
      status: 'pending',
      paidAmount: 0,
      paidDate: null,
      paymentMode: '',
      waterRate: customer.waterRate,
      createdAt: serverTimestamp(),
    });
    generated++;
  }

  return { generated, skipped };
}

export async function updateBill(id: string, data: Partial<MonthlyBill>): Promise<void> {
  await updateDoc(doc(db, COL, id), data);
}

export async function markBillPaid(
  id: string,
  amount: number,
  paidDate: string,
  paymentMode: string
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    status: 'paid',
    paidAmount: amount,
    paidDate,
    paymentMode,
  });
}

export async function deleteBill(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
