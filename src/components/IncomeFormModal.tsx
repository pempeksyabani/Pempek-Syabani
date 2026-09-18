import React, { useState, useEffect } from 'react';
import { Income, IncomeCategory, PaymentMethod } from '../types';
import { X, TrendingUp, Trash2 } from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { formatRupiah } from '../utils/storage';

interface IncomeFormModalProps {
  isOpen: boolean;
  incomeToEdit: Income | null;
  onClose: () => void;
  onSave: (income: Income) => void;
  onDeleteIncome?: (incomeId: string) => void;
}

const CATEGORIES: IncomeCategory[] = [
  'Pesanan Pelanggan',
  'Penjualan Toko / Dine-in',
  'Pesanan Katering & Acara',
  'Paket Frozen Food',
  'Lain-lain',
];

export const IncomeFormModal: React.FC<IncomeFormModalProps> = ({
  isOpen,
  incomeToEdit,
  onClose,
  onSave,
  onDeleteIncome,
}) => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IncomeCategory>('Penjualan Toko / Dine-in');
  const [amount, setAmount] = useState<number>(100000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [notes, setNotes] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (incomeToEdit) {
      setDate(incomeToEdit.date);
      setTitle(incomeToEdit.title);
      setCategory(incomeToEdit.category);
      setAmount(incomeToEdit.amount);
      setPaymentMethod(incomeToEdit.paymentMethod);
      setNotes(incomeToEdit.notes || '');
    } else {
      setDate(new Date().toISOString().slice(0, 10));
      setTitle('');
      setCategory('Penjualan Toko / Dine-in');
      setAmount(100000);
      setPaymentMethod('Tunai');
      setNotes('');
    }
  }, [incomeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Mohon isi judul / sumber pemasukan');
      return;
    }
    if (amount <= 0) {
      alert('Jumlah pemasukan harus lebih besar dari 0');
      return;
    }

    const incomeData: Income = {
      id: incomeToEdit ? incomeToEdit.id : `INC-${Date.now().toString().slice(-6)}`,
      date,
      title: title.trim(),
      category,
      amount: Number(amount),
      paymentMethod,
      notes: notes.trim() || undefined,
      relatedOrderId: incomeToEdit?.relatedOrderId,
      createdAt: incomeToEdit ? incomeToEdit.createdAt : Date.now(),
    };

    onSave(incomeData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        id="income-form-modal"
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-stone-200 overflow-hidden my-6"
      >
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-700 text-white">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-bold text-lg">
              {incomeToEdit ? 'Edit Pemasukan' : 'Catat Pemasukan Baru'}
            </h3>
          </div>
          <button
            id="close-income-modal-btn"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-emerald-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Judul / Sumber Pemasukan <span className="text-red-500">*</span>
            </label>
            <input
              id="income-title-input"
              type="text"
              required
              placeholder="Contoh: Penjualan meja 1-4 malam minggu, Pesanan kantor"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Kategori Pemasukan
              </label>
              <select
                id="income-category-select"
                value={category}
                onChange={e => setCategory(e.target.value as IncomeCategory)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Tanggal Pemasukan
              </label>
              <input
                id="income-date-input"
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Jumlah Nominal (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                id="income-amount-input"
                type="number"
                min="1000"
                step="500"
                required
                value={amount}
                onChange={e => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2 text-sm font-semibold text-emerald-800 bg-emerald-50/50 border border-emerald-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Metode Pembayaran
              </label>
              <select
                id="income-payment-method-select"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
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
              id="income-notes-textarea"
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Keterangan tambahan..."
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-200">
            <div>
              {incomeToEdit && onDeleteIncome && (
                <button
                  id="delete-income-from-modal-btn"
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 hover:text-rose-900 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Pemasukan</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                id="cancel-income-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                id="save-income-btn"
                type="submit"
                className="px-6 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition cursor-pointer"
              >
                {incomeToEdit ? 'Perbarui Pemasukan' : 'Simpan Pemasukan'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {incomeToEdit && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          title="Hapus Catatan Pemasukan"
          message={`Apakah Anda yakin ingin menghapus catatan pemasukan "${incomeToEdit.title}" senilai ${formatRupiah(incomeToEdit.amount)}?`}
          itemName={`${incomeToEdit.title} (${incomeToEdit.id})`}
          onConfirm={() => {
            if (onDeleteIncome) onDeleteIncome(incomeToEdit.id);
            setIsDeleteModalOpen(false);
            onClose();
          }}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}
    </div>
  );
};
