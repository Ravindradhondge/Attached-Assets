export interface Customer {
  id: string;
  customerId: string;
  name: string;
  mobile: string;
  address: string;
  area: string;
  waterRate: number;
  status: 'active' | 'inactive';
  notes: string;
  createdAt: any;
}

export interface DailyEntry {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  waterQuantity: number;
  rate: number;
  totalAmount: number;
  paymentStatus: 'paid' | 'pending';
  paymentMethod: 'cash' | 'upi' | '';
  remarks: string;
  createdAt: any;
}

export interface AppSettings {
  businessName: string;
  defaultCurrency: string;
  defaultWaterRate: number;
}
