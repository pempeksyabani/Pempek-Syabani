import React, { useState, useEffect } from 'react';
import { MenuItem } from '../types';
import { formatRupiah } from '../utils/storage';
import { X, Utensils, DollarSign, Tag, FileText, CheckCircle, Trash2 } from 'lucide-react';

interface MenuItemFormModalProps {
  isOpen: boolean;
  itemToEdit: MenuItem | null;
  onClose: () => void;
  onSave: (item: MenuItem) => void;
  onDelete?: (id: string) => void;
}

const CATEGORY_SUGGESTIONS = [
  'Satuan Besar',
  'Satuan Kecil',
  'Menu Kuah',
  'Paket',
  'Pelengkap',
  'Minuman',
  'Frozen Food',
];

export const MenuItemFormModal: React.FC<MenuItemFormModalProps> = ({
  isOpen,
  itemToEdit,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(16000);
  const [category, setCategory] = useState('Satuan Besar');
  const [description, setDescription] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setPrice(itemToEdit.price);
      setCategory(itemToEdit.category);
      setDescription(itemToEdit.description || '');
      setIsAvailable(itemToEdit.isAvailable ?? true);
    } else {
      setName('');
      setPrice(16000);
      setCategory('Satuan Besar');
      setDescription('');
      setIsAvailable(true);
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }

    const itemData: MenuItem = {
      id: itemToEdit ? itemToEdit.id : `menu-${Date.now()}`,
      name: name.trim(),
      price: Math.max(0, Number(price) || 0),
      category: category.trim() || 'Lainnya',
      description: description.trim(),
      isAvailable,
    };

    onSave(itemData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        id="menu-item-modal-card"
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-stone-200 overflow-hidden my-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                {itemToEdit ? 'Edit Menu & Harga' : 'Tambah Menu Baru'}
              </h3>
              <p className="text-xs text-stone-500">
                Atur nama menu pempek, harga jual satuan, dan status ketersediaan
              </p>
            </div>
          </div>
          <button
            id="close-menu-item-modal-btn"
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Menu Name */}
          <div>
            <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Nama Menu Pempek / Produk <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Utensils className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                id="menu-name-input"
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Contoh: Pempek Kulit Super Crispy"
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700 transition font-medium"
              />
            </div>
          </div>

          {/* Price & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Harga Jual Satuan (Rp) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  id="menu-price-input"
                  type="number"
                  required
                  min="0"
                  step="500"
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700 transition font-mono font-bold text-stone-800"
                />
              </div>
              <div className="text-[11px] text-amber-900 font-semibold mt-1">
                Format: {formatRupiah(price || 0)}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Kategori Menu
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  id="menu-category-input"
                  type="text"
                  list="category-suggestions"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="Pilih atau ketik kategori..."
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700 transition"
                />
                <datalist id="category-suggestions">
                  {CATEGORY_SUGGESTIONS.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Quick Category Chips */}
          <div>
            <span className="text-[10px] text-stone-400 block mb-1">Pilih cepat kategori:</span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_SUGGESTIONS.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition cursor-pointer border ${
                    category === cat
                      ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Deskripsi / Keterangan Menu (Opsional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <textarea
                id="menu-description-input"
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Contoh: Terbuat dari 100% tenggiri segar, disajikan dengan cuko kental"
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700 transition"
              />
            </div>
          </div>

          {/* Availability Status Toggle */}
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="font-semibold text-stone-800 block text-xs">Status Ketersediaan</span>
              <span className="text-[11px] text-stone-500">
                {isAvailable ? 'Menu ini aktif dan dapat dipilih di form pesanan' : 'Menu sedang habis (stok kosong)'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                isAvailable
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-stone-200 text-stone-600 border border-stone-300'
              }`}
            >
              <CheckCircle className={`w-3.5 h-3.5 ${isAvailable ? 'text-emerald-700' : 'text-stone-400'}`} />
              <span>{isAvailable ? 'Tersedia' : 'Habis'}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-200">
            {itemToEdit && onDelete ? (
              <button
                id="delete-menu-item-btn"
                type="button"
                onClick={() => {
                  onDelete(itemToEdit.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Menu</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                id="cancel-menu-item-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                id="save-menu-item-btn"
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-xs transition cursor-pointer"
              >
                {itemToEdit ? 'Perbarui Menu' : 'Simpan Menu'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
