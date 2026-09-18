import React, { useState, useEffect } from 'react';
import { Expense, ExpenseCategory, PaymentMethod } from '../types';
import { X, TrendingDown, Trash2 } from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { formatRupiah } from '../utils/storage';

interface ExpenseFormModalProps {
  isOpen: boolean;
  expenseToEdit: Expense | null;
  onClose: () => void;
  onSave: (expense: Expense) => void;
  onDeleteExpense?: (expenseId: string) => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Bahan Baku Ikan & Sagu',
  'Minyak, Bumbu & Telur',
  'Gula Batok & Bahan Cuko',
  'Kemasan, Plastik & Thinwall',
  'Gas, Listrik & Air',
  'Gaji & Upah Tenaga Kerja',
  'Transportasi & Pengiriman',
  'Operasional Lainnya',
];

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  expenseToEdit,
  onClose,
  onSave,
  onDeleteExpense,
}) => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Bahan Baku Ikan & Sagu');
  const [amount, setAmount] = useState<number>(50000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [notes, setNotes] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (expenseToEdit) {
      setDate(expenseToEdit.date);
      setTitle(expenseToEdit.title);
      setCategory(expenseToEdit.category);
      setAmount(expenseToEdit.amount);
      setPaymentMethod(expenseToEdit.paymentMethod);
      setNotes(expenseToEdit.notes || '');
    } else {
      setDate(new Date().toISOString().slice(0, 10));
      setTitle('');
      setCategory('Bahan Baku Ikan & Sagu');
      setAmount(50000);
      setPaymentMethod('Tunai');
      setNotes('');
    }
  }, [expenseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Mohon isi keperluan / rincian pengeluaran');
      return;
    }
    if (amount <= 0) {
      alert('Jumlah pengeluaran harus lebih besar dari 0');
      return;
    }

    const expenseData: Expense = {
      id: expenseToEdit ? expenseToEdit.id : `EXP-${Date.now().toString().slice(-6)}`,
      date,
      title: title.trim(),
      category,
      amount: Number(amount),
      paymentMethod,
      notes: notes.trim() || undefined,
      createdAt: expenseToEdit ? expenseToEdit.createdAt : Date.now(),
    };

    onSave(expenseData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        id="expense-form-modal"
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-stone-200 overflow-hidden my-6"
      >
        <div className="flex items-center justify-between px-6 py-4 bg-rose-700 text-white">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            <h3 className="font-bold text-lg">
              {expenseToEdit ? 'Edit Pengeluaran' : 'Catat Pengeluaran Baru'}
            </h3>
          </div>
          <button
            id="close-expense-modal-btn"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-rose-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Rincian / Keperluan Pengeluaran <span className="text-red-500">*</span>
            </label>
            <input
              id="expense-title-input"
              type="text"
              required
              placeholder="Contoh: Beli Ikan Tenggiri Giling 5kg, Minyak Goreng 2 dus..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-600 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Kategori Pengeluaran
              </label>
              <select
                id="expense-category-select"
                value={category}
                onChange={e => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-600 transition"
              >
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Tanggal Pengeluaran
              </label>
              <input
                id="expense-date-input"
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-600 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Jumlah Biaya (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                id="expense-amount-input"
                type="number"
                min="500"
                step="500"
                required
                value={amount}
                onChange={e => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2 text-sm font-semibold text-rose-800 bg-rose-50/50 border border-rose-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Metode Pembayaran
              </label>
              <select
                id="expense-payment-method-select"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-600 transition"
              >
                <option value="Tunai">Tunai</option>
                <option value="QRIS">QRIS</option>
                <option value="Transfer Bank">Transfer Bank</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Catatan Tambahan (Opsional)
            </label>
            <textarea
              id="expense-notes-textarea"
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Contoh: Toko Barokah Pasar Kramat Jati, bukti nota terlampir..."
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-600 transition"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-200">
            <div>
              {expenseToEdit && onDeleteExpense && (
                <button
                  id="delete-expense-from-modal-btn"
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 hover:text-rose-900 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Pengeluaran</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                id="cancel-expense-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                id="save-expense-btn"
                type="submit"
                className="px-6 py-2 text-sm font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-xs transition cursor-pointer"
              >
                {expenseToEdit ? 'Perbarui Pengeluaran' : 'Simpan Pengeluaran'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {expenseToEdit && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          title="Hapus Catatan Pengeluaran"
          message={`Apakah Anda yakin ingin menghapus catatan pengeluaran "${expenseToEdit.title}" senilai ${formatRupiah(expenseToEdit.amount)}?`}
          itemName={`${expenseToEdit.title} (${expenseToEdit.id})`}
          onConfirm={() => {
            if (onDeleteExpense) onDeleteExpense(expenseToEdit.id);
            setIsDeleteModalOpen(false);
            onClose();
          }}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}
    </div>
  );
};
