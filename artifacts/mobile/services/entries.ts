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
import { DailyEntry } from '../types';
import { db } from './firebase';

const COL = 'daily_entries';

export async function getEntries(): Promise<DailyEntry[]> {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DailyEntry));
}

export async function getEntry(id: string): Promise<DailyEntry | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as DailyEntry;
}

export async function addEntry(
  data: Omit<DailyEntry, 'id' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateEntry(id: string, data: Partial<DailyEntry>): Promise<void> {
  await updateDoc(doc(db, COL, id), data);
}

export async function deleteEntry(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
