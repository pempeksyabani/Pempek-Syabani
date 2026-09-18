import React, { useState, useMemo } from 'react';
import { Order, Income, Expense, FinancialSummary, BusinessProfile } from '../types';
import { formatRupiah, formatDateIndo, calculateSummary, DEFAULT_BUSINESS_PROFILE } from '../utils/storage';
import { exportToExcel, exportToPDF } from '../utils/export';
import {
  FileText,
  Calendar,
  Download,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Percent,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface RecapViewProps {
  orders: Order[];
  incomes: Income[];
  expenses: Expense[];
  profile?: BusinessProfile;
}

export const RecapView: React.FC<RecapViewProps> = ({
  orders,
  incomes,
  expenses,
  profile = DEFAULT_BUSINESS_PROFILE,
}) => {
  const [recapMode, setRecapMode] = useState<'daily' | 'monthly'>('monthly');

  // Today's date default
  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonthStr = todayStr.slice(0, 7); // YYYY-MM

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);

  // 1. Daily Calculation
  const dailyData = useMemo(() => {
    const dayIncomes = incomes.filter(i => i.date === selectedDate);
    const dayExpenses = expenses.filter(e => e.date === selectedDate);
    const dayOrders = orders.filter(o => o.date === selectedDate);

    const totalIncome = dayIncomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const totalExpense = dayExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const netProfit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    return {
      date: selectedDate,
      incomes: dayIncomes,
      expenses: dayExpenses,
      orders: dayOrders,
      totalIncome,
      totalExpense,
      netProfit,
      profitMargin,
    };
  }, [incomes, expenses, orders, selectedDate]);

  // 2. Monthly Calculation
  const monthlyData = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);

    // Days in this month
    const daysInMonth = new Date(year, month, 0).getDate();

    const monthIncomes = incomes.filter(i => i.date.startsWith(selectedMonth));
    const monthExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));
    const monthOrders = orders.filter(o => o.date.startsWith(selectedMonth));

    const totalIncome = monthIncomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const totalExpense = monthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const netProfit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    // Daily breakdown table rows for each day of the month
    const dailyBreakdown = [];
    let bestDayDate = '';
    let bestDayProfit = -Infinity;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayFormatted = String(day).padStart(2, '0');
      const dateStr = `${selectedMonth}-${dayFormatted}`;

      const dIncomes = monthIncomes.filter(i => i.date === dateStr);
      const dExpenses = monthExpenses.filter(e => e.date === dateStr);
      const dOrders = monthOrders.filter(o => o.date === dateStr);

      const dInc = dIncomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
      const dExp = dExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const dProfit = dInc - dExp;

      if (dProfit > bestDayProfit && (dInc > 0 || dExp > 0)) {
        bestDayProfit = dProfit;
        bestDayDate = dateStr;
      }

      // Only push if within past or has data or all days
      dailyBreakdown.push({
        day,
        dateStr,
        income: dInc,
        expense: dExp,
        profit: dProfit,
        ordersCount: dOrders.length,
        hasActivity: dInc > 0 || dExp > 0 || dOrders.length > 0,
      });
    }

    const avgDailyIncome = daysInMonth > 0 ? totalIncome / daysInMonth : 0;

    return {
      selectedMonth,
      totalIncome,
      totalExpense,
      netProfit,
      profitMargin,
      monthIncomes,
      monthExpenses,
      monthOrders,
      dailyBreakdown,
      avgDailyIncome,
      bestDayDate,
      bestDayProfit: bestDayProfit === -Infinity ? 0 : bestDayProfit,
    };
  }, [incomes, expenses, orders, selectedMonth]);

  // Current active summary for export
  const activeSummary: FinancialSummary = useMemo(() => {
    if (recapMode === 'daily') {
      return {
        totalIncome: dailyData.totalIncome,
        totalExpense: dailyData.totalExpense,
        netProfit: dailyData.netProfit,
        profitMargin: dailyData.profitMargin,
        ordersCount: dailyData.orders.length,
        unpaidOrdersTotal: dailyData.orders
          .filter(o => o.paymentStatus === 'belum_lunas')
          .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0),
      };
    } else {
      return {
        totalIncome: monthlyData.totalIncome,
        totalExpense: monthlyData.totalExpense,
        netProfit: monthlyData.netProfit,
        profitMargin: monthlyData.profitMargin,
        ordersCount: monthlyData.monthOrders.length,
        unpaidOrdersTotal: monthlyData.monthOrders
          .filter(o => o.paymentStatus === 'belum_lunas')
          .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0),
      };
    }
  }, [recapMode, dailyData, monthlyData]);

  const activeLabel = useMemo(() => {
    if (recapMode === 'daily') {
      return `Harian (${formatDateIndo(selectedDate)})`;
    }
    const [y, m] = selectedMonth.split('-');
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, 1);
    const monthName = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    return `Bulanan (${monthName})`;
  }, [recapMode, selectedDate, selectedMonth]);

  const handleExportPDF = () => {
    const ords = recapMode === 'daily' ? dailyData.orders : monthlyData.monthOrders;
    const incs = recapMode === 'daily' ? dailyData.incomes : monthlyData.monthIncomes;
    const exps = recapMode === 'daily' ? dailyData.expenses : monthlyData.monthExpenses;
    exportToPDF(ords, incs, exps, activeSummary, activeLabel, profile);
  };

  const handleExportExcel = () => {
    const ords = recapMode === 'daily' ? dailyData.orders : monthlyData.monthOrders;
    const incs = recapMode === 'daily' ? dailyData.incomes : monthlyData.monthIncomes;
    const exps = recapMode === 'daily' ? dailyData.expenses : monthlyData.monthExpenses;
    exportToExcel(ords, incs, exps, activeSummary, activeLabel, profile);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-amber-900 font-bold text-lg">
            <FileText className="w-5 h-5 text-amber-700" />
            <h2>Rekapitulasi Keuangan Otomatis & Laporan Laba Rugi</h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Rekap pendapatan, beban operasional, dan laba bersih {profile.businessName} secara harian maupun bulanan.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="export-pdf-btn"
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor Laporan PDF
          </button>
          <button
            id="export-excel-btn"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Ekspor ke Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Mode Selector & Date Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-stone-100 p-3.5 rounded-2xl border border-stone-200">
        <div className="inline-flex bg-white p-1 rounded-xl border border-stone-200 text-xs shadow-2xs">
          <button
            id="mode-monthly-btn"
            onClick={() => setRecapMode('monthly')}
            className={`px-4 py-2 rounded-lg font-bold transition cursor-pointer ${
              recapMode === 'monthly'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Laporan Bulanan
          </button>
          <button
            id="mode-daily-btn"
            onClick={() => setRecapMode('daily')}
            className={`px-4 py-2 rounded-lg font-bold transition cursor-pointer ${
              recapMode === 'daily'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Laporan Harian
          </button>
        </div>

        {/* Date / Month Picker */}
        <div className="flex items-center gap-2">
          {recapMode === 'daily' ? (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-stone-200">
              <Calendar className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-semibold text-stone-700">Pilih Tanggal:</span>
              <input
                id="recap-daily-picker"
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="text-xs font-bold text-stone-900 border-none bg-transparent focus:outline-none cursor-pointer"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-stone-200">
              <Calendar className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-semibold text-stone-700">Pilih Bulan:</span>
              <input
                id="recap-monthly-picker"
                type="month"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="text-xs font-bold text-stone-900 border-none bg-transparent focus:outline-none cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* Financial Statement Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pemasukan */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Pemasukan ({recapMode === 'daily' ? 'Hari Ini' : 'Bulan Ini'})
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 mt-2">
            {formatRupiah(activeSummary.totalIncome)}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Total penerimaan arus kas bersih
          </p>
        </div>

        {/* Pengeluaran */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Pengeluaran ({recapMode === 'daily' ? 'Hari Ini' : 'Bulan Ini'})
            </span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 mt-2">
            {formatRupiah(activeSummary.totalExpense)}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Total biaya bahan baku & operasional
          </p>
        </div>

        {/* Keuntungan / Laba Bersih */}
        <div
          className={`p-5 rounded-2xl border shadow-xs ${
            activeSummary.netProfit >= 0
              ? 'bg-emerald-50/70 border-emerald-300'
              : 'bg-rose-50/70 border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                activeSummary.netProfit >= 0 ? 'text-emerald-900' : 'text-rose-900'
              }`}
            >
              Laba Bersih Usaha
            </span>
            <DollarSign
              className={`w-4 h-4 ${
                activeSummary.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            />
          </div>
          <div
            className={`text-2xl font-extrabold mt-2 ${
              activeSummary.netProfit >= 0 ? 'text-emerald-800' : 'text-rose-800'
            }`}
          >
            {formatRupiah(activeSummary.netProfit)}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                activeSummary.netProfit >= 0 ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
              }`}
            >
              Marjin: {activeSummary.profitMargin.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Volume & Piutang */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Jumlah Pesanan
            </span>
            <ShoppingBag className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 mt-2">
            {activeSummary.ordersCount} <span className="text-sm font-normal text-stone-500">transaksi</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Piutang belum lunas: <strong className="text-amber-800">{formatRupiah(activeSummary.unpaidOrdersTotal)}</strong>
          </p>
        </div>
      </div>

      {/* View Conditional: Daily vs Monthly */}
      {recapMode === 'daily' ? (
        /* DAILY BREAKDOWN TABLES */
        <div className="space-y-6">
          {/* Order Details of the Day */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-base text-stone-900">
                Pesanan Pelanggan Tanggal {formatDateIndo(selectedDate)}
              </h3>
              <span className="text-xs text-stone-500">
                {dailyData.orders.length} pesanan masuk
              </span>
            </div>

            {dailyData.orders.length === 0 ? (
              <p className="text-sm text-stone-400 py-4 text-center">
                Tidak ada pesanan masuk pada tanggal ini.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-700 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Pemesan</th>
                      <th className="py-2.5 px-3">Rincian Menu</th>
                      <th className="py-2.5 px-3">Total</th>
                      <th className="py-2.5 px-3">Status Bayar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {dailyData.orders.map(o => (
                      <tr key={o.id}>
                        <td className="py-2.5 px-3 font-semibold text-stone-900">
                          {o.customerName}
                          <span className="block text-[10px] text-stone-400 font-normal">{o.paymentMethod}</span>
                        </td>
                        <td className="py-2.5 px-3 text-stone-600">
                          {o.orderItems.map(i => `${i.itemName} (${i.quantity}x)`).join(', ')}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-stone-900">
                          {formatRupiah(o.totalAmount)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              o.paymentStatus === 'lunas'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {o.paymentStatus === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Cashflow in/out comparison table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income breakdown */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-3">
              <h4 className="font-bold text-sm text-emerald-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Rincian Pemasukan ({formatRupiah(dailyData.totalIncome)})
              </h4>
              {dailyData.incomes.length === 0 ? (
                <p className="text-xs text-stone-400 py-3">Tidak ada data pemasukan tercatat.</p>
              ) : (
                <div className="divide-y divide-stone-100 text-xs">
                  {dailyData.incomes.map(i => (
                    <div key={i.id} className="py-2 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-stone-800">{i.title}</div>
                        <span className="text-[10px] text-stone-500">{i.category} &bull; {i.paymentMethod}</span>
                      </div>
                      <span className="font-bold text-emerald-700">{formatRupiah(i.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expense breakdown */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-3">
              <h4 className="font-bold text-sm text-rose-800 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Rincian Pengeluaran ({formatRupiah(dailyData.totalExpense)})
              </h4>
              {dailyData.expenses.length === 0 ? (
                <p className="text-xs text-stone-400 py-3">Tidak ada data pengeluaran tercatat.</p>
              ) : (
                <div className="divide-y divide-stone-100 text-xs">
                  {dailyData.expenses.map(e => (
                    <div key={e.id} className="py-2 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-stone-800">{e.title}</div>
                        <span className="text-[10px] text-stone-500">{e.category} &bull; {e.paymentMethod}</span>
                      </div>
                      <span className="font-bold text-rose-700">{formatRupiah(e.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* MONTHLY BREAKDOWN TABLE (Day-by-Day Financial Log) */
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <h3 className="font-bold text-base text-stone-900">
                Rekapitulasi Harian dalam Bulan {selectedMonth}
              </h3>
              <p className="text-xs text-stone-500">
                Audit rincian arus kas harian untuk melihat pola penjualan dan hari paling produktif.
              </p>
            </div>

            {monthlyData.bestDayDate && (
              <div className="bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-xs text-amber-900">
                Hari Laba Tertinggi: <strong>{formatDateIndo(monthlyData.bestDayDate)}</strong> ({formatRupiah(monthlyData.bestDayProfit)})
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-700 uppercase font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Pemasukan</th>
                  <th className="py-3 px-4">Pengeluaran</th>
                  <th className="py-3 px-4">Keuntungan Bersih</th>
                  <th className="py-3 px-4">Pesanan Masuk</th>
                  <th className="py-3 px-4">Status Kas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {monthlyData.dailyBreakdown.map(row => {
                  if (!row.hasActivity) return null; // Only show days with activity
                  const isDayProfit = row.profit >= 0;
                  return (
                    <tr key={row.dateStr} className="hover:bg-stone-50 transition">
                      <td className="py-2.5 px-4 font-semibold text-stone-900">
                        {formatDateIndo(row.dateStr)}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-emerald-700">
                        {row.income > 0 ? formatRupiah(row.income) : '-'}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-rose-700">
                        {row.expense > 0 ? formatRupiah(row.expense) : '-'}
                      </td>
                      <td className="py-2.5 px-4 font-extrabold">
                        <span className={isDayProfit ? 'text-emerald-800' : 'text-rose-800'}>
                          {formatRupiah(row.profit)}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-stone-600">
                        {row.ordersCount > 0 ? `${row.ordersCount} pesanan` : '-'}
                      </td>
                      <td className="py-2.5 px-4">
                        {isDayProfit ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Untung
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" /> Biaya Lebih Besar
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {/* Monthly Totals Row */}
                <tr className="bg-amber-50/80 font-bold text-stone-900 border-t-2 border-amber-300">
                  <td className="py-3 px-4 uppercase text-amber-950">
                    TOTAL BULAN {selectedMonth}
                  </td>
                  <td className="py-3 px-4 text-emerald-800 text-sm">
                    {formatRupiah(monthlyData.totalIncome)}
                  </td>
                  <td className="py-3 px-4 text-rose-800 text-sm">
                    {formatRupiah(monthlyData.totalExpense)}
                  </td>
                  <td className="py-3 px-4 text-sm font-extrabold">
                    <span className={monthlyData.netProfit >= 0 ? 'text-emerald-900' : 'text-rose-900'}>
                      {formatRupiah(monthlyData.netProfit)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-900">
                    {monthlyData.monthOrders.length} Pesanan
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-amber-900">
                    Marjin: {monthlyData.profitMargin.toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
