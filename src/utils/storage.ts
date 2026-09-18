import { Order, Income, Expense, FinancialSummary, BusinessProfile, MenuItem } from '../types';
import { INITIAL_ORDERS, INITIAL_INCOMES, INITIAL_EXPENSES } from '../data/initialData';

export const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  businessName: 'Pempek Syabani',
  tagline: 'Asli Ikan Tenggiri Segar & Cuko Kental Palembang',
  ownerName: 'Syabani / Angga',
  phone: '0812-7788-9900',
  whatsapp: '081277889900',
  email: 'pempeksyabani@gmail.com',
  address: 'Jl. Mayor Ruslan No. 45, Duku, Ilir Timur II',
  city: 'Kota Palembang, Sumatera Selatan',
  operationalHours: 'Senin - Minggu: 08.00 - 21.00 WIB',
  bankName: 'BCA (Bank Central Asia)',
  bankAccountNumber: '8270-8899-1234',
  bankAccountHolder: 'Pempek Syabani',
  qrisNote: 'Menerima pembayaran QRIS Statis/Dinamis (GoPay, OVO, DANA, ShopeePay, Mobile Banking)',
  bio: 'Pempek Syabani adalah usaha kuliner pempek Palembang asli yang berkomitmen menjaga cita rasa tradisional tempo doeloe. Kami hanya menggunakan 100% daging ikan tenggiri segar pilihan tanpa bahan pengawet, pemutih, ataupun boraks. Dipadukan dengan tepung sagu tani kualitas prima dan cuko pekat asli gula batok hitam Linggau dengan racikan bawang putih dan cabai rawit pedas mantap.',
  receiptFooterNote: 'Terima kasih atas pesanan Anda! Selamat menikmati hidangan khas Palembang.',
  instagram: '@pempek.syabani',
  establishedYear: '2019',
};

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: 'menu-1', name: 'Pempek Kapal Selam', price: 16000, category: 'Satuan Besar', description: 'Isi 1 butir telur bebek/ayam utuh gurih', isAvailable: true },
  { id: 'menu-2', name: 'Pempek Lenjer Besar', price: 16000, category: 'Satuan Besar', description: 'Pempek lonjong kenyal gurih asli tenggiri', isAvailable: true },
  { id: 'menu-3', name: 'Pempek Lenjer Kecil', price: 4500, category: 'Satuan Kecil', description: 'Ukuran pas sekali gigit', isAvailable: true },
  { id: 'menu-4', name: 'Pempek Adaan', price: 4500, category: 'Satuan Kecil', description: 'Bulat wangi bawang merah & santan gurih', isAvailable: true },
  { id: 'menu-5', name: 'Pempek Telur Kecil', price: 4500, category: 'Satuan Kecil', description: 'Isi kocokan telur gurih', isAvailable: true },
  { id: 'menu-6', name: 'Pempek Kulit Crispy', price: 4500, category: 'Satuan Kecil', description: 'Renyah gurih di luar, lembut di dalam', isAvailable: true },
  { id: 'menu-7', name: 'Pempek Keriting', price: 4500, category: 'Satuan Kecil', description: 'Bentuk keriting empuk khas Palembang', isAvailable: true },
  { id: 'menu-8', name: 'Pempek Pistel Pepaya', price: 4500, category: 'Satuan Kecil', description: 'Isi tumis pepaya muda ebi gurih lezat', isAvailable: true },
  { id: 'menu-9', name: 'Pempek Tahu', price: 4500, category: 'Satuan Kecil', description: 'Tahu lembut dibalut adonan ikan tenggiri', isAvailable: true },
  { id: 'menu-10', name: 'Tekwan Khas Palembang', price: 18000, category: 'Menu Kuah', description: 'Kuah kaldu udang segar, jamur kuping & bengkuang', isAvailable: true },
  { id: 'menu-11', name: 'Paket Hemat (1 Kapal Selam + 4 Kecil)', price: 32000, category: 'Paket', description: 'Porsi hemat pas untuk santap perorangan', isAvailable: true },
  { id: 'menu-12', name: 'Paket Keluarga (20 Pcs Campur + Cuko)', price: 90000, category: 'Paket', description: '20 pcs pempek campur lengkap dengan botol cuko kental', isAvailable: true },
  { id: 'menu-13', name: 'Paket Sultan (50 Pcs Campur + 2 Cuko)', price: 220000, category: 'Paket', description: '50 pcs lengkap untuk katering & arisan keluarga', isAvailable: true },
  { id: 'menu-14', name: 'Cuko Kental Asli Palembang (300ml)', price: 18000, category: 'Pelengkap', description: 'Gula batok Linggau asli kental mantap pedas manis', isAvailable: true },
  { id: 'menu-15', name: 'Es Kacang Merah', price: 12000, category: 'Minuman', description: 'Kacang merah empuk manis segar khas Palembang', isAvailable: true },
];

