import React, { useState, useEffect } from 'react';
import { Order, Income, Expense, BusinessProfile, MenuItem } from './types';
import {
  loadOrders,
  saveOrders,
  loadIncomes,
  saveIncomes,
  loadExpenses,
  saveExpenses,
  loadProfile,
  saveProfile,
  loadMenuItems,
  saveMenuItems,
  resetMenuItems,
  resetToDefaultData,
} from './utils/storage';
import { Navbar, NavTabType } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { OrdersView } from './components/OrdersView';
import { MenuView } from './components/MenuView';
import { IncomeView } from './components/IncomeView';
import { ExpenseView } from './components/ExpenseView';
import { RecapView } from './components/RecapView';
import { BusinessProfileView } from './components/BusinessProfileView';
import { OrderFormModal } from './components/OrderFormModal';
import { IncomeFormModal } from './components/IncomeFormModal';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { OrderReceiptModal } from './components/OrderReceiptModal';

export default function App() {
  const [orders, setOrders] = useState<Order[]>(() => loadOrders());
  const [incomes, setIncomes] = useState<Income[]>(() => loadIncomes());
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpenses());
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => loadMenuItems());
  const [profile, setProfile] = useState<BusinessProfile>(() => loadProfile());

  const [activeTab, setActiveTab] = useState<NavTabType>('dashboard');

  // Modals state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);

  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [incomeToEdit, setIncomeToEdit] = useState<Income | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  const [orderForReceipt, setOrderForReceipt] = useState<Order | null>(null);

  // Auto-save whenever state changes
  useEffect(() => {
    saveOrders(orders);
  }, [orders]);

  useEffect(() => {
    saveIncomes(incomes);
  }, [incomes]);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveMenuItems(menuItems);
  }, [menuItems]);

  // Order CRUD Handlers
  const handleSaveOrder = (savedOrder: Order, syncToIncome: boolean) => {
    setOrders(prevOrders => {
      const exists = prevOrders.some(o => o.id === savedOrder.id);
      if (exists) {
        return prevOrders.map(o => (o.id === savedOrder.id ? savedOrder : o));
      } else {
        return [savedOrder, ...prevOrders];
      }
    });

    // Interconnect with Incomes
    if (syncToIncome && savedOrder.paymentStatus === 'lunas') {
      setIncomes(prevIncomes => {
        const existingIncomeIndex = prevIncomes.findIndex(
          inc => inc.relatedOrderId === savedOrder.id || (savedOrder.syncedIncomeId && inc.id === savedOrder.syncedIncomeId)
        );

        if (existingIncomeIndex >= 0) {
          const updated = [...prevIncomes];
          updated[existingIncomeIndex] = {
            ...updated[existingIncomeIndex],
            title: `Pesanan ${savedOrder.customerName} (${savedOrder.id})`,
            amount: savedOrder.totalAmount,
            date: savedOrder.date,
            paymentMethod: savedOrder.paymentMethod,
            relatedOrderId: savedOrder.id,
          };
          return updated;
        } else {
          const newIncome: Income = {
            id: `INC-${savedOrder.id.replace('ORD-', '')}`,
            date: savedOrder.date,
            title: `Pesanan ${savedOrder.customerName} (${savedOrder.id})`,
            category: 'Pesanan Pelanggan',
            amount: savedOrder.totalAmount,
            paymentMethod: savedOrder.paymentMethod,
            relatedOrderId: savedOrder.id,
            notes: savedOrder.notes,
            createdAt: Date.now(),
          };
          return [newIncome, ...prevIncomes];
        }
      });
    } else if (savedOrder.paymentStatus === 'belum_lunas') {
      // If changed to unpaid, remove the linked income to keep profit accurate
      setIncomes(prevIncomes => prevIncomes.filter(inc => inc.relatedOrderId !== savedOrder.id));
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    // Also remove linked income
    setIncomes(prev => prev.filter(inc => inc.relatedOrderId !== orderId));
  };

  const handleDeleteMultipleOrders = (orderIds: string[]) => {
    setOrders(prev => prev.filter(o => !orderIds.includes(o.id)));
    setIncomes(prev => prev.filter(inc => !inc.relatedOrderId || !orderIds.includes(inc.relatedOrderId)));
  };

  const handleClearAllOrders = () => {
    setOrders([]);
    setIncomes(prev => prev.filter(inc => !inc.relatedOrderId));
  };

  const handleTogglePaymentStatus = (order: Order) => {
    const nextStatus = order.paymentStatus === 'lunas' ? 'belum_lunas' : 'lunas';
    const updatedOrder: Order = {
      ...order,
      paymentStatus: nextStatus,
    };

    setOrders(prev => prev.map(o => (o.id === order.id ? updatedOrder : o)));

    if (nextStatus === 'lunas') {
      // Add or update linked income
      setIncomes(prev => {
        const hasLinked = prev.some(i => i.relatedOrderId === order.id);
        if (!hasLinked) {
          const newIncome: Income = {
            id: `INC-${order.id.replace('ORD-', '')}`,
            date: order.date,
            title: `Pesanan ${order.customerName} (${order.id})`,
            category: 'Pesanan Pelanggan',
            amount: order.totalAmount,
            paymentMethod: order.paymentMethod,
            relatedOrderId: order.id,
            notes: order.notes,
            createdAt: Date.now(),
          };
          return [newIncome, ...prev];
        }
        return prev;
      });
    } else {
      // Remove from income
      setIncomes(prev => prev.filter(i => i.relatedOrderId !== order.id));
    }
  };

  // Income CRUD Handlers
  const handleSaveIncome = (income: Income) => {
    setIncomes(prev => {
      const exists = prev.some(i => i.id === income.id);
      if (exists) {
        return prev.map(i => (i.id === income.id ? income : i));
      } else {
        return [income, ...prev];
      }
    });
  };

  const handleDeleteIncome = (incomeId: string) => {
    setIncomes(prev => prev.filter(i => i.id !== incomeId));
  };

  const handleDeleteMultipleIncomes = (incomeIds: string[]) => {
    setIncomes(prev => prev.filter(i => !incomeIds.includes(i.id)));
  };

  const handleClearAllIncomes = () => {
    setIncomes([]);
  };

  // Expense CRUD Handlers
  const handleSaveExpense = (expense: Expense) => {
    setExpenses(prev => {
      const exists = prev.some(e => e.id === expense.id);
      if (exists) {
        return prev.map(e => (e.id === expense.id ? expense : e));
      } else {
        return [expense, ...prev];
      }
    });
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
  };

  const handleDeleteMultipleExpenses = (expenseIds: string[]) => {
    setExpenses(prev => prev.filter(e => !expenseIds.includes(e.id)));
  };

  const handleClearAllExpenses = () => {
    setExpenses([]);
  };

  // Menu Catalog CRUD Handlers
  const handleSaveMenuItem = (item: MenuItem) => {
    setMenuItems(prev => {
      const exists = prev.some(m => m.id === item.id);
      if (exists) {
        return prev.map(m => (m.id === item.id ? item : m));
      }
      return [item, ...prev];
    });
  };

  const handleDeleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(m => m.id !== id));
  };

  const handleDeleteMultipleMenuItems = (ids: string[]) => {
    setMenuItems(prev => prev.filter(m => !ids.includes(m.id)));
  };

  const handleToggleMenuItemAvailability = (id: string) => {
    setMenuItems(prev =>
      prev.map(m => (m.id === id ? { ...m, isAvailable: m.isAvailable === false ? true : false } : m))
    );
  };

  const handleResetMenuItems = () => {
    const defaults = resetMenuItems();
    setMenuItems(defaults);
  };

  // Reset to default starter data
  const handleResetData = () => {
    if (confirm('Kembalikan data pesanan, pemasukan, pengeluaran, dan daftar menu ke contoh bawaan Pempek Syabani?')) {
      const defaults = resetToDefaultData();
      setOrders(defaults.orders);
      setIncomes(defaults.incomes);
      setExpenses(defaults.expenses);
      setMenuItems(loadMenuItems());
    }
  };

  const handleSaveProfile = (updatedProfile: BusinessProfile) => {
    setProfile(updatedProfile);
    saveProfile(updatedProfile);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewOrder={() => {
          setOrderToEdit(null);
          setIsOrderModalOpen(true);
        }}
        onResetData={handleResetData}
        profile={profile}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            orders={orders}
            incomes={incomes}
            expenses={expenses}
            onNavigateTab={setActiveTab}
            onOpenNewOrder={() => {
              setOrderToEdit(null);
              setIsOrderModalOpen(true);
            }}
            onOpenNewIncome={() => {
              setIncomeToEdit(null);
              setIsIncomeModalOpen(true);
            }}
            onOpenNewExpense={() => {
              setExpenseToEdit(null);
              setIsExpenseModalOpen(true);
            }}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersView
            orders={orders}
            onAddOrder={() => {
              setOrderToEdit(null);
              setIsOrderModalOpen(true);
            }}
            onEditOrder={order => {
              setOrderToEdit(order);
              setIsOrderModalOpen(true);
            }}
            onDeleteOrder={handleDeleteOrder}
            onDeleteMultipleOrders={handleDeleteMultipleOrders}
            onClearAllOrders={handleClearAllOrders}
            onTogglePaymentStatus={handleTogglePaymentStatus}
            onPrintReceipt={order => setOrderForReceipt(order)}
          />
        )}

        {activeTab === 'menu' && (
          <MenuView
            menuItems={menuItems}
            onSaveMenuItem={handleSaveMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
            onDeleteMultipleMenuItems={handleDeleteMultipleMenuItems}
            onToggleAvailability={handleToggleMenuItemAvailability}
            onResetMenuItems={handleResetMenuItems}
          />
        )}

        {activeTab === 'income' && (
          <IncomeView
            incomes={incomes}
            onAddIncome={() => {
              setIncomeToEdit(null);
              setIsIncomeModalOpen(true);
            }}
            onEditIncome={income => {
              setIncomeToEdit(income);
              setIsIncomeModalOpen(true);
            }}
            onDeleteIncome={handleDeleteIncome}
            onDeleteMultipleIncomes={handleDeleteMultipleIncomes}
            onClearAllIncomes={handleClearAllIncomes}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseView
            expenses={expenses}
            onAddExpense={() => {
              setExpenseToEdit(null);
              setIsExpenseModalOpen(true);
            }}
            onEditExpense={expense => {
              setExpenseToEdit(expense);
              setIsExpenseModalOpen(true);
            }}
            onDeleteExpense={handleDeleteExpense}
            onDeleteMultipleExpenses={handleDeleteMultipleExpenses}
            onClearAllExpenses={handleClearAllExpenses}
          />
        )}

        {activeTab === 'recap' && (
          <RecapView
            orders={orders}
            incomes={incomes}
            expenses={expenses}
            profile={profile}
          />
        )}

        {activeTab === 'profile' && (
          <BusinessProfileView
            profile={profile}
            onSaveProfile={handleSaveProfile}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 text-center text-xs text-stone-500 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium text-stone-700">
            &copy; {new Date().getFullYear()} {profile.businessName} &bull; Sistem Pembukuan & Keuangan UMKM
          </p>
          <p className="text-stone-400">
            Arus Kas &bull; Rekapitulasi Otomatis &bull; Ekspor PDF/Excel &bull; Tren Real-Time
          </p>
        </div>
      </footer>

      {/* Modals */}
      <OrderFormModal
        isOpen={isOrderModalOpen}
        orderToEdit={orderToEdit}
        menuCatalog={menuItems}
        onClose={() => setIsOrderModalOpen(false)}
        onSave={handleSaveOrder}
        onDeleteOrder={handleDeleteOrder}
      />

      <IncomeFormModal
        isOpen={isIncomeModalOpen}
        incomeToEdit={incomeToEdit}
        onClose={() => setIsIncomeModalOpen(false)}
        onSave={handleSaveIncome}
        onDeleteIncome={handleDeleteIncome}
      />

      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        expenseToEdit={expenseToEdit}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
        onDeleteExpense={handleDeleteExpense}
      />

      <OrderReceiptModal
        order={orderForReceipt}
        profile={profile}
        onClose={() => setOrderForReceipt(null)}
      />
    </div>
  );
}
