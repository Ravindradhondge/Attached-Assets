import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { Customer } from '../types';
import { db } from './firebase';

const COL = 'customers';

export async function getCustomers(): Promise<Customer[]> {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Customer));
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Customer;
}

export async function addCustomer(
  data: Omit<Customer, 'id' | 'customerId' | 'createdAt'>
): Promise<string> {
  const snap = await getDocs(collection(db, COL));
  const num = snap.size + 1;
  const customerId = `WB-${String(num).padStart(3, '0')}`;
  const docRef = await addDoc(collection(db, COL), {
    ...data,
    customerId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<void> {
  await updateDoc(doc(db, COL, id), data);
}

export async function deleteCustomer(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
