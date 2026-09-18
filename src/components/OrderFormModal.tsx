import React, { useState, useEffect } from 'react';
import { Order, OrderItem, PaymentMethod, PaymentStatus, OrderStatus, MenuItem } from '../types';
import { PEMPEK_PRESETS } from '../data/initialData';
import { formatRupiah } from '../utils/storage';
import { X, Plus, Trash2, ShoppingBag, DollarSign, Calendar, User, Phone, FileText } from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface OrderFormModalProps {
  isOpen: boolean;
  orderToEdit: Order | null;
  menuCatalog?: MenuItem[];
  onClose: () => void;
  onSave: (order: Order, syncToIncome: boolean) => void;
  onDeleteOrder?: (orderId: string) => void;
}

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  isOpen,
  orderToEdit,
  menuCatalog = [],
  onClose,
  onSave,
  onDeleteOrder,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('lunas');
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('proses');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItem[]>([
    { id: 'item-init-1', itemName: 'Pempek Kapal Selam', quantity: 2, unitPrice: 16000, subtotal: 32000 },
  ]);
  const [syncToIncome, setSyncToIncome] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Active menu catalog for quick selection
  const catalogList = menuCatalog.length > 0
    ? menuCatalog.filter(m => m.isAvailable !== false)
    : PEMPEK_PRESETS.map((p, idx) => ({
        id: `preset-${idx}`,
        name: p.name,
        price: p.price,
        category: p.category,
        isAvailable: true,
      }));

  useEffect(() => {
    if (orderToEdit) {
      setCustomerName(orderToEdit.customerName);
      setCustomerPhone(orderToEdit.customerPhone || '');
      setDate(orderToEdit.date);
      setPaymentStatus(orderToEdit.paymentStatus);
      setOrderStatus(orderToEdit.orderStatus);
      setPaymentMethod(orderToEdit.paymentMethod);
      setNotes(orderToEdit.notes || '');
      setItems(orderToEdit.orderItems.length > 0 ? [...orderToEdit.orderItems] : [
        { id: `item-${Date.now()}`, itemName: 'Pempek Kapal Selam', quantity: 1, unitPrice: 16000, subtotal: 16000 }
      ]);
      setSyncToIncome(orderToEdit.paymentStatus === 'lunas');
    } else {
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentStatus('lunas');
      setOrderStatus('proses');
      setPaymentMethod('Tunai');
      setNotes('');
      setItems([
        { id: `item-${Date.now()}`, itemName: 'Paket Keluarga (20 Pcs Campur + Cuko)', quantity: 1, unitPrice: 90000, subtotal: 90000 },
      ]);
      setSyncToIncome(true);
    }
  }, [orderToEdit, isOpen]);

  if (!isOpen) return null;

  const totalAmount = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

  const handleAddItem = (presetName?: string, presetPrice?: number) => {
    const defaultName = presetName || (catalogList[0]?.name || 'Pempek Lenjer Kecil');
    const defaultPrice = presetPrice !== undefined
      ? presetPrice
      : (catalogList[0]?.price || 4500);

    const newItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      itemName: defaultName,
      quantity: 1,
      unitPrice: defaultPrice,
      subtotal: defaultPrice * 1,
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleSelectCatalogItem = (index: number, catalogItemName: string) => {
    const found = catalogList.find(c => c.name === catalogItemName);
    if (found) {
      handleUpdateItem(index, {
        itemName: found.name,
        unitPrice: found.price,
      });
    } else {
      handleUpdateItem(index, { itemName: catalogItemName });
    }
  };

  const handleUpdateItem = (index: number, updates: Partial<OrderItem>) => {
    setItems(prev => {
      const copy = [...prev];
      const target = { ...copy[index], ...updates };
      if ('quantity' in updates || 'unitPrice' in updates) {
        target.subtotal = (Number(target.quantity) || 0) * (Number(target.unitPrice) || 0);
      }
      copy[index] = target;
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      alert('Minimal harus ada 1 menu pesanan');
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Mohon isi nama pemesan');
      return;
    }

    const orderData: Order = {
      id: orderToEdit ? orderToEdit.id : `ORD-${Date.now().toString().slice(-6)}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      date,
      paymentStatus,
      orderStatus,
      paymentMethod,
      notes: notes.trim() || undefined,
      orderItems: items.filter(i => i.itemName.trim() !== ''),
      totalAmount,
      createdAt: orderToEdit ? orderToEdit.createdAt : Date.now(),
      syncedIncomeId: orderToEdit?.syncedIncomeId,
    };

    onSave(orderData, syncToIncome);
    onClose();
  };

  const handleConfirmDelete = () => {
    if (orderToEdit && onDeleteOrder) {
      onDeleteOrder(orderToEdit.id);
      setIsDeleteModalOpen(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        id="order-form-modal"
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden my-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-700 text-white">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5" />
            <h3 className="font-bold text-lg">
              {orderToEdit ? `Edit Pesanan: ${orderToEdit.id}` : 'Tambah Pesanan Baru'}
            </h3>
          </div>
          <button
            id="close-order-modal-btn"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-amber-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-700" />
                Nama Pemesan <span className="text-red-500">*</span>
              </label>
              <input
                id="order-customer-name-input"
                type="text"
                required
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Contoh: Ibu Rina / Pak Budi"
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-700" />
                No. Telepon / WhatsApp (Opsional)
              </label>
              <input
                id="order-customer-phone-input"
                type="text"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="Contoh: 0812-xxxx-xxxx"
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600 transition"
              />
            </div>
          </div>

          {/* Date & Payment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                Tanggal Pesanan
              </label>
              <input
                id="order-date-input"
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Metode Pembayaran
              </label>
              <select
                id="order-payment-method-select"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600 transition"
              >
                <option value="Tunai">Tunai (Cash)</option>
                <option value="QRIS">QRIS</option>
                <option value="Transfer Bank">Transfer Bank</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Status Pembayaran
              </label>
              <select
                id="order-payment-status-select"
                value={paymentStatus}
                onChange={e => {
                  const val = e.target.value as PaymentStatus;
                  setPaymentStatus(val);
                  if (val === 'lunas') setSyncToIncome(true);
                }}
                className={`w-full px-3 py-2 text-sm border rounded-xl font-medium transition ${
                  paymentStatus === 'lunas'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                <option value="lunas">Lunas</option>
                <option value="belum_lunas">Belum Lunas (Piutang)</option>
              </select>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Pilih Menu Pempek Cepat:
              </span>
              <span className="text-xs text-stone-500">Klik untuk langsung menambahkan ke pesanan</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-stone-100/80 rounded-xl border border-stone-200">
              {catalogList.map((preset) => (
                <button
                  key={preset.id || preset.name}
                  type="button"
                  onClick={() => handleAddItem(preset.name, preset.price)}
                  className="px-2.5 py-1 text-xs bg-white hover:bg-amber-50 hover:border-amber-400 hover:text-amber-900 border border-stone-200 rounded-lg font-medium transition flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span>{preset.name}</span>
                  <span className="text-amber-700 font-bold">({formatRupiah(preset.price)})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <div className="bg-stone-100 px-4 py-2.5 flex items-center justify-between border-b border-stone-200">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Daftar Pesanan Menu ({items.length} item)
              </span>
              <button
                id="add-custom-item-btn"
                type="button"
                onClick={() => handleAddItem()}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Baris Menu
              </button>
            </div>

            <datalist id="catalog-pempek-list">
              {catalogList.map(c => (
                <option key={c.id || c.name} value={c.name}>
                  {formatRupiah(c.price)} - {c.category}
                </option>
              ))}
            </datalist>

            <div className="divide-y divide-stone-200 max-h-56 overflow-y-auto">
              {items.map((item, index) => (
                <div key={item.id} className="p-3 bg-white flex flex-col sm:flex-row gap-2.5 items-start sm:items-center">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      list="catalog-pempek-list"
                      required
                      placeholder="Nama Pempek / Menu (Ketik atau pilih dari daftar)"
                      value={item.itemName}
                      onChange={e => handleSelectCatalogItem(index, e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-stone-500">Qty:</span>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={e => handleUpdateItem(index, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-16 px-2 py-1.5 text-xs text-center bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600 font-bold"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-xs text-stone-500">Harga:</span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        required
                        value={item.unitPrice}
                        onChange={e => handleUpdateItem(index, { unitPrice: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-24 px-2 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600 font-mono"
                      />
                    </div>

                    <div className="text-xs font-bold text-amber-900 min-w-[75px] text-right font-mono">
                      {formatRupiah(item.subtotal)}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-stone-400 hover:text-red-600 p-1.5 rounded-md hover:bg-stone-100 transition cursor-pointer"
                      title="Hapus baris menu ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Calculation Footer */}
            <div className="bg-amber-50 px-4 py-3 border-t border-amber-200 flex items-center justify-between">
              <span className="text-sm font-bold text-amber-950">TOTAL HARGA PESANAN:</span>
              <span className="text-lg font-extrabold text-amber-900">{formatRupiah(totalAmount)}</span>
            </div>
          </div>

          {/* Sync & Status Settings */}
          <div className="space-y-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700">Status Penyelesaian Pesanan:</label>
              <div className="flex gap-2">
                {(['proses', 'selesai', 'dibatalkan'] as OrderStatus[]).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setOrderStatus(st)}
                    className={`px-3 py-1 text-xs rounded-lg font-medium transition capitalize cursor-pointer ${
                      orderStatus === st
                        ? st === 'selesai'
                          ? 'bg-emerald-600 text-white'
                          : st === 'proses'
                          ? 'bg-amber-600 text-white'
                          : 'bg-red-600 text-white'
                        : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {st === 'proses' ? 'Diproses' : st === 'selesai' ? 'Selesai' : 'Batal'}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200 flex items-start gap-2.5">
              <input
                id="sync-income-checkbox"
                type="checkbox"
                checked={syncToIncome}
                onChange={e => setSyncToIncome(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <label htmlFor="sync-income-checkbox" className="text-xs font-semibold text-stone-800 cursor-pointer block">
                  Otomatis Rekam ke Buku Pemasukan & Perhitungan Keuntungan
                </label>
                <p className="text-xs text-stone-500">
                  Jika dicentang, total pesanan ini akan langsung dicatat sebagai Pemasukan, mempengaruhi perhitungan laba bersih secara real-time.
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              Catatan Khusus (Opsional)
            </label>
            <textarea
              id="order-notes-textarea"
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Contoh: Sambal pisah, cuko pedas sedang, goreng kering, kirim jam 3 sore..."
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600 transition"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-200">
            <div>
              {orderToEdit && onDeleteOrder && (
                <button
                  id="delete-order-from-modal-btn"
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 hover:text-rose-900 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Pesanan</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                id="cancel-order-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                id="save-order-btn"
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-xs transition cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                {orderToEdit ? 'Perbarui Pesanan' : 'Simpan Pesanan'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {orderToEdit && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          title="Hapus Pesanan Ini"
          message={`Apakah Anda yakin ingin menghapus pesanan atas nama "${orderToEdit.customerName}"? Data pemasukan yang terkait juga akan diselaraskan.`}
          itemName={`Pesanan ${orderToEdit.customerName} (${orderToEdit.id})`}
          onConfirm={handleConfirmDelete}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}
    </div>
  );
};
