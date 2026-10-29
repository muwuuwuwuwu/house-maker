import React, { useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Percent, 
  Receipt, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  ArrowUpRight, 
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Building
} from 'lucide-react';
import { FinancialSummary, Expense, Category, ConstructionStage, ProjectSettings, Language } from '../types';
import { formatPKR, getBudgetStatus, calculateCategorySpending, calculateMonthlySpending } from '../utils/calculations';
import { translations } from '../utils/translations';

interface DashboardViewProps {
  summary: FinancialSummary;
  expenses: Expense[];
  categories: Category[];
  stages: ConstructionStage[];
  project: ProjectSettings;
  language: Language;
  onQuickAdd: () => void;
  onOpenBudgetModal: () => void;
  onViewAllExpenses: () => void;
  onSelectExpense: (expense: Expense) => void;
  onPayExpense: (expense: Expense) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  expenses,
  categories,
  stages,
  project,
  language,
  onQuickAdd,
  onOpenBudgetModal,
  onViewAllExpenses,
  onSelectExpense,
  onPayExpense,
}) => {
  const t = translations[language];
  const isUrdu = language === 'ur';

  const budgetStatus = getBudgetStatus(summary.budgetUsagePercentage);
  const isOverBudget = summary.remainingBudget < 0;
  const isNearLimit = summary.budgetUsagePercentage >= (project.budgetAlertThreshold || 85) && !isOverBudget;

  // Category spending calculations
  const categoryData = calculateCategorySpending(expenses, categories)
    .filter(c => c.recordedCost > 0)
    .sort((a, b) => b.recordedCost - a.recordedCost);

  // Monthly spending
  const monthlyData = calculateMonthlySpending(expenses);
  const maxMonthlyCost = Math.max(...monthlyData.map(m => m.cost), 1);

  // Recent expenses (latest 5)
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Unpaid / Pending expenses
  const pendingExpenses = expenses.filter(e => e.amountDue > 0);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Budget Warning Banner if Exceeded or Approaching */}
      {isOverBudget && (
        <div className="bg-rose-50 border-l-4 border-rose-600 p-4 rounded-xl shadow-xs flex items-start gap-3 text-rose-900">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h2 className="font-bold text-base text-rose-800">
              {t.budgetExceeded}
            </h2>
            <p className="text-sm text-rose-700 mt-0.5">
              {t.budgetWarningBanner}{' '}
              <span className="font-bold">{formatPKR(Math.abs(summary.remainingBudget), { isUrdu })}</span>.
            </p>
          </div>
          <button
            onClick={onOpenBudgetModal}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
          >
            {t.editBudget}
          </button>
        </div>
      )}

      {isNearLimit && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl shadow-xs flex items-start gap-3 text-amber-900">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h2 className="font-bold text-base text-amber-900">
              {t.approachingLimit} ({summary.budgetUsagePercentage}%)
            </h2>
            <p className="text-sm text-amber-800 mt-0.5">
              {t.budgetNearBanner}
            </p>
          </div>
          <button
            onClick={onOpenBudgetModal}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition"
          >
            {t.editBudget}
          </button>
        </div>
      )}

      {/* Main Budget Progress Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                {t.appName} • {project.name}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                budgetStatus.color === 'emerald'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : budgetStatus.color === 'amber'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {isUrdu ? budgetStatus.labelUrdu : budgetStatus.label}
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                {formatPKR(summary.totalRecordedCost, { isUrdu })}
              </span>
              <span className="text-sm text-stone-500 font-medium">
                / {formatPKR(summary.totalBudget, { isUrdu })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenBudgetModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition"
              aria-label={t.editBudget}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t.editBudget}</span>
            </button>
            <button
              onClick={onQuickAdd}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addExpense}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-stone-600">{t.budgetUsed}: {summary.budgetUsagePercentage}%</span>
            <span className={summary.remainingBudget < 0 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
              {summary.remainingBudget >= 0 ? `${t.remaining}: ${formatPKR(summary.remainingBudget, { isUrdu })}` : `${t.overBudget}: ${formatPKR(Math.abs(summary.remainingBudget), { isUrdu })}`}
            </span>
          </div>

          <div className="w-full bg-stone-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-stone-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetStatus.color === 'emerald'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500'
                  : budgetStatus.color === 'amber'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                  : 'bg-gradient-to-r from-rose-600 to-rose-700'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, summary.budgetUsagePercentage))}%` }}
              role="progressbar"
              aria-valuenow={summary.budgetUsagePercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <div className="flex justify-between text-[11px] text-stone-500 pt-0.5">
            <span>0%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100% ({formatPKR(summary.totalBudget, { isUrdu })})</span>
          </div>
        </div>
      </div>

      {/* 6 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {/* 1. Total Budget */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-stone-600">
              {t.totalBudget}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-stone-900 truncate">
              {formatPKR(summary.totalBudget, { isUrdu })}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              {isUrdu ? 'مقررہ تعمیراتی حد' : 'Approved project budget'}
            </div>
          </div>
        </div>

        {/* 2. Total Recorded Cost (Spent) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-stone-600">
              {t.totalSpent}
            </span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-stone-900 truncate">
              {formatPKR(summary.totalRecordedCost, { isUrdu })}
            </div>
            <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-emerald-600" />
              <span>{t.totalPaid}: {formatPKR(summary.totalPaid, { isUrdu })}</span>
            </div>
          </div>
        </div>

        {/* 3. Remaining Budget */}
        <div className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-xs flex flex-col justify-between ${
          summary.remainingBudget < 0 ? 'border-rose-200 bg-rose-50/20' : 'border-stone-200/80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-stone-600">
              {t.remainingBudget}
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              summary.remainingBudget < 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-800'
            }`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className={`text-lg sm:text-xl font-bold truncate ${
              summary.remainingBudget < 0 ? 'text-rose-600' : 'text-emerald-700'
            }`}>
              {formatPKR(summary.remainingBudget, { isUrdu })}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              {summary.remainingBudget >= 0 
                ? (isUrdu ? 'مزید اخراجات کی گنجائش' : 'Available for remaining work')
                : (isUrdu ? 'بجٹ سے اضافی خرچ' : 'Deficit / over budget')}
            </div>
          </div>
        </div>

        {/* 4. Unpaid / Outstanding Expenses */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-stone-600">
              {t.unpaidExpenses}
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              summary.outstandingPayables > 0 ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className={`text-lg sm:text-xl font-bold truncate ${
              summary.outstandingPayables > 0 ? 'text-amber-800' : 'text-stone-700'
            }`}>
              {formatPKR(summary.outstandingPayables, { isUrdu })}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              {summary.unpaidCount + summary.partiallyPaidCount} {isUrdu ? 'بل واجب الادا' : 'pending bills'}
            </div>
          </div>
        </div>

        {/* 5. Budget Usage Percentage */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-stone-600">
              {t.budgetUsed}
            </span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-stone-900 truncate">
              {summary.budgetUsagePercentage}%
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              {summary.budgetUsagePercentage > 100 
                ? (isUrdu ? 'حد سے زیادہ' : 'Exceeded limit') 
                : (isUrdu ? 'تعمیراتی پیش رفت' : 'Of approved budget')}
            </div>
          </div>
        </div>

        {/* 6. Number of Recorded Transactions */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-stone-600">
              {t.recordedTransactions}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-stone-900 truncate">
              {summary.transactionsCount}
            </div>
            <div className="text-[11px] text-stone-500 mt-1 flex gap-2">
              <span className="text-emerald-700 font-semibold">{summary.paidCount} {t.paid}</span>
              {summary.partiallyPaidCount > 0 && (
                <span className="text-amber-700 font-semibold">{summary.partiallyPaidCount} {t.partiallyPaid}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Pending Payments Alert & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Bills Widget */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                !
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">
                  {t.unpaidExpenses} ({pendingExpenses.length})
                </h3>
                <span className="text-xs text-stone-500">
                  {isUrdu ? 'ادھار اور باقی واجب الادا رقوم' : 'Dues to clear for suppliers & workers'}
                </span>
              </div>
            </div>
            <span className="text-sm font-bold text-amber-800">
              {formatPKR(summary.outstandingPayables, { isUrdu })}
            </span>
          </div>

          {pendingExpenses.length === 0 ? (
            <div className="py-6 text-center text-stone-500 text-xs flex flex-col items-center">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mb-1" />
              <span>{isUrdu ? 'ماشاء اللہ، تمام بل ادا ہو چکے ہیں!' : 'All recorded expenses are fully paid!'}</span>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto">
              {pendingExpenses.slice(0, 4).map((exp) => (
                <div key={exp.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="truncate flex-1">
                    <p className="font-semibold text-stone-900 truncate">{exp.title}</p>
                    <p className="text-[11px] text-stone-500 truncate">{exp.vendorName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-amber-800">{formatPKR(exp.amountDue, { isUrdu })}</p>
                    <p className="text-[10px] text-stone-400">
                      {isUrdu ? 'کل:' : 'Total:'} {formatPKR(exp.amount, { isUrdu })}
                    </p>
                  </div>
                  <button
                    onClick={() => onPayExpense(exp)}
                    className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] transition shrink-0"
                  >
                    {t.recordPayment}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Spending Categories Widget */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-stone-900 text-sm">
              {isUrdu ? 'شعبہ جات کے اخراجات' : 'Top Construction Categories'}
            </h3>
            <span className="text-xs text-stone-500 font-medium">
              {categoryData.length} {isUrdu ? 'کیٹیگریز' : 'categories'}
            </span>
          </div>

          <div className="space-y-3">
            {categoryData.slice(0, 5).map((item) => {
              const catPercent = summary.totalRecordedCost > 0 
                ? Math.round((item.recordedCost / summary.totalRecordedCost) * 100) 
                : 0;

              return (
                <div key={item.category.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-stone-800 truncate">
                      {isUrdu ? item.category.nameUrdu : item.category.name}
                    </span>
                    <span className="font-bold text-stone-900">
                      {formatPKR(item.recordedCost, { isUrdu })}{' '}
                      <span className="text-[11px] text-stone-500 font-normal">({catPercent}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.isOverBudget ? 'bg-rose-500' : 'bg-emerald-700'}`}
                      style={{ width: `${Math.min(100, Math.max(2, catPercent))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Spending History Chart */}
      {monthlyData.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">
                {t.monthlyReport}
              </h3>
              <p className="text-xs text-stone-500">
                {isUrdu ? 'ماہانہ تعمیراتی اخراجات کی تفصیل' : 'Monthly spending trend timeline'}
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {monthlyData.length} {isUrdu ? 'مہینے' : 'Months Active'}
            </span>
          </div>

          <div className="flex items-end gap-3 sm:gap-6 pt-4 pb-2 h-44 overflow-x-auto scrollbar-none">
            {monthlyData.map((m) => {
              const heightPercent = Math.max(12, Math.round((m.cost / maxMonthlyCost) * 100));
              return (
                <div key={m.monthKey} className="flex-1 min-w-[65px] flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-bold text-stone-700 group-hover:text-emerald-800 transition">
                    {formatPKR(m.cost, { isUrdu })}
                  </span>
                  <div className="w-full bg-stone-100 rounded-t-lg h-32 flex items-end p-1">
                    <div
                      className="w-full bg-emerald-700 group-hover:bg-emerald-600 rounded-t-md transition-all duration-300 shadow-xs"
                      style={{ height: `${heightPercent}%` }}
                      title={`${m.label}: ${formatPKR(m.cost, { isUrdu })}`}
                    />
                  </div>
                  <span className="text-xs font-medium text-stone-500 truncate text-center">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Expenses List */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-stone-900 text-sm">
              {isUrdu ? 'حالیہ اخراجات' : 'Recent Expenses'}
            </h3>
            <span className="text-xs text-stone-500">
              {isUrdu ? 'آخری درج کیے گئے اخراجات' : 'Latest recorded transactions'}
            </span>
          </div>
          <button
            onClick={onViewAllExpenses}
            className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-900 transition"
          >
            <span>{isUrdu ? 'سب دیکھیں' : 'View All'}</span>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="py-8 text-center text-stone-500 text-xs">
            {isUrdu ? 'ابھی تک کوئی خرچ درج نہیں ہوا۔ نیا خرچ درج کرنے کے لیے بٹن دبائیں۔' : 'No expenses recorded yet. Click Add Expense to record.'}
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {recentExpenses.map((exp) => (
              <div
                key={exp.id}
                onClick={() => onSelectExpense(exp)}
                className="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-stone-50/70 p-2 rounded-xl transition"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center font-bold text-xs shrink-0">
                    <Receipt className="w-5 h-5 text-emerald-800" />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-stone-900 text-sm truncate">{exp.title}</p>
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span>{exp.date}</span>
                      <span>•</span>
                      <span className="truncate">{exp.vendorName}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-extrabold text-stone-900 text-sm sm:text-base">
                    {formatPKR(exp.amount, { isUrdu })}
                  </p>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    exp.paymentStatus === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : exp.paymentStatus === 'partially_paid'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {exp.paymentStatus === 'paid'
                      ? t.paid
                      : exp.paymentStatus === 'partially_paid'
                      ? `${t.partiallyPaid} (باقی: ${formatPKR(exp.amountDue, { isUrdu })})`
                      : t.unpaid}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
