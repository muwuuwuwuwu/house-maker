import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { Expense, PaymentMethod, Language, PaymentRecord } from '../types';
import { PAYMENT_METHODS } from '../utils/constants';
import { translations } from '../utils/translations';
import { formatPKR } from '../utils/calculations';

interface PaymentRecordModalProps {
  isOpen: boolean;
  expense: Expense | null;
  onClose: () => void;
  onSavePayment: (expenseId: string, payment: PaymentRecord) => void;
  language: Language;
}

export const PaymentRecordModal: React.FC<PaymentRecordModalProps> = ({
  isOpen,
  expense,
  onClose,
  onSavePayment,
  language,
}) => {
  const t = translations[language];
  const isUrdu = language === 'ur';

  if (!isOpen || !expense) return null;

  const [amountToPay, setAmountToPay] = useState<string>(String(expense.amountDue));
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const numPay = Math.max(0, parseFloat(amountToPay) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (numPay <= 0) {
      setErrorMsg(isUrdu ? 'براہ کرم 0 سے زیادہ رقم درج کریں۔' : 'Please enter an amount greater than 0.');
      return;
    }

    if (numPay > expense.amountDue) {
      setErrorMsg(
        isUrdu
          ? `رقم بقایا واجب الادا (${formatPKR(expense.amountDue, { isUrdu })}) سے زیادہ نہیں ہو سکتی۔`
          : `Amount cannot exceed outstanding due of ${formatPKR(expense.amountDue, { isUrdu })}.`
      );
      return;
    }

    const newPayment: PaymentRecord = {
      id: `pay_${Date.now()}`,
      date,
      amount: numPay,
      method,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onSavePayment(expense.id, newPayment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pay-modal-title"
      >
        {/* Header */}
        <div className="bg-[#143d2b] text-white px-5 py-4 flex items-center justify-between">
          <div>
            <h2 id="pay-modal-title" className="text-base sm:text-lg font-bold">
              {t.recordPayment}
            </h2>
            <p className="text-xs text-emerald-200 truncate max-w-[260px]">
              {expense.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-800 text-emerald-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Expense Quick Summary */}
        <div className="bg-amber-50/70 border-b border-amber-200/60 px-5 py-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-stone-500">{isUrdu ? 'کل بل:' : 'Total Bill:'}</span>{' '}
            <span className="font-bold text-stone-900">{formatPKR(expense.amount, { isUrdu })}</span>
          </div>
          <div>
            <span className="text-stone-500">{isUrdu ? 'ادا شدہ:' : 'Paid:'}</span>{' '}
            <span className="font-bold text-emerald-700">{formatPKR(expense.amountPaid, { isUrdu })}</span>
          </div>
          <div>
            <span className="text-stone-500">{isUrdu ? 'بقایا واجب الادا:' : 'Due:'}</span>{' '}
            <span className="font-bold text-amber-800">{formatPKR(expense.amountDue, { isUrdu })}</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mx-5 mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t.amountToPay} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-stone-500 pointer-events-none">
                Rs.
              </span>
              <input
                type="number"
                required
                min="1"
                max={expense.amountDue}
                step="any"
                value={amountToPay}
                onChange={(e) => setAmountToPay(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm font-bold text-stone-900"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setAmountToPay(String(expense.amountDue))}
                className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200"
              >
                {isUrdu ? 'مکمل بقایا رقم ادا کریں' : 'Pay Full Due Amount'}
              </button>
              {expense.amountDue > 5000 && (
                <button
                  type="button"
                  onClick={() => setAmountToPay(String(Math.round(expense.amountDue / 2)))}
                  className="text-[11px] font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg border border-stone-200"
                >
                  {isUrdu ? '50% ادا کریں' : 'Pay 50%'}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.date} <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.paymentMethod}
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium bg-white"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.value} value={pm.value}>
                    {isUrdu ? pm.labelUrdu : pm.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {isUrdu ? 'ادائیگی کا نوٹ یا رسید نمبر' : 'Payment Notes / Cheque / TID'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isUrdu ? 'مثلاً: کیش دیا گیا، آن لائن ٹرانسفر' : 'e.g. Cash given on site, HBL online transfer'}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-100"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition"
            >
              {t.recordPayment}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
