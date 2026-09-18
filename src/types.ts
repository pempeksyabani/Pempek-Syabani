export type PaymentStatus = 'lunas' | 'belum_lunas';
export type OrderStatus = 'selesai' | 'proses' | 'dibatalkan';
export type PaymentMethod = 'Tunai' | 'QRIS' | 'Transfer Bank';

export interface OrderItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone?: string;
  orderItems: OrderItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: number;
  syncedIncomeId?: string; // id in incomes table if synced
}

export type IncomeCategory =
  | 'Pesanan Pelanggan'
  | 'Penjualan Toko / Dine-in'
  | 'Pesanan Katering & Acara'
  | 'Paket Frozen Food'
  | 'Lain-lain';

export interface Income {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: IncomeCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  relatedOrderId?: string;
  createdAt: number;
}

export type ExpenseCategory =
  | 'Bahan Baku Ikan & Sagu'
  | 'Minyak, Bumbu & Telur'
  | 'Gula Batok & Bahan Cuko'
  | 'Kemasan, Plastik & Thinwall'
  | 'Gas, Listrik & Air'
  | 'Gaji & Upah Tenaga Kerja'
  | 'Transportasi & Pengiriman'
  | 'Operasional Lainnya';

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: number;
}

export interface PempekPreset {
  name: string;
  price: number;
  category: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  isAvailable: boolean;
}

export interface BusinessProfile {
  businessName: string;
  tagline: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  operationalHours: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  qrisNote: string;
  bio: string;
  receiptFooterNote: string;
  instagram: string;
  establishedYear: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  profitMargin: number;
  ordersCount: number;
  unpaidOrdersTotal: number;
}
