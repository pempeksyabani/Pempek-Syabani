import React, { useState, useMemo } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/storage';
import {
  TrendingDown,
  Plus,
  Search,
  Edit2,
  Trash2,
  Filter,
} from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface ExpenseViewProps {
  expenses: Expense[];
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onDeleteMultipleExpenses?: (expenseIds: string[]) => void;
  onClearAllExpenses?: () => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Bahan Baku Ikan & Sagu',
  'Minyak, Bumbu & Telur',
  'Gula Batok & Bahan Cuko',
  'Kemasan, Plastik & Thinwall',
  'Gas, Listrik & Air',
  'Gaji & Upah Tenaga Kerja',
  'Transportasi & Pengiriman',
  'Operasional Lainnya',
];

export const ExpenseView: React.FC<ExpenseViewProps> = ({
  expenses,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onDeleteMultipleExpenses,
  onClearAllExpenses,
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

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const query = searchQuery.toLowerCase().trim();
      const matchTitle = exp.title.toLowerCase().includes(query);
      const matchNotes = exp.notes?.toLowerCase().includes(query);
      const matchId = exp.id.toLowerCase().includes(query);
      const matchesSearch = !query || matchTitle || matchNotes || matchId;

      const matchesCat = filterCategory === 'all' || exp.category === filterCategory;
      const matchesMethod = filterMethod === 'all' || exp.paymentMethod === filterMethod;

      return matchesSearch && matchesCat && matchesMethod;
    });
  }, [expenses, searchQuery, filterCategory, filterMethod]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  }, [filteredExpenses]);

  const totalAllAmount = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  }, [expenses]);

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredExpenses.length && filteredExpenses.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredExpenses.map(e => e.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const promptDeleteSingle = (exp: Expense) => {
    setDeleteModal({
      isOpen: true,
      title: 'Hapus Catatan Pengeluaran',
      message: `Apakah Anda yakin ingin menghapus catatan pengeluaran "${exp.title}" senilai ${formatRupiah(exp.amount)}? Perhitungan laba bersih akan disesuaikan.`,
      itemName: `${exp.title} - ${formatRupiah(exp.amount)} (${exp.id})`,
      action: () => {
        onDeleteExpense(exp.id);
        setSelectedIds(prev => prev.filter(id => id !== exp.id));
      },
    });
  };

  const promptDeleteBulk = () => {
    if (selectedIds.length === 0) return;
    setDeleteModal({
      isOpen: true,
      title: 'Hapus Beberapa Pengeluaran Sekaligus',
      message: `Apakah Anda yakin ingin menghapus ${selectedIds.length} data pengeluaran yang dipilih?`,
      itemName: `${selectedIds.length} data pengeluaran terpilih`,
      action: () => {
        if (onDeleteMultipleExpenses) {
          onDeleteMultipleExpenses(selectedIds);
        } else {
          selectedIds.forEach(id => onDeleteExpense(id));
        }
        setSelectedIds([]);
      },
    });
  };

  const promptClearAll = () => {
    if (expenses.length === 0) return;
    setDeleteModal({
      isOpen: true,
      title: 'Kosongkan Semua Data Pengeluaran',
      message:
        'Apakah Anda yakin ingin menghapus SELURUH catatan pengeluaran? Biaya operasional akan dibersihkan.',
      itemName: `Total ${expenses.length} pos belanja pengeluaran`,
      action: () => {
        if (onClearAllExpenses) {
          onClearAllExpenses();
        } else {
          expenses.forEach(e => onDeleteExpense(e.id));
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
          <div className="flex items-center gap-2 text-rose-800 font-bold text-lg">
            <TrendingDown className="w-5 h-5" />
            <h2>Buku Pengeluaran (Biaya & Belanja Usaha)</h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Catat semua beban operasional mulai dari bahan baku ikan tenggiri, sagu tani, minyak, bumbu cuko, gas, hingga kemasan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {expenses.length > 0 && (
            <button
              id="clear-all-expenses-btn"
              type="button"
              onClick={promptClearAll}
              title="Hapus / Kosongkan semua data pengeluaran"
              className="p-2 sm:px-3 sm:py-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer text-xs font-semibold flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kosongkan Pengeluaran</span>
            </button>
          )}

          <button
            id="add-new-expense-btn"
            onClick={onAddExpense}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-xs transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Catat Pengeluaran Baru
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="bg-linear-to-r from-rose-900 to-rose-950 text-white p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-rose-200 font-semibold">
            Total Pengeluaran Tercatat
          </span>
          <div className="text-3xl font-extrabold mt-1">
            {formatRupiah(totalAllAmount)}
          </div>
          <span className="text-xs text-rose-200/80">
            Dari {expenses.length} pos belanja dan biaya usaha
          </span>
        </div>

        {filterCategory !== 'all' && (
          <div className="bg-white/10 px-4 py-2 rounded-xl text-xs text-rose-100 border border-white/20">
            Total terfilter ({filterCategory}): <strong className="text-white text-sm">{formatRupiah(totalFilteredAmount)}</strong>
          </div>
        )}
      </div>

      {/* Search, Filter & Bulk Action Bar */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-expense-input"
              type="text"
              placeholder="Cari rincian pengeluaran atau catatan..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-600 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-stone-600">
              <Filter className="w-3.5 h-3.5 text-rose-700" />
              <span>Kategori:</span>
            </div>
            <select
              id="filter-expense-category-select"
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-600"
            >
              <option value="all">Semua Kategori</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <span className="text-stone-300">|</span>

            <span className="text-xs text-stone-600">Metode:</span>
            <select
              id="filter-expense-method-select"
              value={filterMethod}
              onChange={e => setFilterMethod(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-600"
            >
              <option value="all">Semua Metode</option>
              <option value="Tunai">Tunai</option>
              <option value="QRIS">QRIS</option>
              <option value="Transfer Bank">Transfer Bank</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-200 text-xs">
            <span className="font-bold text-rose-900">
              {selectedIds.length} pengeluaran terpilih
            </span>
            <button
              id="bulk-delete-expenses-btn"
              type="button"
              onClick={promptDeleteBulk}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus {selectedIds.length} Pengeluaran Terpilih</span>
            </button>
          </div>
        )}
      </div>

      {/* Expense Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-sm">
            <TrendingDown className="w-10 h-10 mx-auto mb-2 text-stone-300 stroke-1" />
            <p>Belum ada data pengeluaran yang cocok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-700 uppercase font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      id="select-all-expenses-checkbox"
                      type="checkbox"
                      checked={
                        filteredExpenses.length > 0 && selectedIds.length === filteredExpenses.length
                      }
                      onChange={handleToggleSelectAll}
                      className="rounded border-stone-300 text-rose-700 focus:ring-rose-700 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4 w-10 text-center">No</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Rincian Keperluan</th>
                  <th className="py-3 px-4">Kategori Biaya</th>
                  <th className="py-3 px-4 font-mono">Nominal</th>
                  <th className="py-3 px-4">Metode Bayar</th>
                  <th className="py-3 px-4">Catatan</th>
                  <th className="py-3 px-4 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredExpenses.map((exp, idx) => {
                  const isSelected = selectedIds.includes(exp.id);
                  return (
                    <tr
                      key={exp.id}
                      className={`hover:bg-rose-50/30 transition ${
                        isSelected ? 'bg-rose-50/60' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(exp.id)}
                          className="rounded border-stone-300 text-rose-700 focus:ring-rose-700 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-stone-400">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-stone-600">
                        <div className="font-semibold text-stone-800">{formatDateIndo(exp.date)}</div>
                        <span className="text-[10px] text-stone-400 font-mono">{exp.id}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900 text-sm">{exp.title}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-100 text-rose-800 border border-rose-200">
                          {exp.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-extrabold text-sm text-rose-800 font-mono">
                        {formatRupiah(exp.amount)}
                      </td>

                      <td className="py-3 px-4 font-medium text-stone-700">
                        {exp.paymentMethod}
                      </td>

                      <td className="py-3 px-4 text-stone-500 max-w-xs truncate">
                        {exp.notes || '-'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEditExpense(exp)}
                            title="Edit Pengeluaran"
                            className="p-1.5 text-stone-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => promptDeleteSingle(exp)}
                            title="Hapus Pengeluaran"
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
