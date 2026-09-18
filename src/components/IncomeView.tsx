import React, { useState, useMemo } from 'react';
import { Income, IncomeCategory } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/storage';
import {
  TrendingUp,
  Plus,
  Search,
  Edit2,
  Trash2,
  Filter,
  Link,
  Calendar,
} from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface IncomeViewProps {
  incomes: Income[];
  onAddIncome: () => void;
  onEditIncome: (income: Income) => void;
  onDeleteIncome: (incomeId: string) => void;
  onDeleteMultipleIncomes?: (incomeIds: string[]) => void;
  onClearAllIncomes?: () => void;
}

export const IncomeView: React.FC<IncomeViewProps> = ({
  incomes,
  onAddIncome,
  onEditIncome,
  onDeleteIncome,
  onDeleteMultipleIncomes,
  onClearAllIncomes,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState<{
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

  const filteredIncomes = useMemo(() => {
    return incomes.filter(inc => {
      const query = searchQuery.toLowerCase().trim();
      const matchTitle = inc.title.toLowerCase().includes(query);
      const matchNotes = inc.notes?.toLowerCase().includes(query);
      const matchId = inc.id.toLowerCase().includes(query);
      const matchesSearch = !query || matchTitle || matchNotes || matchId;

      const matchesCat = filterCategory === 'all' || inc.category === filterCategory;
      const matchesMethod = filterMethod === 'all' || inc.paymentMethod === filterMethod;

      return matchesSearch && matchesCat && matchesMethod;
    });
  }, [incomes, searchQuery, filterCategory, filterMethod]);

  const totalFilteredAmount = useMemo(() => {
    return filteredIncomes.reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0);
  }, [filteredIncomes]);

  const totalAllAmount = useMemo(() => {
    return incomes.reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0);
  }, [incomes]);

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredIncomes.length && filteredIncomes.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredIncomes.map(i => i.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const promptDeleteSingle = (inc: Income) => {
    setDeleteModal({
      isOpen: true,
      title: 'Hapus Catatan Pemasukan',
      message: `Apakah Anda yakin ingin menghapus catatan pemasukan "${inc.title}" senilai ${formatRupiah(inc.amount)}? Perhitungan keuntungan dan laporan kas akan diperbarui.`,
      itemName: `${inc.title} - ${formatRupiah(inc.amount)} (${inc.id})`,
      action: () => {
        onDeleteIncome(inc.id);
        setSelectedIds(prev => prev.filter(id => id !== inc.id));
      },
    });
  };

  const promptDeleteBulk = () => {
    if (selectedIds.length === 0) return;
    setDeleteModal({
      isOpen: true,
      title: 'Hapus Beberapa Pemasukan Sekaligus',
      message: `Apakah Anda yakin ingin menghapus ${selectedIds.length} catatan pemasukan yang dipilih?`,
      itemName: `${selectedIds.length} data pemasukan terpilih`,
      action: () => {
        if (onDeleteMultipleIncomes) {
          onDeleteMultipleIncomes(selectedIds);
        } else {
          selectedIds.forEach(id => onDeleteIncome(id));
        }
        setSelectedIds([]);
      },
    });
  };

  const promptClearAll = () => {
    if (incomes.length === 0) return;
    setDeleteModal({
      isOpen: true,
      title: 'Kosongkan Semua Data Pemasukan',
      message:
        'Apakah Anda yakin ingin menghapus SELURUH catatan pemasukan? Semua data arus kas masuk akan dibersihkan.',
      itemName: `Total ${incomes.length} catatan pemasukan`,
      action: () => {
        if (onClearAllIncomes) {
          onClearAllIncomes();
        } else {
          incomes.forEach(i => onDeleteIncome(i.id));
        }
        setSelectedIds([]);
      },
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-lg">
            <TrendingUp className="w-5 h-5" />
            <h2>Buku Pemasukan (Arus Kas Masuk)</h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Catat semua pendapatan dari pesanan pelanggan, penjualan toko harian, frozen food, dan katering.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {incomes.length > 0 && (
            <button
              id="clear-all-incomes-btn"
              type="button"
              onClick={promptClearAll}
              title="Hapus / Kosongkan semua data pemasukan"
              className="p-2 sm:px-3 sm:py-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer text-xs font-semibold flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kosongkan Pemasukan</span>
            </button>
          )}

          <button
            id="add-new-income-btn"
            onClick={onAddIncome}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Catat Pemasukan Baru
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="bg-linear-to-r from-emerald-800 to-teal-900 text-white p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">
            Total Pemasukan Tercatat
          </span>
          <div className="text-3xl font-extrabold mt-1">
            {formatRupiah(totalAllAmount)}
          </div>
          <span className="text-xs text-emerald-200/80">
            Dari {incomes.length} transaksi pemasukan operasional
          </span>
        </div>

        {filterCategory !== 'all' && (
          <div className="bg-white/10 px-4 py-2 rounded-xl text-xs text-emerald-100 border border-white/20">
            Total terfilter ({filterCategory}): <strong className="text-white text-sm">{formatRupiah(totalFilteredAmount)}</strong>
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-xl border border-stone-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-income-input"
            type="text"
            placeholder="Cari sumber pemasukan atau keterangan..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <Filter className="w-3.5 h-3.5 text-emerald-700" />
            <span>Kategori:</span>
          </div>
          <select
            id="filter-income-category-select"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">Semua Kategori</option>
            <option value="Pesanan Pelanggan">Pesanan Pelanggan</option>
            <option value="Penjualan Toko / Dine-in">Penjualan Toko / Dine-in</option>
            <option value="Pesanan Katering & Acara">Pesanan Katering & Acara</option>
            <option value="Paket Frozen Food">Paket Frozen Food</option>
            <option value="Lain-lain">Lain-lain</option>
          </select>

          <span className="text-stone-300">|</span>

          <span className="text-xs text-stone-600">Metode:</span>
          <select
            id="filter-income-method-select"
            value={filterMethod}
            onChange={e => setFilterMethod(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">Semua Metode</option>
            <option value="Tunai">Tunai</option>
            <option value="QRIS">QRIS</option>
            <option value="Transfer Bank">Transfer Bank</option>
          </select>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-200 text-xs">
            <span className="font-bold text-rose-900">
              {selectedIds.length} pemasukan terpilih
            </span>
            <button
              id="bulk-delete-incomes-btn"
              type="button"
              onClick={promptDeleteBulk}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus {selectedIds.length} Pemasukan Terpilih</span>
            </button>
          </div>
        )}
      </div>

      {/* Income Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        {filteredIncomes.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-sm">
            <TrendingUp className="w-10 h-10 mx-auto mb-2 text-stone-300 stroke-1" />
            <p>Belum ada data pemasukan yang cocok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-700 uppercase font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      id="select-all-incomes-checkbox"
                      type="checkbox"
                      checked={
                        filteredIncomes.length > 0 && selectedIds.length === filteredIncomes.length
                      }
                      onChange={handleToggleSelectAll}
                      className="rounded border-stone-300 text-emerald-700 focus:ring-emerald-700 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4 w-10 text-center">No</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Sumber / Judul</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4 font-mono">Nominal</th>
                  <th className="py-3 px-4">Metode Bayar</th>
                  <th className="py-3 px-4">Tautan Pesanan</th>
                  <th className="py-3 px-4 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredIncomes.map((inc, idx) => {
                  const isSelected = selectedIds.includes(inc.id);
                  return (
                    <tr
                      key={inc.id}
                      className={`hover:bg-emerald-50/30 transition ${
                        isSelected ? 'bg-emerald-50/60' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(inc.id)}
                          className="rounded border-stone-300 text-emerald-700 focus:ring-emerald-700 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-stone-400">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-stone-600">
                        <div className="font-semibold text-stone-800">{formatDateIndo(inc.date)}</div>
                        <span className="text-[10px] text-stone-400 font-mono">{inc.id}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900 text-sm">{inc.title}</div>
                        {inc.notes && (
                          <div className="text-[11px] text-stone-500 mt-0.5 max-w-xs truncate">{inc.notes}</div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {inc.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-extrabold text-sm text-emerald-800 font-mono">
                        {formatRupiah(inc.amount)}
                      </td>

                      <td className="py-3 px-4 font-medium text-stone-700">
                        {inc.paymentMethod}
                      </td>

                      <td className="py-3 px-4">
                        {inc.relatedOrderId ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Link className="w-3 h-3" />
                            {inc.relatedOrderId}
                          </span>
                        ) : (
                          <span className="text-[11px] text-stone-400">Manual</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEditIncome(inc)}
                            title="Edit Pemasukan"
                            className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => promptDeleteSingle(inc)}
                            title="Hapus Pemasukan"
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

      {/* Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.title}
        message={deleteModal.message}
        itemName={deleteModal.itemName}
        onConfirm={deleteModal.action}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
