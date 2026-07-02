import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AppSettings } from '../types';
import { db } from './firebase';

const DOC_ID = 'app_settings';
const COL = 'settings';

const defaultSettings: AppSettings = {
  businessName: 'Water Billing',
  defaultCurrency: '₹',
  defaultWaterRate: 10,
};

export async function getSettings(): Promise<AppSettings> {
  const snap = await getDoc(doc(db, COL, DOC_ID));
  if (!snap.exists()) return defaultSettings;
  return { ...defaultSettings, ...snap.data() } as AppSettings;
}

export async function saveSettings(data: Partial<AppSettings>): Promise<void> {
  await setDoc(doc(db, COL, DOC_ID), data, { merge: true });
}
