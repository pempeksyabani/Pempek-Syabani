import React, { useState } from 'react';
import { BusinessProfile } from '../types';
import { DEFAULT_BUSINESS_PROFILE } from '../utils/storage';
import {
  Store,
  MapPin,
  Phone,
  Clock,
  CreditCard,
  FileText,
  Save,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Instagram,
  Mail,
  User,
  Receipt,
  Eye,
} from 'lucide-react';

interface BusinessProfileViewProps {
  profile: BusinessProfile;
  onSaveProfile: (updatedProfile: BusinessProfile) => void;
}

export const BusinessProfileView: React.FC<BusinessProfileViewProps> = ({
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<BusinessProfile>(profile);
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setIsSavedAlert(true);
    setTimeout(() => {
      setIsSavedAlert(false);
    }, 4000);
  };

  const handleResetToDefault = () => {
    if (confirm('Kembalikan semua informasi profil dan bio usaha ke bawaan Pempek Syabani?')) {
      setFormData(DEFAULT_BUSINESS_PROFILE);
      onSaveProfile(DEFAULT_BUSINESS_PROFILE);
      setIsSavedAlert(true);
      setTimeout(() => {
        setIsSavedAlert(false);
      }, 4000);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-amber-900 font-bold text-lg">
            <Store className="w-5 h-5 text-amber-700" />
            <h2>Profil, Bio & Data Usaha</h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Sesuaikan identitas toko, kontak pemesanan, alamat dapur, rekening bank, serta bio usaha yang muncul di struk nota dan laporan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="reset-profile-btn"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Bawaan
          </button>

          <button
            type="button"
            id="save-profile-top-btn"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Simpan Profil
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {isSavedAlert && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Profil Usaha Berhasil Diperbarui!</p>
              <p className="text-xs text-emerald-700">
                Semua data terbaru telah tersimpan dan langsung disinkronkan ke struk kasir, ekspor PDF/Excel, serta header aplikasi.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSavedAlert(false)}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 px-2 py-1"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Main Grid: Form & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Fields (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* Section 1: Identitas & Branding */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100 text-stone-800 font-bold text-sm">
              <Store className="w-4 h-4 text-amber-700" />
              <span>Identitas Pokok & Branding Usaha</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nama Usaha / Toko <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="businessName"
                  id="profile-business-name-input"
                  required
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Contoh: Pempek Syabani"
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600 font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Slogan / Tagline Usaha
                </label>
                <input
                  type="text"
                  name="tagline"
                  id="profile-tagline-input"
                  value={formData.tagline}
                  onChange={handleChange}
                  placeholder="Contoh: Asli Ikan Tenggiri Segar & Cuko Kental Palembang"
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nama Pemilik / Pengelola
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="ownerName"
                    id="profile-owner-name-input"
                    value={formData.ownerName}
                    onChange={handleChange}
                    placeholder="Contoh: Syabani / Angga"
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Tahun Berdiri Usaha
                </label>
                <input
                  type="text"
                  name="establishedYear"
                  id="profile-established-input"
                  value={formData.establishedYear}
                  onChange={handleChange}
                  placeholder="Contoh: 2019"
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Kontak & Lokasi */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100 text-stone-800 font-bold text-sm">
              <MapPin className="w-4 h-4 text-amber-700" />
              <span>Kontak Pemesanan & Alamat Usaha</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nomor Telepon / Kontak
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="phone"
                    id="profile-phone-input"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Contoh: 0812-7788-9900"
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  WhatsApp (Format Angka)
                </label>
                <div className="relative">
                  <MessageCircle className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="whatsapp"
                    id="profile-whatsapp-input"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="Contoh: 081277889900"
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Email Usaha
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    id="profile-email-input"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Contoh: pempeksyabani@gmail.com"
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Akun Instagram
                </label>
                <div className="relative">
                  <Instagram className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="instagram"
                    id="profile-instagram-input"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="Contoh: @pempek.syabani"
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Alamat Lengkap Toko / Dapur Produksi
                </label>
                <input
                  type="text"
                  name="address"
                  id="profile-address-input"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Contoh: Jl. Mayor Ruslan No. 45, Duku, Ilir Timur II"
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Kota & Provinsi
                </label>
                <input
                  type="text"
                  name="city"
                  id="profile-city-input"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Contoh: Kota Palembang, Sumatera Selatan"
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Jam Operasional Toko
                </label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="operationalHours"
                    id="profile-hours-input"
                    value={formData.operationalHours}
                    onChange={handleChange}
                    placeholder="Contoh: Senin - Minggu: 08.00 - 21.00 WIB"
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Rekening Pembayaran */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100 text-stone-800 font-bold text-sm">
              <CreditCard className="w-4 h-4 text-amber-700" />
              <span>Rekening Bank & Pembayaran Non-Tunai</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nama Bank
                </label>
                <input
                  type="text"
                  name="bankName"
                  id="profile-bank-name-input"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="Contoh: BCA / Mandiri / BRI / BNI"
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nomor Rekening
                </label>
                <input
                  type="text"
                  name="bankAccountNumber"
                  id="profile-bank-account-input"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  placeholder="Contoh: 8270-8899-1234"
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600 font-mono font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nama Pemilik Rekening (Atas Nama)
                </label>
                <input
                  type="text"
                  name="bankAccountHolder"
                  id="profile-account-holder-input"
                  value={formData.bankAccountHolder}
                  onChange={handleChange}
                  placeholder="Contoh: Pempek Syabani / Angga"
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Catatan QRIS & Pembayaran Digital
                </label>
                <input
                  type="text"
                  name="qrisNote"
                  id="profile-qris-note-input"
                  value={formData.qrisNote}
                  onChange={handleChange}
                  placeholder="Contoh: Menerima QRIS All Payment (GoPay, OVO, DANA, BCA, ShopeePay)"
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Bio & Catatan Struk */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100 text-stone-800 font-bold text-sm">
              <FileText className="w-4 h-4 text-amber-700" />
              <span>Bio Usaha & Pesan Struk Pelanggan</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Bio / Cerita Usaha & Komitmen Kualitas
                </label>
                <textarea
                  name="bio"
                  id="profile-bio-textarea"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tuliskan cerita singkat usaha, pemilihan bahan baku ikan, resep cuko, atau keunggulan Pempek Syabani..."
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600 leading-relaxed"
                />
                <span className="text-[11px] text-stone-400">
                  Deskripsi ini menguatkan identitas brand UMKM Anda saat presentasi atau dokumen usaha.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Catatan Kaki Struk Kasir / Nota Belanja
                </label>
                <input
                  type="text"
                  name="receiptFooterNote"
                  id="profile-receipt-footer-input"
                  value={formData.receiptFooterNote}
                  onChange={handleChange}
                  placeholder="Contoh: Terima kasih atas pesanan Anda! Selamat menikmati hidangan khas Palembang."
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
                <span className="text-[11px] text-stone-400">
                  Teks ini akan otomatis dicetak di bagian paling bawah setiap struk kasir yang dicetak.
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Save Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              id="save-profile-bottom-btn"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Semua Perubahan Data Usaha
            </button>
          </div>
        </form>

        {/* Right Column: Real-Time Live Preview Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Digital Identity Card */}
          <div className="bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white rounded-3xl p-6 shadow-md border border-amber-900/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between gap-3 relative">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center font-serif font-black text-xl shadow-inner border border-amber-400/30">
                  {formData.businessName ? formData.businessName.slice(0, 2).toUpperCase() : 'PS'}
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-tight text-amber-50">
                    {formData.businessName || 'Nama Usaha'}
                  </h3>
                  <p className="text-xs text-amber-200/80 font-medium">
                    {formData.tagline || 'Tagline Usaha'}
                  </p>
                </div>
              </div>

              {formData.establishedYear && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30 shrink-0">
                  Est. {formData.establishedYear}
                </span>
              )}
            </div>

            {/* Bio text preview */}
            <div className="mt-4 pt-4 border-t border-white/10 text-xs text-stone-300 leading-relaxed">
              <p>{formData.bio || 'Belum ada bio usaha yang dimasukkan.'}</p>
            </div>

            {/* Quick Contact & Details */}
            <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Pemilik: <strong className="text-white">{formData.ownerName || '-'}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Kontak: <strong className="text-white font-mono">{formData.phone || '-'}</strong></span>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{formData.address || '-'}, {formData.city || '-'}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{formData.operationalHours || '-'}</span>
              </div>
            </div>

            {/* Payment info block */}
            <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px]">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Informasi Rekening Pembayaran</span>
              </div>
              <div className="text-stone-200">
                {formData.bankName} - <strong className="text-white font-mono">{formData.bankAccountNumber}</strong>
              </div>
              <div className="text-[11px] text-stone-400">
                a.n. {formData.bankAccountHolder}
              </div>
            </div>

            {/* WhatsApp Link Action */}
            {formData.whatsapp && (
              <a
                href={`https://wa.me/${formData.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                Hubungi via WhatsApp ({formData.whatsapp})
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Card 2: Live Receipt Simulation */}
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 text-stone-700 text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-amber-700" />
                Pratinjau Struk Nota Pelanggan
              </span>
              <span className="text-[10px] text-stone-400 font-normal">Real-time sync</span>
            </div>

            {/* Paper Receipt Simulation */}
            <div className="bg-stone-50/80 p-4 rounded-xl border border-dashed border-stone-300 font-mono text-xs text-stone-700 space-y-3">
              {/* Receipt Header */}
              <div className="text-center pb-2 border-b border-dashed border-stone-300">
                <h4 className="font-bold text-sm text-stone-900 font-sans tracking-wide">
                  {formData.businessName ? formData.businessName.toUpperCase() : 'NAMA USAHA'}
                </h4>
                <p className="text-[10px] text-stone-500 font-sans mt-0.5">
                  {formData.tagline}
                </p>
                <p className="text-[10px] text-stone-500 font-sans">
                  {formData.address}, {formData.city}
                </p>
                <p className="text-[10px] text-stone-500 font-sans">
                  Telp / WA: {formData.phone}
                </p>
              </div>

              {/* Sample item */}
              <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-stone-300">
                <div className="flex justify-between">
                  <span>Paket Pempek Campur (10 pcs)</span>
                  <span>Rp 50.000</span>
                </div>
                <div className="flex justify-between">
                  <span>Cuko Botol Kental (250 ml)</span>
                  <span>Rp 25.000</span>
                </div>
                <div className="flex justify-between font-bold text-stone-900 pt-1">
                  <span>TOTAL PEMBELIAN</span>
                  <span>Rp 75.000</span>
                </div>
              </div>

              {/* Bank on receipt */}
              <div className="text-[10px] text-stone-500 text-center space-y-0.5 pb-1">
                <div>Transfer: {formData.bankName} - {formData.bankAccountNumber}</div>
                <div>(a.n. {formData.bankAccountHolder})</div>
              </div>

              {/* Footer Note */}
              <div className="text-center pt-2 border-t border-dashed border-stone-300 text-[10px] text-stone-500 font-sans">
                <p className="font-semibold text-stone-700">{formData.receiptFooterNote}</p>
                <p className="text-[9px] mt-0.5">Instagram: {formData.instagram}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
