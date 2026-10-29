import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav, TabType } from './components/BottomNav';
import { TopTabs, MainTab } from './components/TopTabs';
import { DashboardView } from './components/DashboardView';
import { ExpensesView } from './components/ExpensesView';
import { LaborContractorView } from './components/LaborContractorView';
import { StagesTrackerView } from './components/StagesTrackerView';
import { BudgetPlannerView } from './components/BudgetPlannerView';
import { ReportsView } from './components/ReportsView';
import { AddExpenseModal } from './components/AddExpenseModal';
import { PaymentRecordModal } from './components/PaymentRecordModal';
import { EditBudgetModal } from './components/EditBudgetModal';
import { SettingsModal } from './components/SettingsModal';

import { 
  Expense, 
  Category, 
  ConstructionStage, 
  ContractorWorker, 
  ProjectSettings, 
  StageStatus, 
  PaymentRecord 
} from './types';
import { 
  getStoredProject, 
  saveStoredProject, 
  getStoredExpenses, 
  saveStoredExpenses, 
  getStoredCategories, 
  saveStoredCategories, 
  getStoredStages, 
  saveStoredStages, 
  getStoredContractors, 
  saveStoredContractors, 
  reloadSampleData, 
  resetToEmptyProject 
} from './utils/storage';
import { calculateFinancialSummary } from './utils/calculations';
import { translations } from './utils/translations';

