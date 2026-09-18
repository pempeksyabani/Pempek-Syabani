import React, { useState, useMemo } from 'react';
import { MenuItem } from '../types';
import { formatRupiah } from '../utils/storage';
import {
  Utensils,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Tag,
  RotateCcw,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { MenuItemFormModal } from './MenuItemFormModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface MenuViewProps {
  menuItems: MenuItem[];
  onSaveMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (id: string) => void;
  onDeleteMultipleMenuItems: (ids: string[]) => void;
  onToggleAvailability: (id: string) => void;
  onResetMenuItems: () => void;
}

export const MenuView: React.FC<MenuViewProps> = ({
  menuItems,
  onSaveMenuItem,
  onDeleteMenuItem,
  onDeleteMultipleMenuItems,
  onToggleAvailability,
  onResetMenuItems,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);

  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemName?: string;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
  });

  // Extract all categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach(item => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [menuItems]);

  // Filter items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [menuItems, searchQuery, selectedCategory]);

  // Statistics
  const stats = useMemo(() => {
    const total = menuItems.length;
    const available = menuItems.filter(m => m.isAvailable !== false).length;
    const outOfStock = total - available;
    const avgPrice = total > 0 ? Math.round(menuItems.reduce((acc, m) => acc + m.price, 0) / total) : 0;
    return { total, available, outOfStock, avgPrice };
  }, [menuItems]);

  // Select all handler
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(i => i.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Delete single
  const promptDeleteSingle = (item: MenuItem) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Hapus Menu Pesanan',
      message: `Apakah Anda yakin ingin menghapus menu "${item.name}" dari daftar katalog? Menu ini tidak akan muncul lagi di formulir pesanan.`,
      itemName: `${item.name} (${formatRupiah(item.price)})`,
      action: () => onDeleteMenuItem(item.id),
    });
  };

  // Delete bulk
  const promptDeleteBulk = () => {
    if (selectedIds.length === 0) return;
    setDeleteConfirm({
      isOpen: true,
      title: 'Hapus Beberapa Menu Sekaligus',
      message: `Apakah Anda yakin ingin menghapus ${selectedIds.length} menu yang dipilih dari katalog?`,
      itemName: `${selectedIds.length} item terpilih`,
      action: () => {
        onDeleteMultipleMenuItems(selectedIds);
        setSelectedIds([]);
      },
    });
  };

  // Reset to default
  const promptReset = () => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Kembalikan Menu Standar Pempek Syabani',
      message:
        'Tindakan ini akan mengembalikan daftar menu dan harga ke paket standar bawaan Pempek Syabani (15 varian pempek, tekwan, paket & cuko).',
      action: onResetMenuItems,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-900 text-white flex items-center justify-center shadow-xs">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-stone-900 text-lg sm:text-xl tracking-tight">
                Daftar Menu & Harga Pesanan
              </h2>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                Katalog Produk
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Kelola nama menu, harga satuan, kategori, dan status ketersediaan yang langsung terhubung ke formulir pesanan
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="reset-menu-catalog-btn"
            type="button"
            onClick={promptReset}
            title="Kembalikan daftar menu ke standar awal"
            className="p-2 sm:px-3 sm:py-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition cursor-pointer text-xs font-semibold flex items-center gap-1.5 border border-stone-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Menu</span>
          </button>

          <button
            id="add-new-menu-item-btn"
            type="button"
            onClick={() => {
              setItemToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Menu Baru</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
            Total Menu Terdaftar
          </span>
          <div className="text-2xl font-extrabold text-stone-900 mt-1 font-mono">{stats.total}</div>
          <span className="text-[11px] text-stone-500 mt-0.5 block">{categories.length} ragam kategori</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
            Menu Tersedia (Ready)
          </span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1 font-mono">{stats.available}</div>
          <span className="text-[11px] text-stone-500 mt-0.5 block">Siap dipesan pelanggan</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
            Stok Habis / Kosong
          </span>
          <div className="text-2xl font-extrabold text-stone-600 mt-1 font-mono">{stats.outOfStock}</div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Dinonaktifkan sementara</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
            Rata-rata Harga Menu
          </span>
          <div className="text-xl font-extrabold text-amber-800 mt-1 font-mono">{formatRupiah(stats.avgPrice)}</div>
          <span className="text-[11px] text-stone-500 mt-0.5 block">Estimasi nilai per porsi</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              id="search-menu-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari menu pempek, harga, atau deskripsi..."
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700 transition"
            />
          </div>

          {/* Bulk Delete Trigger */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 shrink-0">
              <span className="text-xs font-bold text-rose-800">
                {selectedIds.length} menu dipilih
              </span>
              <button
                id="bulk-delete-menu-btn"
                type="button"
                onClick={promptDeleteBulk}
                className="inline-flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Terpilih</span>
              </button>
            </div>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Semua Menu ({menuItems.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat} ({menuItems.filter(m => m.category === cat).length})
            </button>
          ))}
        </div>
      </div>

      {/* Menu Table / List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center">
            <Utensils className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-bold text-stone-700 text-base">Tidak Ada Menu yang Sesuai</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `Tidak ditemukan menu dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                : 'Belum ada menu di kategori ini. Silakan tambah menu baru.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setItemToEdit(null);
                setIsModalOpen(true);
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Menu Pertama</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50/80 text-stone-600 font-semibold border-b border-stone-200">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      id="select-all-menu-checkbox"
                      type="checkbox"
                      checked={
                        filteredItems.length > 0 && selectedIds.length === filteredItems.length
                      }
                      onChange={handleToggleSelectAll}
                      className="rounded border-stone-300 text-amber-700 focus:ring-amber-700 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Nama Menu & Keterangan</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4 font-mono">Harga Jual Satuan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredItems.map(item => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-amber-50/30 transition ${
                        isSelected ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(item.id)}
                          className="rounded border-stone-300 text-amber-700 focus:ring-amber-700 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900 text-sm">{item.name}</div>
                        {item.description && (
                          <div className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                            {item.description}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-900 border border-amber-200">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-extrabold text-sm text-amber-800 font-mono">
                        {formatRupiah(item.price)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleAvailability(item.id)}
                          title="Klik untuk ubah status ketersediaan"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition ${
                            item.isAvailable !== false
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                          }`}
                        >
                          {item.isAvailable !== false ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-700" />
                              <span>Tersedia</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-stone-500" />
                              <span>Habis</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setItemToEdit(item);
                              setIsModalOpen(true);
                            }}
                            title="Edit Menu & Harga"
                            className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => promptDeleteSingle(item)}
                            title="Hapus Menu Ini"
                            className="p-1.5 text-stone-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Menu Modal */}
      <MenuItemFormModal
        isOpen={isModalOpen}
        itemToEdit={itemToEdit}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveMenuItem}
        onDelete={onDeleteMenuItem}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.title}
        message={deleteConfirm.message}
        itemName={deleteConfirm.itemName}
        onConfirm={deleteConfirm.action}
        onClose={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
