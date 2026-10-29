import React, { useState } from 'react';
import { X, Wallet, Check } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';
import { formatPKR } from '../utils/calculations';

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
  onSaveBudget: (newBudget: number) => void;
  language: Language;
}

export const EditBudgetModal: React.FC<EditBudgetModalProps> = ({
  isOpen,
  onClose,
  currentBudget,
  onSaveBudget,
  language,
}) => {
  const t = translations[language];
  const isUrdu = language === 'ur';

  const [budgetVal, setBudgetVal] = useState(String(currentBudget));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Math.max(0, parseFloat(budgetVal) || 0);
    onSaveBudget(val);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-budget-title"
      >
        <div className="bg-[#143d2b] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-300" />
            <h2 id="edit-budget-title" className="text-base font-bold">
              {t.editBudget}
            </h2>
          </div>
          <button onClick={onClose} className="text-emerald-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t.totalBudget} (PKR)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-stone-500">
                Rs.
              </span>
              <input
                type="number"
                required
                min="0"
                step="any"
                value={budgetVal}
                onChange={(e) => setBudgetVal(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-900"
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              {isUrdu ? 'موجودہ منظور شدہ بجٹ:' : 'Current Approved Budget:'} {formatPKR(currentBudget, { isUrdu })}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-stone-300 text-stone-700"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm"
            >
              {isUrdu ? 'محفوظ کریں' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