export default function App() {
  // Primary State
  const [project, setProject] = useState<ProjectSettings>(() => getStoredProject());
  const [expenses, setExpenses] = useState<Expense[]>(() => getStoredExpenses());
  const [categories, setCategories] = useState<Category[]>(() => getStoredCategories());
  const [stages, setStages] = useState<ConstructionStage[]>(() => getStoredStages());
  const [contractors, setContractors] = useState<ContractorWorker[]>(() => getStoredContractors());

  // UI Navigation State
  const [activeTab, setActiveTab] = useState<MainTab>('dashboard');
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | undefined>(undefined);

  // Modals
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [payingExpense, setPayingExpense] = useState<Expense | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Keep HTML dir in sync with language
  useEffect(() => {
    document.documentElement.dir = project.language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = project.language;
  }, [project.language]);

  // Sync to local persistent storage whenever state changes
  useEffect(() => {
    saveStoredProject(project);
  }, [project]);

  useEffect(() => {
    saveStoredExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveStoredCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveStoredStages(stages);
  }, [stages]);

  useEffect(() => {
    saveStoredContractors(contractors);
  }, [contractors]);

  // Dynamic Financial Summary
  const summary = useMemo(() => {
    return calculateFinancialSummary(project.totalBudget, expenses);
  }, [project.totalBudget, expenses]);

  // Expense Handlers
  const handleSaveExpense = (savedExpense: Expense) => {
    setExpenses((prev) => {
      const idx = prev.findIndex((e) => e.id === savedExpense.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedExpense;
        return next;
      }
      return [savedExpense, ...prev];
    });
    setEditingExpense(null);
    showToast(project.language === 'ur' ? 'خرچ محفوظ ہو گیا' : 'Expense saved successfully');
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast(project.language === 'ur' ? 'خرچ حذف کر دیا گیا' : 'Expense deleted');
  };

  // Payment Recording for partial / unpaid dues
  const handleSavePayment = (expenseId: string, payment: PaymentRecord) => {
    setExpenses((prev) => {
      return prev.map((exp) => {
        if (exp.id !== expenseId) return exp;

        const newAmountPaid = exp.amountPaid + payment.amount;
        const newDue = Math.max(0, exp.amount - newAmountPaid);
        const newStatus = newDue === 0 ? 'paid' : 'partially_paid';

        return {
          ...exp,
          amountPaid: newAmountPaid,
          amountDue: newDue,
          paymentStatus: newStatus,
          paymentHistory: [...exp.paymentHistory, payment],
          updatedAt: new Date().toISOString(),
        };
      });
    });
    setPayingExpense(null);
    showToast(project.language === 'ur' ? 'ادائیگی کا اندراج مکمل ہوا' : 'Payment recorded successfully');
  };

  // Contractors & Labor Handlers
  const handleSaveContractor = (contractor: ContractorWorker) => {
    setContractors((prev) => {
      const idx = prev.findIndex((c) => c.id === contractor.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = contractor;
        return next;
      }
      return [contractor, ...prev];
    });
    showToast(project.language === 'ur' ? 'ٹھیکیدار کا اندراج محفوظ ہو گیا' : 'Contractor saved');
  };

  const handleDeleteContractor = (id: string) => {
    setContractors((prev) => prev.filter((c) => c.id !== id));
    showToast(project.language === 'ur' ? 'ٹھیکیدار حذف ہو گیا' : 'Contractor removed');
  };

  const handleAddLaborExpense = (expenseData: Partial<Expense>) => {
    const newExp: Expense = {
      id: `exp_${Date.now()}`,
      title: expenseData.title || 'Labor Wage',
      amount: expenseData.amount || 0,
      amountPaid: expenseData.amountPaid || 0,
      amountDue: expenseData.amountDue || 0,
      date: expenseData.date || new Date().toISOString().split('T')[0],
      categoryId: expenseData.categoryId || 'labor_wages',
      vendorName: expenseData.vendorName || 'Labor Team',
      paymentMethod: expenseData.paymentMethod || 'cash',
      paymentStatus: expenseData.paymentStatus || 'paid',
      description: expenseData.description,
      quantity: expenseData.quantity,
      unit: expenseData.unit,
      paymentHistory: expenseData.amountPaid && expenseData.amountPaid > 0 ? [
        {
          id: `pay_${Date.now()}`,
          date: expenseData.date || new Date().toISOString().split('T')[0],
          amount: expenseData.amountPaid,
          method: expenseData.paymentMethod || 'cash',
          notes: 'Daily wage payment',
          createdAt: new Date().toISOString(),
        }
      ] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setExpenses((prev) => [newExp, ...prev]);
    showToast(project.language === 'ur' ? 'دیہاڑی کا خرچ درج ہو گیا' : 'Labor expense added');
  };

  // Stage update
  const handleUpdateStageStatus = (stageId: string, status: StageStatus) => {
    setStages((prev) =>
      prev.map((s) => (s.id === stageId ? { ...s, status } : s))
    );
  };

  // Category budget update
  const handleUpdateCategoryBudget = (categoryId: string, plannedBudget: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, plannedBudget } : c))
    );
    showToast(project.language === 'ur' ? 'کیٹیگری بجٹ محفوظ ہوا' : 'Category budget updated');
  };

  // New custom category
  const handleAddCategory = (newCat: Category) => {
    setCategories((prev) => [...prev, newCat]);
    showToast(project.language === 'ur' ? 'نئی کیٹیگری شامل ہو گئی' : 'New category added');
  };

  // Language toggle
  const handleToggleLanguage = () => {
    setProject((prev) => ({
      ...prev,
      language: prev.language === 'en' ? 'ur' : 'en',
    }));
  };

  // Data reload & reset
  const handleReloadSampleData = () => {
    reloadSampleData();
    setProject(getStoredProject());
    setExpenses(getStoredExpenses());
    setCategories(getStoredCategories());
    setStages(getStoredStages());
    setContractors(getStoredContractors());
    showToast(project.language === 'ur' ? 'نمونہ ڈیٹا لوڈ کر دیا گیا' : 'Sample house data loaded');
  };

  const handleClearToFresh = () => {
    resetToEmptyProject();
    setProject(getStoredProject());
    setExpenses([]);
    setStages(getStoredStages());
    setContractors([]);
    showToast(project.language === 'ur' ? 'نیا صاف پروجیکٹ تیار ہے' : 'Reset to fresh house project');
  };

  const handleDataImported = () => {
    setProject(getStoredProject());
    setExpenses(getStoredExpenses());
    setCategories(getStoredCategories());
    setStages(getStoredStages());
    setContractors(getStoredContractors());
    showToast(project.language === 'ur' ? 'ڈیٹا کامیابی سے بحال ہو گیا' : 'Data restored successfully');
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        project={project}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onQuickAdd={() => {
          setEditingExpense(null);
          setIsAddExpenseOpen(true);
        }}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Main Tab Navigation */}
      <TopTabs
        currentTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          setSelectedExpenseId(undefined);
        }}
        language={project.language}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          ✓ {toastMessage}
        </div>
      )}

      {/* View Contents */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 pt-4 sm:pt-6 pb-28 md:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            summary={summary}
            expenses={expenses}
            categories={categories}
            stages={stages}
            project={project}
            language={project.language}
            onQuickAdd={() => {
              setEditingExpense(null);
              setIsAddExpenseOpen(true);
            }}
            onOpenBudgetModal={() => setIsEditBudgetOpen(true)}
            onViewAllExpenses={() => setActiveTab('expenses')}
            onSelectExpense={(exp) => {
              setSelectedExpenseId(exp.id);
              setActiveTab('expenses');
            }}
            onPayExpense={(exp) => setPayingExpense(exp)}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            expenses={expenses}
            categories={categories}
            stages={stages}
            language={project.language}
            selectedExpenseId={selectedExpenseId}
            onQuickAdd={() => {
              setEditingExpense(null);
              setIsAddExpenseOpen(true);
            }}
            onEditExpense={(exp) => {
              setEditingExpense(exp);
              setIsAddExpenseOpen(true);
            }}
            onDeleteExpense={handleDeleteExpense}
            onRecordPayment={(exp) => setPayingExpense(exp)}
          />
        )}

        {activeTab === 'labor' && (
          <LaborContractorView
            contractors={contractors}
            expenses={expenses}
            language={project.language}
            onSaveContractor={handleSaveContractor}
            onDeleteContractor={handleDeleteContractor}
            onAddLaborExpense={handleAddLaborExpense}
          />
        )}

        {activeTab === 'stages' && (
          <StagesTrackerView
            stages={stages}
            expenses={expenses}
            summary={summary}
            language={project.language}
            onUpdateStageStatus={handleUpdateStageStatus}
            onViewStageExpenses={(stageId) => {
              setActiveTab('expenses');
            }}
          />
        )}

        {activeTab === 'planner' && (
          <BudgetPlannerView
            categories={categories}
            expenses={expenses}
            summary={summary}
            language={project.language}
            onUpdateCategoryBudget={handleUpdateCategoryBudget}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            expenses={expenses}
            categories={categories}
            stages={stages}
            project={project}
            summary={summary}
            language={project.language}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={activeTab === 'planner' ? 'reports' : (activeTab as TabType)}
        onChangeTab={(tab) => {
          setActiveTab(tab as MainTab);
          setSelectedExpenseId(undefined);
        }}
        onQuickAdd={() => {
          setEditingExpense(null);
          setIsAddExpenseOpen(true);
        }}
        language={project.language}
      />

      {/* Add / Edit Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setEditingExpense(null);
        }}
        onSaveExpense={handleSaveExpense}
        categories={categories}
        stages={stages}
        editingExpense={editingExpense}
        language={project.language}
        onAddCategory={handleAddCategory}
      />

      {/* Partial / Full Payment Modal */}
      <PaymentRecordModal
        isOpen={!!payingExpense}
        expense={payingExpense}
        onClose={() => setPayingExpense(null)}
        onSavePayment={handleSavePayment}
        language={project.language}
      />

      {/* Quick Edit Budget Modal */}
      <EditBudgetModal
        isOpen={isEditBudgetOpen}
        onClose={() => setIsEditBudgetOpen(false)}
        currentBudget={project.totalBudget}
        onSaveBudget={(newBudget) => {
          setProject((prev) => ({ ...prev, totalBudget: newBudget }));
          showToast(project.language === 'ur' ? 'بجٹ اپ ڈیٹ ہو گیا' : 'Budget updated');
        }}
        language={project.language}
      />

      {/* Settings & Project Config Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        project={project}
        onSaveProject={(updated) => {
          setProject(updated);
          showToast(project.language === 'ur' ? 'سیٹنگز محفوظ ہو گئیں' : 'Settings saved');
        }}
        onReloadSampleData={handleReloadSampleData}
        onClearToFresh={handleClearToFresh}
        onDataImported={handleDataImported}
      />
    </div>
  );
}
