import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  Store,
  Plus,
  RotateCcw,
  UtensilsCrossed,
} from 'lucide-react';
import { BusinessProfile } from '../types';
import { DEFAULT_BUSINESS_PROFILE } from '../utils/storage';

export type NavTabType = 'dashboard' | 'orders' | 'menu' | 'income' | 'expenses' | 'recap' | 'profile';

interface NavbarProps {
  activeTab: NavTabType;
  onSelectTab: (tab: NavTabType) => void;
  onOpenNewOrder: () => void;
  onResetData: () => void;
  profile?: BusinessProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewOrder,
  onResetData,
  profile = DEFAULT_BUSINESS_PROFILE,
}) => {
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'PS';
  };

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onSelectTab('profile')}
              title="Klik untuk ubah profil & bio usaha"
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-white shadow-xs font-serif font-black text-lg hover:ring-2 hover:ring-amber-500 transition cursor-pointer shrink-0"
            >
              {getInitials(profile.businessName)}
            </button>
            <div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectTab('profile')}
                  className="font-extrabold text-stone-900 text-lg sm:text-xl tracking-tight hover:text-amber-800 transition cursor-pointer text-left"
                >
                  {profile.businessName}
                </button>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                  {profile.city.split(',')[0] || 'Palembang'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium hidden sm:block truncate max-w-md">
                {profile.tagline || 'Sistem Manajemen Pesanan & Pembukuan Laba Rugi'}
              </p>
            </div>
          </div>

          {/* Action Area: Quick Add & Reset */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="reset-data-btn"
              onClick={onResetData}
              title="Kembalikan contoh data awal"
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition cursor-pointer text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">Reset Data</span>
            </button>

            <button
              id="nav-quick-order-btn"
              onClick={onOpenNewOrder}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Pesanan</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 border-t border-stone-100 no-scrollbar">
          <button
            id="tab-dashboard"
            onClick={() => onSelectTab('dashboard')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard & Tren</span>
          </button>

          <button
            id="tab-orders"
            onClick={() => onSelectTab('orders')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Pesanan</span>
          </button>

          <button
            id="tab-menu"
            onClick={() => onSelectTab('menu')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'menu'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Menu & Harga</span>
          </button>

          <button
            id="tab-income"
            onClick={() => onSelectTab('income')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'income'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Pemasukan</span>
          </button>

          <button
            id="tab-expenses"
            onClick={() => onSelectTab('expenses')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'expenses'
                ? 'bg-rose-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>Pengeluaran</span>
          </button>

          <button
            id="tab-recap"
            onClick={() => onSelectTab('recap')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'recap'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Rekapitulasi (Harian & Bulanan)</span>
          </button>

          <button
            id="tab-profile"
            onClick={() => onSelectTab('profile')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Profil & Bio Usaha</span>
          </button>
        </div>
      </div>
    </header>
  );
};