const STORAGE_KEYS = {
  ORDERS: 'pempek_syabani_orders_v1',
  INCOMES: 'pempek_syabani_incomes_v1',
  EXPENSES: 'pempek_syabani_expenses_v1',
  PROFILE: 'pempek_syabani_profile_v1',
  MENU_ITEMS: 'pempek_syabani_menu_catalog_v1',
};

export function loadProfile(): BusinessProfile {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      return { ...DEFAULT_BUSINESS_PROFILE, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load business profile from storage', e);
  }
  return DEFAULT_BUSINESS_PROFILE;
}

export function saveProfile(profile: BusinessProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save business profile to storage', e);
  }
}

export function loadOrders(): Order[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load orders from storage', e);
  }
  return INITIAL_ORDERS;
}

export function saveOrders(orders: Order[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders to storage', e);
  }
}

export function loadIncomes(): Income[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.INCOMES);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load incomes from storage', e);
  }
  return INITIAL_INCOMES;
}

export function saveIncomes(incomes: Income[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));
  } catch (e) {
    console.error('Failed to save incomes to storage', e);
  }
}

export function loadExpenses(): Expense[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load expenses from storage', e);
  }
  return INITIAL_EXPENSES;
}

export function saveExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Failed to save expenses to storage', e);
  }
}

export function loadMenuItems(): MenuItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load menu items from storage', e);
  }
  return DEFAULT_MENU_ITEMS;
}

export function saveMenuItems(items: MenuItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save menu items to storage', e);
  }
}

export function resetMenuItems(): MenuItem[] {
  localStorage.removeItem(STORAGE_KEYS.MENU_ITEMS);
  return DEFAULT_MENU_ITEMS;
}

export function resetToDefaultData(): { orders: Order[]; incomes: Income[]; expenses: Expense[]; menuItems: MenuItem[] } {
  localStorage.removeItem(STORAGE_KEYS.ORDERS);
  localStorage.removeItem(STORAGE_KEYS.INCOMES);
  localStorage.removeItem(STORAGE_KEYS.EXPENSES);
  localStorage.removeItem(STORAGE_KEYS.MENU_ITEMS);
  return {
    orders: INITIAL_ORDERS,
    incomes: INITIAL_INCOMES,
    expenses: INITIAL_EXPENSES,
    menuItems: DEFAULT_MENU_ITEMS,
  };
}

// Currency and Date Formatters
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return dateStr;
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}`;
  } catch {
    return dateStr;
  }
}

export function calculateSummary(
  incomes: Income[],
  expenses: Expense[],
  orders: Order[],
  startDate?: string,
  endDate?: string
): FinancialSummary {
  const filteredIncomes = incomes.filter(inc => {
    if (startDate && inc.date < startDate) return false;
    if (endDate && inc.date > endDate) return false;
    return true;
  });

  const filteredExpenses = expenses.filter(exp => {
    if (startDate && exp.date < startDate) return false;
    if (endDate && exp.date > endDate) return false;
    return true;
  });

  const filteredOrders = orders.filter(ord => {
    if (startDate && ord.date < startDate) return false;
    if (endDate && ord.date > endDate) return false;
    return true;
  });

  const totalIncome = filteredIncomes.reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0);
  const totalExpense = filteredExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  const unpaidOrdersTotal = filteredOrders
    .filter(o => o.paymentStatus === 'belum_lunas')
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  return {
    totalIncome,
    totalExpense,
    netProfit,
    profitMargin,
    ordersCount: filteredOrders.length,
    unpaidOrdersTotal,
  };
}
