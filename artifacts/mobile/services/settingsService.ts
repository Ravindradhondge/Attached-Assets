import { AppSettings } from '../types';
import { api } from './api';

const defaults: AppSettings = {
  businessName: 'Water Billing',
  defaultCurrency: '₹',
  defaultWaterRate: 10,
  billingDay: 1,
};

function toSettings(row: any): AppSettings {
  return {
    businessName: row.businessName ?? row.business_name ?? defaults.businessName,
    defaultCurrency: row.defaultCurrency ?? row.default_currency ?? defaults.defaultCurrency,
    defaultWaterRate: Number(row.defaultWaterRate ?? row.default_water_rate ?? defaults.defaultWaterRate),
    billingDay: Number(row.billingDay ?? row.billing_day ?? defaults.billingDay),
  };
}

export async function getSettings(): Promise<AppSettings> {
  try {
    const row = await api.get<any>('/settings');
    return toSettings(row);
  } catch {
    return defaults;
  }
}

export async function saveSettings(data: Partial<AppSettings>): Promise<void> {
  await api.put('/settings', data);
}
