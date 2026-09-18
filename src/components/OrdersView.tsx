import React, { useState, useMemo } from 'react';
import { Order, PaymentStatus, OrderStatus } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/storage';
import {
  ShoppingBag,
  Plus,
  Search,
  Printer,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Phone,
  Filter,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface OrdersViewProps {
  orders: Order[];
  onAddOrder: () => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onDeleteMultipleOrders?: (orderIds: string[]) => void;
  onClearAllOrders?: () => void;
  onTogglePaymentStatus: (order: Order) => void;
  onPrintReceipt: (order: Order) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onAddOrder,
  onEditOrder,
  onDeleteOrder,
  onDeleteMultipleOrders,
  onClearAllOrders,
  onTogglePaymentStatus,
  onPrintReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
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

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchName = order.customerName.toLowerCase().includes(query);
      const matchPhone = order.customerPhone?.toLowerCase().includes(query);
      const matchItems = order.orderItems.some(i => i.itemName.toLowerCase().includes(query));
      const matchId = order.id.toLowerCase().includes(query);
      const matchesSearch = !query || matchName || matchPhone || matchItems || matchId;

      // Payment filter
      const matchesPayment =
        filterPayment === 'all' || order.paymentStatus === filterPayment;

      // Status filter
      const matchesStatus =
        filterStatus === 'all' || order.orderStatus === filterStatus;

      return matchesSearch && matchesPayment && matchesStatus;
    });
  }, [orders, searchQuery, filterPayment, filterStatus]);

  const totals = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const paidRevenue = orders
      .filter(o => o.paymentStatus === 'lunas')
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const unpaidRevenue = orders
      .filter(o => o.paymentStatus === 'belum_lunas')
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    return { totalRevenue, paidRevenue, unpaidRevenue };
  }, [orders]);

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map(o => o.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const promptDeleteSingle = (order: Order) => {
    setDeleteModal({
      isOpen: true,
      title: 'Hapus Pesanan',
      message: `Apakah Anda yakin ingin menghapus pesanan atas nama "${order.customerName}"? Data transaksi dan tautan pemasukannya akan dihapus.`,
      itemName: `${order.customerName} - ${formatRupiah(order.totalAmount)} (${order.id})`,
      action: () => {
        onDeleteOrder(order.id);
        setSelectedIds(prev => prev.filter(id => id !== order.id));
      },
    });
  };

  const promptDeleteBulk = () => {
    if (selectedIds.length === 0) return;
    setDeleteModal({
      isOpen: true,
      title: 'Hapus Beberapa Pesanan Sekaligus',
      message: `Apakah Anda yakin ingin menghapus ${selectedIds.length} pesanan yang dipilih? Tindakan ini akan menghapus data pesanan dari pembukuan.`,
      itemName: `${selectedIds.length} transaksi pesanan terpilih`,
      action: () => {
        if (onDeleteMultipleOrders) {
          onDeleteMultipleOrders(selectedIds);
        } else {
          selectedIds.forEach(id => onDeleteOrder(id));
        }
        setSelectedIds([]);
      },
    });
  };

  const promptClearAll = () => {
    if (orders.length === 0) return;
    setDeleteModal({
      isOpen: true,
      title: 'Kosongkan Semua Data Pesanan',
      message:
        'Apakah Anda yakin ingin menghapus SELURUH daftar pesanan? Semua rekaman pesanan akan dibersihkan.',
      itemName: `Total ${orders.length} transaksi pesanan`,
      action: () => {
        if (onClearAllOrders) {
          onClearAllOrders();
        } else {
          orders.forEach(o => onDeleteOrder(o.id));
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
          <div className="flex items-center gap-2 text-amber-800 font-bold text-lg">
            <ShoppingBag className="w-5 h-5" />
            <h2>Daftar Pesanan Pempek Syabani</h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Kelola data pemesan, rincian menu, jumlah, harga, status pembayaran, dan cetak struk nota.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {orders.length > 0 && (
            <button
              id="clear-all-orders-btn"
              type="button"
              onClick={promptClearAll}
              title="Hapus / Kosongkan semua data pesanan"
              className="p-2 sm:px-3 sm:py-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer text-xs font-semibold flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kosongkan Pesanan</span>
            </button>
          )}

          <button
            id="add-new-order-btn"
            onClick={onAddOrder}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-xs transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Tambah Pesanan Baru
          </button>
        </div>
      </div>

      {/* Mini Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Total Nilai Pesanan:</span>
          <div className="text-lg font-bold text-stone-900 mt-0.5">
            {formatRupiah(totals.totalRevenue)}
          </div>
          <span className="text-[11px] text-stone-400">{orders.length} transaksi pesanan</span>
        </div>

        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 shadow-xs">
          <span className="text-xs text-emerald-800 font-medium">Sudah Lunas (Masuk Kas):</span>
          <div className="text-lg font-bold text-emerald-800 mt-0.5">
            {formatRupiah(totals.paidRevenue)}
          </div>
          <span className="text-[11px] text-emerald-600">Tercatat ke Pemasukan</span>
        </div>

        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 shadow-xs">
          <span className="text-xs text-amber-800 font-medium">Belum Lunas (Piutang Pelanggan):</span>
          <div className="text-lg font-bold text-amber-900 mt-0.5">
            {formatRupiah(totals.unpaidRevenue)}
          </div>
          <span className="text-[11px] text-amber-700">Perlu ditagih</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-xl border border-stone-200">
        {/* Search, Filters & Bulk Action */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-orders-input"
                type="text"
                placeholder="Cari nama pemesan, no HP, atau menu..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600 transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-stone-600">
                <Filter className="w-3.5 h-3.5 text-amber-700" />
                <span>Bayar:</span>
              </div>
              <select
                id="filter-order-payment-select"
                value={filterPayment}
                onChange={e => setFilterPayment(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-600"
              >
                <option value="all">Semua Bayar</option>
                <option value="lunas">Lunas</option>
                <option value="belum_lunas">Belum Lunas</option>
              </select>

              <span className="text-stone-300">|</span>

              <span className="text-xs text-stone-600">Status:</span>
              <select
                id="filter-order-status-select"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-600"
              >
                <option value="all">Semua Status</option>
                <option value="proses">Diproses</option>
                <option value="selesai">Selesai</option>
                <option value="dibatalkan">Batal</option>
              </select>
            </div>
          </div>

          {/* Bulk Action Bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-200 text-xs">
              <span className="font-bold text-rose-900">
                {selectedIds.length} pesanan terpilih
              </span>
              <button
                id="bulk-delete-orders-btn"
                type="button"
                onClick={promptDeleteBulk}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus {selectedIds.length} Pesanan Terpilih</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-sm">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-stone-300 stroke-1" />
            <p>Tidak ada pesanan yang sesuai dengan filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-700 uppercase font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      id="select-all-orders-checkbox"
                      type="checkbox"
                      checked={
                        filteredOrders.length > 0 && selectedIds.length === filteredOrders.length
                      }
                      onChange={handleToggleSelectAll}
                      className="rounded border-stone-300 text-amber-700 focus:ring-amber-700 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4 w-10 text-center">No</th>
                  <th className="py-3 px-4">Info Pemesan</th>
                  <th className="py-3 px-4">Menu & Kuantitas</th>
                  <th className="py-3 px-4">Total Harga</th>
                  <th className="py-3 px-4">Status Bayar</th>
                  <th className="py-3 px-4">Status Pesanan</th>
                  <th className="py-3 px-4 text-center w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((order, idx) => {
                  const isSelected = selectedIds.includes(order.id);
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-amber-50/40 transition ${
                        isSelected ? 'bg-amber-50/60' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(order.id)}
                          className="rounded border-stone-300 text-amber-700 focus:ring-amber-700 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-stone-400">
                        {idx + 1}
                      </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900 text-sm">
                        {order.customerName}
                      </div>
                      <div className="text-stone-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                        <span>{formatDateIndo(order.date)}</span>
                        <span>&bull;</span>
                        <span className="font-mono text-amber-800">{order.id}</span>
                      </div>
                      {order.customerPhone && (
                        <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{order.customerPhone}</span>
                        </div>
                      )}
                      {order.notes && (
                        <div className="text-[11px] text-amber-900/80 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 mt-1 max-w-xs truncate">
                          &ldquo;{order.notes}&rdquo;
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {order.orderItems.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-center justify-between gap-4 max-w-sm">
                            <span className="font-medium text-stone-800">
                              {item.itemName}
                            </span>
                            <span className="text-stone-500 text-[11px] shrink-0 font-mono">
                              {item.quantity}x @ {formatRupiah(item.unitPrice)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-bold text-sm text-stone-900">
                      {formatRupiah(order.totalAmount)}
                      <div className="text-[10px] text-stone-400 font-normal mt-0.5">
                        {order.paymentMethod}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => onTogglePaymentStatus(order)}
                        title="Klik untuk ubah status pembayaran"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${
                          order.paymentStatus === 'lunas'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {order.paymentStatus === 'lunas' ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-700" /> LUNAS
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-700" /> BELUM LUNAS
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-medium capitalize ${
                          order.orderStatus === 'selesai'
                            ? 'bg-stone-100 text-stone-800 border border-stone-200'
                            : order.orderStatus === 'proses'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {order.orderStatus === 'proses' ? 'Diproses' : order.orderStatus === 'selesai' ? 'Selesai' : 'Batal'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onPrintReceipt(order)}
                          title="Cetak Struk Nota"
                          className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditOrder(order)}
                          title="Edit Pesanan"
                          className="p-1.5 text-stone-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => promptDeleteSingle(order)}
                          title="Hapus Pesanan"
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
