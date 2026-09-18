import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, Income, Expense, FinancialSummary, BusinessProfile } from '../types';
import { formatRupiah, formatDateIndo, DEFAULT_BUSINESS_PROFILE } from './storage';

export function exportToExcel(
  orders: Order[],
  incomes: Income[],
  expenses: Expense[],
  summary: FinancialSummary,
  periodLabel: string = 'Semua Periode',
  profile: BusinessProfile = DEFAULT_BUSINESS_PROFILE
): void {
  const wb = XLSX.utils.book_new();

  // 1. Sheet Ringkasan Keuangan
  const summaryRows = [
    { 'Keterangan': 'Nama Usaha', 'Nilai': profile.businessName },
    { 'Keterangan': 'Tagline', 'Nilai': profile.tagline },
    { 'Keterangan': 'Pemilik Usaha', 'Nilai': profile.ownerName },
    { 'Keterangan': 'Kontak / WhatsApp', 'Nilai': profile.phone },
    { 'Keterangan': 'Alamat Usaha', 'Nilai': `${profile.address}, ${profile.city}` },
    { 'Keterangan': 'Periode Laporan', 'Nilai': periodLabel },
    { 'Keterangan': 'Tanggal Cetak', 'Nilai': new Date().toLocaleString('id-ID') },
    { 'Keterangan': '----------------', 'Nilai': '----------------' },
    { 'Keterangan': 'Total Pemasukan', 'Nilai': summary.totalIncome },
    { 'Keterangan': 'Total Pengeluaran', 'Nilai': summary.totalExpense },
    { 'Keterangan': 'Keuntungan Bersih (Laba)', 'Nilai': summary.netProfit },
    { 'Keterangan': 'Marjin Keuntungan (%)', 'Nilai': `${summary.profitMargin.toFixed(1)}%` },
    { 'Keterangan': 'Total Jumlah Pesanan', 'Nilai': summary.ordersCount },
    { 'Keterangan': 'Piutang Belum Lunas', 'Nilai': summary.unpaidOrdersTotal },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

  // 2. Sheet Pesanan
  const orderRows = orders.map((o, idx) => ({
    'No': idx + 1,
    'ID Pesanan': o.id,
    'Tanggal': o.date,
    'Nama Pemesan': o.customerName,
    'No Telepon': o.customerPhone || '-',
    'Rincian Pesanan': o.orderItems.map(i => `${i.itemName} (${i.quantity}x)`).join('; '),
    'Total Harga (Rp)': o.totalAmount,
    'Status Pembayaran': o.paymentStatus === 'lunas' ? 'Lunas' : 'Belum Lunas',
    'Status Pesanan': o.orderStatus === 'selesai' ? 'Selesai' : o.orderStatus === 'proses' ? 'Diproses' : 'Batal',
    'Metode Bayar': o.paymentMethod,
    'Catatan': o.notes || '-',
  }));
  const wsOrders = XLSX.utils.json_to_sheet(orderRows);
  XLSX.utils.book_append_sheet(wb, wsOrders, 'Pesanan');

  // 3. Sheet Pemasukan
  const incomeRows = incomes.map((inc, idx) => ({
    'No': idx + 1,
    'ID Pemasukan': inc.id,
    'Tanggal': inc.date,
    'Keterangan / Sumber': inc.title,
    'Kategori': inc.category,
    'Jumlah (Rp)': inc.amount,
    'Metode Bayar': inc.paymentMethod,
    'ID Pesanan Terkait': inc.relatedOrderId || '-',
    'Catatan': inc.notes || '-',
  }));
  const wsIncomes = XLSX.utils.json_to_sheet(incomeRows);
  XLSX.utils.book_append_sheet(wb, wsIncomes, 'Pemasukan');

  // 4. Sheet Pengeluaran
  const expenseRows = expenses.map((exp, idx) => ({
    'No': idx + 1,
    'ID Pengeluaran': exp.id,
    'Tanggal': exp.date,
    'Keperluan': exp.title,
    'Kategori': exp.category,
    'Jumlah (Rp)': exp.amount,
    'Metode Bayar': exp.paymentMethod,
    'Catatan': exp.notes || '-',
  }));
  const wsExpenses = XLSX.utils.json_to_sheet(expenseRows);
  XLSX.utils.book_append_sheet(wb, wsExpenses, 'Pengeluaran');

  const fileName = `Laporan_Pempek_Syabani_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportToPDF(
  orders: Order[],
  incomes: Income[],
  expenses: Expense[],
  summary: FinancialSummary,
  periodLabel: string = 'Semua Periode',
  profile: BusinessProfile = DEFAULT_BUSINESS_PROFILE
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Brand Header
  doc.setFillColor(180, 83, 9); // Amber-700
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(profile.businessName.toUpperCase(), 14, 10.5);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${profile.tagline} | Telp: ${profile.phone}`, 14, 16.5);
  doc.text(`${profile.address}, ${profile.city}`, 14, 21);

  doc.setFontSize(8);
  doc.text(`Periode: ${periodLabel} | Dicetak: ${new Date().toLocaleDateString('id-ID')}`, 125, 10.5);

  // Summary Metrics Cards in PDF
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('RINGKASAN KEUANGAN & KEUNTUNGAN', 14, 33);

  // 4 metric boxes
  const startY = 37;
  const boxWidth = 43;
  const boxHeight = 18;

  // Box 1: Pemasukan
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(34, 197, 94);
  doc.roundedRect(14, startY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(22, 101, 52);
  doc.text('TOTAL PEMASUKAN', 17, startY + 6);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(formatRupiah(summary.totalIncome), 17, startY + 13);

  // Box 2: Pengeluaran
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(239, 68, 68);
  doc.roundedRect(61, startY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(153, 27, 27);
  doc.text('TOTAL PENGELUARAN', 64, startY + 6);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(formatRupiah(summary.totalExpense), 64, startY + 13);

  // Box 3: Keuntungan Bersih
  const isProfit = summary.netProfit >= 0;
  doc.setFillColor(isProfit ? 236 : 254, isProfit ? 253 : 242, isProfit ? 245 : 242);
  doc.setDrawColor(isProfit ? 16 : 239, isProfit ? 185 : 68, isProfit ? 129 : 68);
  doc.roundedRect(108, startY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(isProfit ? 4 : 153, isProfit ? 120 : 27, isProfit ? 87 : 27);
  doc.text('KEUNTUNGAN BERSIH', 111, startY + 6);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(formatRupiah(summary.netProfit), 111, startY + 13);

  // Box 4: Marjin & Pesanan
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(155, startY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('MARJIN / PESANAN', 158, startY + 6);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${summary.profitMargin.toFixed(1)}% (${summary.ordersCount} psn)`, 158, startY + 13);

  // Section 1: Tabel Pesanan
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Daftar Pesanan', 14, 63);

  autoTable(doc, {
    startY: 66,
    head: [['No', 'Tgl', 'Nama Pemesan', 'Pesanan', 'Total', 'Bayar', 'Status']],
    body: orders.slice(0, 15).map((o, idx) => [
      idx + 1,
      formatDateIndo(o.date).slice(0, 6),
      o.customerName,
      o.orderItems.map(i => `${i.itemName} (${i.quantity}x)`).join(', '),
      formatRupiah(o.totalAmount),
      o.paymentStatus === 'lunas' ? 'Lunas' : 'Belum Lunas',
      o.orderStatus,
    ]),
    headStyles: { fillColor: [180, 83, 9], textColor: [255, 255, 255], fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 16 },
      2: { cellWidth: 35 },
      3: { cellWidth: 70 },
      4: { cellWidth: 26 },
      5: { cellWidth: 18 },
      6: { cellWidth: 15 },
    },
    margin: { left: 14, right: 14 },
  });

  // Next section: Pemasukan & Pengeluaran
  const finalY1 = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : 130;

  if (finalY1 < 220) {
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Rincian Pemasukan Terbaru', 14, finalY1 + 10);

    autoTable(doc, {
      startY: finalY1 + 13,
      head: [['No', 'Tgl', 'Keterangan', 'Kategori', 'Metode', 'Jumlah']],
      body: incomes.slice(0, 10).map((inc, idx) => [
        idx + 1,
        formatDateIndo(inc.date).slice(0, 6),
        inc.title,
        inc.category,
        inc.paymentMethod,
        formatRupiah(inc.amount),
      ]),
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontSize: 8 },
      bodyStyles: { fontSize: 7.5 },
      margin: { left: 14, right: 14 },
    });
  }

  const finalY2 = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : 200;

  if (finalY2 < 230) {
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Rincian Pengeluaran Terbaru', 14, finalY2 + 10);

    autoTable(doc, {
      startY: finalY2 + 13,
      head: [['No', 'Tgl', 'Keperluan', 'Kategori', 'Metode', 'Jumlah']],
      body: expenses.slice(0, 10).map((exp, idx) => [
        idx + 1,
        formatDateIndo(exp.date).slice(0, 6),
        exp.title,
        exp.category,
        exp.paymentMethod,
        formatRupiah(exp.amount),
      ]),
      headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], fontSize: 8 },
      bodyStyles: { fontSize: 7.5 },
      margin: { left: 14, right: 14 },
    });
  } else {
    doc.addPage();
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Rincian Pengeluaran', 14, 20);

    autoTable(doc, {
      startY: 24,
      head: [['No', 'Tgl', 'Keperluan', 'Kategori', 'Metode', 'Jumlah']],
      body: expenses.slice(0, 20).map((exp, idx) => [
        idx + 1,
        formatDateIndo(exp.date).slice(0, 6),
        exp.title,
        exp.category,
        exp.paymentMethod,
        formatRupiah(exp.amount),
      ]),
      headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], fontSize: 8 },
      bodyStyles: { fontSize: 7.5 },
      margin: { left: 14, right: 14 },
    });
  }

  // Footer text
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`${profile.businessName} - Arsip Otomatis Pembukuan Keuangan - Halaman ${i} dari ${totalPages}`, 14, 290);
  }

  const safeName = profile.businessName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Laporan_Keuangan_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
