import React, { useState } from 'react';
import { PiggyBank, Edit2, AlertTriangle, CheckCircle, TrendingUp, Save } from 'lucide-react';
import { Category, Expense, Language, FinancialSummary } from '../types';
import { calculateCategorySpending, formatPKR } from '../utils/calculations';
import { translations } from '../utils/translations';

interface BudgetPlannerViewProps {
  categories: Category[];
  expenses: Expense[];
  summary: FinancialSummary;
  language: Language;
  onUpdateCategoryBudget: (categoryId: string, plannedBudget: number) => void;
}

export const BudgetPlannerView: React.FC<BudgetPlannerViewProps> = ({
  categories,
  expenses,
  summary,
  language,
  onUpdateCategoryBudget,
}) => {
  const t = translations[language];
  const isUrdu = language === 'ur';

  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempBudget, setTempBudget] = useState<string>('');

  const catSpending = calculateCategorySpending(expenses, categories);
  const totalPlannedSum = categories.reduce((sum, c) => sum + (c.plannedBudget || 0), 0);

  const handleStartEdit = (catId: string, currentBudget: number) => {
    setEditingId(catId);
    setTempBudget(String(currentBudget || 0));
  };

  const handleSaveEdit = (catId: string) => {
    const val = Math.max(0, parseFloat(tempBudget) || 0);
    onUpdateCategoryBudget(catId, val);
    setEditingId(null);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
          {t.budgetPlanner}
        </h2>
        <p className="text-xs text-stone-500">
          {isUrdu 
            ? 'ہر تعمیراتی شعبے کے لیے بجٹ مختص کریں اور اصل خرچ کا موازنہ کریں' 
            : 'Plan allocated budget per category and compare with actual construction cost'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block">{t.totalBudget}</span>
          <span className="text-lg font-bold text-stone-900">{formatPKR(summary.totalBudget, { isUrdu })}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block">
            {isUrdu ? 'کیٹیگریز کا کل مختص بجٹ' : 'Total Category Allocations'}
          </span>
          <span className="text-lg font-bold text-emerald-800">{formatPKR(totalPlannedSum, { isUrdu })}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block">
            {isUrdu ? 'کل درج شدہ خرچ' : 'Total Recorded Cost'}
          </span>
          <span className="text-lg font-bold text-stone-900">{formatPKR(summary.totalRecordedCost, { isUrdu })}</span>
        </div>
      </div>

      {/* Categories Table / Cards */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs font-bold text-stone-700">
          <span>{t.category}</span>
          <span className="hidden sm:inline">{isUrdu ? 'بجٹ بمقابلہ اصل خرچ' : 'Planned vs Actual'}</span>
        </div>

        <div className="divide-y divide-stone-100">
          {catSpending.map((item) => {
            const isEditing = editingId === item.category.id;

            return (
              <div key={item.category.id} className="p-4 hover:bg-stone-50/50 transition space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-stone-900 text-sm">
                      {isUrdu ? item.category.nameUrdu : item.category.name}
                    </h3>
                    <span className="text-xs text-stone-400">
                      ({isUrdu ? item.category.name : item.category.nameUrdu})
                    </span>
                    {item.isOverBudget && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {t.overBudget}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Planned budget field */}
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={tempBudget}
                          onChange={(e) => setTempBudget(e.target.value)}
                          className="w-28 px-2 py-1 text-xs rounded-lg border border-stone-300 font-bold"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(item.category.id)}
                          className="p-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="text-right text-xs">
                          <span className="text-stone-400 block">{t.plannedBudget}</span>
                          <span className="font-bold text-stone-900">
                            {item.plannedBudget > 0 ? formatPKR(item.plannedBudget, { isUrdu }) : 'Not set'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleStartEdit(item.category.id, item.plannedBudget)}
                          className="p-1 text-stone-400 hover:text-stone-700"
                          title="Edit allocated budget"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="text-right text-xs">
                      <span className="text-stone-400 block">{t.actualCost}</span>
                      <span className="font-extrabold text-stone-900">
                        {formatPKR(item.recordedCost, { isUrdu })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Meter */}
                {item.plannedBudget > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-stone-500 font-medium">
                        {item.percentageUsed}% {isUrdu ? 'استعمال شدہ' : 'used'}
                      </span>
                      <span className={item.difference < 0 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                        {item.difference >= 0 
                          ? `${t.remaining}: ${formatPKR(item.difference, { isUrdu })}`
                          : `${t.overBudget}: ${formatPKR(Math.abs(item.difference), { isUrdu })}`}
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.isOverBudget ? 'bg-rose-600' : 'bg-emerald-700'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(2, item.percentageUsed))}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
