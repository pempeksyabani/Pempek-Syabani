import React, { useState, useMemo } from 'react';
import { Order, Income, Expense, FinancialSummary } from '../types';
import { formatRupiah, formatShortDate, calculateSummary } from '../utils/storage';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Percent,
  AlertCircle,
  Calendar,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface DashboardViewProps {
  orders: Order[];
  incomes: Income[];
  expenses: Expense[];
  onNavigateTab: (tab: 'dashboard' | 'orders' | 'income' | 'expenses' | 'recap' | 'profile') => void;
  onOpenNewOrder: () => void;
  onOpenNewIncome: () => void;
  onOpenNewExpense: () => void;
}

const PIE_COLORS = ['#d97706', '#059669', '#dc2626', '#2563eb', '#7c3aed', '#db2777', '#0891b2', '#4b5563'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  incomes,
  expenses,
  onNavigateTab,
  onOpenNewOrder,
  onOpenNewIncome,
  onOpenNewExpense,
}) => {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'month' | 'all'>('30days');

  // Filter calculations based on timeRange
  const { filteredIncomes, filteredExpenses, filteredOrders, dateRangeLabel } = useMemo(() => {
    const today = new Date();
    let startDate: string | undefined;
    let label = 'Semua Waktu';

    if (timeRange === '7days') {
      const d = new Date(today);
      d.setDate(d.getDate() - 7);
      startDate = d.toISOString().slice(0, 10);
      label = '7 Hari Terakhir';
    } else if (timeRange === '30days') {
      const d = new Date(today);
      d.setDate(d.getDate() - 30);
      startDate = d.toISOString().slice(0, 10);
      label = '30 Hari Terakhir';
    } else if (timeRange === 'month') {
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      startDate = `${year}-${month}-01`;
      label = 'Bulan Berjalan';
    }

    const fIncomes = incomes.filter(i => !startDate || i.date >= startDate);
    const fExpenses = expenses.filter(e => !startDate || e.date >= startDate);
    const fOrders = orders.filter(o => !startDate || o.date >= startDate);

    return {
      filteredIncomes: fIncomes,
      filteredExpenses: fExpenses,
      filteredOrders: fOrders,
      dateRangeLabel: label,
    };
  }, [incomes, expenses, orders, timeRange]);

  const summary: FinancialSummary = useMemo(() => {
    return calculateSummary(filteredIncomes, filteredExpenses, filteredOrders);
  }, [filteredIncomes, filteredExpenses, filteredOrders]);

  // Aggregate daily trend for AreaChart
  const dailyTrendData = useMemo(() => {
    const dateMap: Record<string, { date: string; displayDate: string; pemasukan: number; pengeluaran: number; laba: number }> = {};

    // Collect all dates from incomes and expenses
    filteredIncomes.forEach(inc => {
      if (!dateMap[inc.date]) {
        dateMap[inc.date] = { date: inc.date, displayDate: formatShortDate(inc.date), pemasukan: 0, pengeluaran: 0, laba: 0 };
      }
      dateMap[inc.date].pemasukan += Number(inc.amount) || 0;
    });

    filteredExpenses.forEach(exp => {
      if (!dateMap[exp.date]) {
        dateMap[exp.date] = { date: exp.date, displayDate: formatShortDate(exp.date), pemasukan: 0, pengeluaran: 0, laba: 0 };
      }
      dateMap[exp.date].pengeluaran += Number(exp.amount) || 0;
    });

    const sortedDates = Object.keys(dateMap).sort();
    return sortedDates.map(d => {
      const item = dateMap[d];
      item.laba = item.pemasukan - item.pengeluaran;
      return item;
    });
  }, [filteredIncomes, filteredExpenses]);

  // Expense categories breakdown for PieChart
  const expenseCategoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
      catMap[exp.category] = (catMap[exp.category] || 0) + (Number(exp.amount) || 0);
    });

    return Object.entries(catMap).map(([name, value]) => ({
      name,
      value,
    })).sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  // Top Pempek Products sold based on orders
  const topProductsData = useMemo(() => {
    const itemMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    filteredOrders.forEach(o => {
      o.orderItems.forEach(item => {
        if (!itemMap[item.itemName]) {
          itemMap[item.itemName] = { name: item.itemName, quantity: 0, revenue: 0 };
        }
        itemMap[item.itemName].quantity += Number(item.quantity) || 0;
        itemMap[item.itemName].revenue += Number(item.subtotal) || 0;
      });
    });

    return Object.values(itemMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6);
  }, [filteredOrders]);

  const isProfit = summary.netProfit >= 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Quick Actions */}
      <div className="bg-linear-to-r from-amber-900 via-amber-800 to-amber-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-amber-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-700/60 px-3 py-1 rounded-full text-xs font-medium text-amber-200 mb-2 border border-amber-600/50">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Dashboard Finansial Real-Time</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Pembukuan & Laba Usaha Pempek Syabani
          </h2>
          <p className="text-sm text-amber-200/90 mt-1 max-w-xl">
            Pantau arus kas, status pesanan pelanggan, dan proyeksi keuntungan bersih secara otomatis dan terintegrasi.
          </p>
        </div>

        {/* Quick Add Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="dash-quick-order-btn"
            onClick={onOpenNewOrder}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-xl shadow-xs transition cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            + Pesanan Baru
          </button>
          <button
            id="dash-quick-income-btn"
            onClick={onOpenNewIncome}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            + Pemasukan
          </button>
          <button
            id="dash-quick-expense-btn"
            onClick={onOpenNewExpense}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-xs transition cursor-pointer"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            + Pengeluaran
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-stone-200">
        <div className="flex items-center gap-2 text-xs font-medium text-stone-600">
          <Calendar className="w-4 h-4 text-amber-700" />
          <span>Rentang Analisis: <strong className="text-stone-900">{dateRangeLabel}</strong></span>
        </div>

        <div className="inline-flex bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
          <button
            id="filter-7days-btn"
            onClick={() => setTimeRange('7days')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              timeRange === '7days' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            7 Hari
          </button>
          <button
            id="filter-30days-btn"
            onClick={() => setTimeRange('30days')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              timeRange === '30days' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            30 Hari
          </button>
          <button
            id="filter-month-btn"
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              timeRange === 'month' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Bulan Ini
          </button>
          <button
            id="filter-all-btn"
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              timeRange === 'all' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pemasukan */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Total Pemasukan
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-stone-900">
              {formatRupiah(summary.totalIncome)}
            </div>
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
              <span>{filteredIncomes.length} transaksi pemasukan</span>
            </p>
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs relative overflow-hidden group hover:border-rose-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Total Pengeluaran
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-stone-900">
              {formatRupiah(summary.totalExpense)}
            </div>
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
              <span>{filteredExpenses.length} pos belanja & biaya operasional</span>
            </p>
          </div>
        </div>

        {/* Keuntungan Bersih (Net Profit) */}
        <div
          className={`rounded-2xl p-5 border shadow-xs relative overflow-hidden transition ${
            isProfit
              ? 'bg-emerald-50/60 border-emerald-300'
              : 'bg-rose-50/60 border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isProfit ? 'text-emerald-900' : 'text-rose-900'}`}>
              Keuntungan Bersih (Laba)
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isProfit ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
              }`}
            >
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-extrabold ${isProfit ? 'text-emerald-800' : 'text-rose-800'}`}>
              {formatRupiah(summary.netProfit)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isProfit ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
              }`}>
                Marjin {summary.profitMargin.toFixed(1)}%
              </span>
              <span className="text-xs text-stone-500">
                {isProfit ? 'Surplus Laba' : 'Defisit Sementara'}
              </span>
            </div>
          </div>
        </div>

        {/* Status Pesanan & Piutang */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs relative overflow-hidden group hover:border-amber-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Aktivitas Pesanan
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-stone-900">
              {summary.ordersCount} <span className="text-sm font-semibold text-stone-500">Pesanan</span>
            </div>
            <div className="text-xs text-stone-500 mt-1 flex items-center justify-between">
              {summary.unpaidOrdersTotal > 0 ? (
                <span className="text-amber-700 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Piutang: {formatRupiah(summary.unpaidOrdersTotal)}
                </span>
              ) : (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Semua Pesanan Lunas
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (Span 2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-stone-900">
                Tren Pendapatan, Pengeluaran & Keuntungan
              </h3>
              <p className="text-xs text-stone-500">
                Grafik pergerakan arus kas harian secara real-time
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                <span className="text-stone-600">Pemasukan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
                <span className="text-stone-600">Pengeluaran</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-amber-600 inline-block" />
                <span className="text-stone-600">Laba Bersih</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            {dailyTrendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-stone-400 text-sm">
                Belum ada data transaksi dalam rentang tanggal ini.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="displayDate" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={val => `${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: any, name: any) => {
                      const num = Number(val) || 0;
                      return [formatRupiah(num), name === 'pemasukan' ? 'Pemasukan' : name === 'pengeluaran' ? 'Pengeluaran' : 'Laba Bersih'];
                    }}
                    labelFormatter={label => `Tanggal: ${label}`}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pemasukan"
                    name="pemasukan"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#incomeGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="pengeluaran"
                    name="pengeluaran"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#expenseGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="laba"
                    name="laba"
                    stroke="#d97706"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    fillOpacity={1}
                    fill="url(#profitGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Expenses Composition Pie Chart (Span 1 col) */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="border-b border-stone-100 pb-2">
            <h3 className="font-bold text-base text-stone-900">
              Alokasi Pengeluaran
            </h3>
            <p className="text-xs text-stone-500">
              Proporsi belanja modal & operasional
            </p>
          </div>

          <div className="h-52 w-full">
            {expenseCategoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-stone-400 text-sm">
                Belum ada data pengeluaran.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseCategoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => formatRupiah(Number(val) || 0)}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top 4 Categories List */}
          <div className="space-y-1.5 pt-2 border-t border-stone-100 text-xs">
            {expenseCategoryData.slice(0, 4).map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="truncate text-stone-700">{cat.name}</span>
                </div>
                <span className="font-semibold text-stone-900">{formatRupiah(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products & Recent Transactions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pempek Products Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-2">
            <h3 className="font-bold text-base text-stone-900">
              Menu Pempek Paling Laris
            </h3>
            <p className="text-xs text-stone-500">
              Berdasarkan kuantitas pesanan yang terjual
            </p>
          </div>

          <div className="h-64 w-full">
            {topProductsData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-stone-400 text-sm">
                Belum ada data pesanan menu.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProductsData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fontSize: 10, fill: '#334155' }}
                    tickFormatter={val => val.length > 15 ? `${val.slice(0, 15)}..` : val}
                  />
                  <Tooltip
                    formatter={(val: any, _, item: any) => [
                      `${val} porsi (${formatRupiah(item.payload.revenue)})`,
                      'Terjual',
                    ]}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="quantity" fill="#b45309" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Orders List (Span 2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-stone-900">
                Aktivitas Pesanan Terkini
              </h3>
              <p className="text-xs text-stone-500">
                Pesanan masuk terakhir dan status pembayarannya
              </p>
            </div>
            <button
              id="view-all-orders-btn"
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
            >
              Lihat Semua Pesanan &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 uppercase font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Pemesan</th>
                  <th className="py-2.5 px-3">Item Pesanan</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Pembayaran</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.slice(0, 5).map(o => (
                  <tr key={o.id} className="hover:bg-amber-50/40 transition">
                    <td className="py-2.5 px-3 font-semibold text-stone-900">
                      <div>{o.customerName}</div>
                      <span className="text-[10px] text-stone-500">{o.date} &bull; {o.id}</span>
                    </td>
                    <td className="py-2.5 px-3 text-stone-600 max-w-xs truncate">
                      {o.orderItems.map(i => `${i.itemName} (${i.quantity}x)`).join(', ')}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-stone-900">
                      {formatRupiah(o.totalAmount)}
                    </td>
                    <td className="py-2.5 px-3">
                      {o.paymentStatus === 'lunas' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-2.5 h-2.5" /> Lunas ({o.paymentMethod})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                          <Clock className="w-2.5 h-2.5" /> Belum Lunas
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium capitalize ${
                          o.orderStatus === 'selesai'
                            ? 'bg-stone-100 text-stone-700'
                            : o.orderStatus === 'proses'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {o.orderStatus === 'proses' ? 'Diproses' : o.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
