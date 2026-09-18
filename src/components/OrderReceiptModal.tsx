import React from 'react';
import { Order, BusinessProfile } from '../types';
import { formatRupiah, formatDateIndo, DEFAULT_BUSINESS_PROFILE } from '../utils/storage';
import { Printer, X, CheckCircle, Clock } from 'lucide-react';

interface OrderReceiptModalProps {
  order: Order | null;
  profile?: BusinessProfile;
  onClose: () => void;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({
  order,
  profile = DEFAULT_BUSINESS_PROFILE,
  onClose,
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white">
      <div
        id="receipt-modal-card"
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-stone-200 overflow-hidden print:shadow-none print:border-none print:w-full print:max-w-none"
      >
        {/* Modal Top Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50 print:hidden">
          <h3 className="font-bold text-stone-800 text-base">Struk Pembayaran Pesanan</h3>
          <button
            id="close-receipt-btn"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Content */}
        <div className="p-6 text-stone-800 font-mono text-sm space-y-4">
          {/* Header */}
          <div className="text-center border-b border-dashed border-stone-300 pb-4">
            <h2 className="text-xl font-bold font-sans tracking-wide text-amber-800 uppercase">
              {profile.businessName}
            </h2>
            <p className="text-xs text-stone-500 font-sans mt-0.5">
              {profile.tagline}
            </p>
            {profile.address && (
              <p className="text-[11px] text-stone-500 font-sans">
                {profile.address}, {profile.city}
              </p>
            )}
            <p className="text-xs text-stone-500 font-sans">
              Telp / WA: {profile.phone}
            </p>
          </div>

          {/* Info Metadata */}
          <div className="text-xs space-y-1 border-b border-dashed border-stone-300 pb-3 text-stone-600">
            <div className="flex justify-between">
              <span>No. Nota:</span>
              <span className="font-semibold text-stone-800">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal:</span>
              <span>{formatDateIndo(order.date)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pelanggan:</span>
              <span className="font-semibold text-stone-800">{order.customerName}</span>
            </div>
            {order.customerPhone && (
              <div className="flex justify-between">
                <span>No. Telp:</span>
                <span>{order.customerPhone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Pembayaran:</span>
              <span className="font-semibold">{order.paymentMethod}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2 border-b border-dashed border-stone-300 pb-3">
            <div className="flex justify-between text-xs font-bold text-stone-700 pb-1 border-b border-stone-200">
              <span>Menu</span>
              <span>Subtotal</span>
            </div>
            {order.orderItems.map((item, idx) => (
              <div key={idx} className="space-y-0.5 text-xs">
                <div className="flex justify-between font-medium text-stone-900">
                  <span className="line-clamp-1">{item.itemName}</span>
                  <span>{formatRupiah(item.subtotal)}</span>
                </div>
                <div className="text-stone-500 pl-2">
                  {item.quantity} x {formatRupiah(item.unitPrice)}
                </div>
              </div>
            ))}
          </div>

          {/* Total & Status */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between font-bold text-stone-900 text-base">
              <span>TOTAL</span>
              <span className="text-amber-800">{formatRupiah(order.totalAmount)}</span>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs">
              <span>Status Bayar:</span>
              {order.paymentStatus === 'lunas' ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5" /> LUNAS
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <Clock className="w-3.5 h-3.5" /> BELUM LUNAS
                </span>
              )}
            </div>

            {order.notes && (
              <div className="text-xs bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-stone-600 font-sans mt-2">
                <span className="font-semibold block text-stone-700 mb-0.5">Catatan Pesanan:</span>
                {order.notes}
              </div>
            )}

            {/* Bank Transfer Info */}
            {profile.bankAccountNumber && (
              <div className="text-[11px] text-stone-600 pt-2 border-t border-dashed border-stone-300 text-center font-sans">
                <div>Transfer: <span className="font-bold">{profile.bankName}</span> - <span className="font-mono font-bold">{profile.bankAccountNumber}</span></div>
                <div className="text-stone-500">a.n. {profile.bankAccountHolder}</div>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="text-center text-xs text-stone-500 pt-3 border-t border-dashed border-stone-300 font-sans space-y-0.5">
            <p className="font-medium text-stone-700">{profile.receiptFooterNote}</p>
            {profile.instagram && (
              <p className="text-[10px] text-stone-400">Instagram: {profile.instagram}</p>
            )}
          </div>
        </div>

        {/* Action Buttons (Hidden on print) */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-end gap-3 print:hidden">
          <button
            id="print-cancel-btn"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-200/70 rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>
          <button
            id="print-execute-btn"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Struk
          </button>
        </div>
      </div>
    </div>
  );
};
