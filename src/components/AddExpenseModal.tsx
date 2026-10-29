import React, { useState, useEffect } from 'react';
import { X, Upload, Camera, Trash2, Check, AlertCircle, PlusCircle, Calendar } from 'lucide-react';
import { Expense, Category, ConstructionStage, PaymentMethod, PaymentStatus, Language } from '../types';
import { PAYMENT_METHODS } from '../utils/constants';
import { translations } from '../utils/translations';
import { formatPKR } from '../utils/calculations';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expense: Expense) => void;
  categories: Category[];
  stages: ConstructionStage[];
  editingExpense?: Expense | null;
  language: Language;
  onAddCategory?: (category: Category) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSaveExpense,
  categories,
  stages,
  editingExpense,
  language,
  onAddCategory,
}) => {
  const t = translations[language];
  const isUrdu = language === 'ur';

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || 'cement');
  const [vendorName, setVendorName] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [quantity, setQuantity] = useState<string>('');
  const [unit, setUnit] = useState('');
  const [stageId, setStageId] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New category creation modal state
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatNameUrdu, setNewCatNameUrdu] = useState('');

  // Populate form if editing
  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title);
      setAmount(String(editingExpense.amount));
      setAmountPaid(String(editingExpense.amountPaid));
      setDate(editingExpense.date);
      setCategoryId(editingExpense.categoryId);
      setVendorName(editingExpense.vendorName || '');
      setDescription(editingExpense.description || '');
      setPaymentMethod(editingExpense.paymentMethod);
      setPaymentStatus(editingExpense.paymentStatus);
      setQuantity(editingExpense.quantity ? String(editingExpense.quantity) : '');
      setUnit(editingExpense.unit || '');
      setStageId(editingExpense.stageId || '');
      setReceiptUrl(editingExpense.receiptUrl);
    } else {
      // Reset form
      setTitle('');
      setAmount('');
      setAmountPaid('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategoryId(categories[0]?.id || 'cement');
      setVendorName('');
      setDescription('');
      setPaymentMethod('cash');
      setPaymentStatus('paid');
      setQuantity('');
      setUnit('');
      setStageId('');
      setReceiptUrl(undefined);
    }
    setErrorMsg(null);
  }, [editingExpense, isOpen, categories]);

  // Handle amount change - update amountPaid automatically when status is 'paid'
  const handleAmountChange = (val: string) => {
    setAmount(val);
    if (paymentStatus === 'paid') {
      setAmountPaid(val);
    } else if (paymentStatus === 'unpaid') {
      setAmountPaid('0');
    }
  };

  // Handle payment status change
  const handleStatusChange = (status: PaymentStatus) => {
    setPaymentStatus(status);
    const parsedTotal = parseFloat(amount) || 0;
    if (status === 'paid') {
      setAmountPaid(String(parsedTotal));
    } else if (status === 'unpaid') {
      setAmountPaid('0');
    } else if (status === 'partially_paid') {
      // default to 50% or keep current if valid
      const currentPaid = parseFloat(amountPaid) || 0;
      if (currentPaid === 0 || currentPaid >= parsedTotal) {
        setAmountPaid(String(Math.round(parsedTotal / 2)));
      }
    }
  };

  // Calculate remaining balance dynamically
  const numAmount = Math.max(0, parseFloat(amount) || 0);
  const numPaid = Math.max(0, parseFloat(amountPaid) || 0);
  const calculatedDue = Math.max(0, numAmount - numPaid);

  // Handle Receipt Image File / Camera
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg(isUrdu ? 'تصویر کا سائز 5MB سے کم ہونا چاہیے۔' : 'Image size must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg(isUrdu ? 'براہ کرم خرچ کا عنوان درج کریں۔' : 'Please enter an expense title.');
      return;
    }

    if (numAmount <= 0) {
      setErrorMsg(isUrdu ? 'براہ کرم درست رقم درج کریں۔' : 'Please enter a valid amount greater than 0.');
      return;
    }

    if (!vendorName.trim()) {
      setErrorMsg(isUrdu ? 'براہ کرم دکاندار یا سپلائر کا نام درج کریں۔' : 'Please enter vendor or supplier name.');
      return;
    }

    if (numPaid > numAmount) {
      setErrorMsg(isUrdu ? 'ادا شدہ رقم کل رقم سے زیادہ نہیں ہو سکتی۔' : 'Amount paid cannot exceed total amount.');
      return;
    }

    // Determine finalized status
    let finalStatus = paymentStatus;
    if (calculatedDue === 0 && numPaid === numAmount) {
      finalStatus = 'paid';
    } else if (numPaid === 0) {
      finalStatus = 'unpaid';
    } else {
      finalStatus = 'partially_paid';
    }

    const expensePayload: Expense = {
      id: editingExpense ? editingExpense.id : `exp_${Date.now()}`,
      title: title.trim(),
      amount: numAmount,
      amountPaid: numPaid,
      amountDue: calculatedDue,
      date,
      categoryId,
      vendorName: vendorName.trim(),
      description: description.trim() || undefined,
      paymentMethod,
      paymentStatus: finalStatus,
      quantity: quantity ? parseFloat(quantity) : undefined,
      unit: unit.trim() || undefined,
      stageId: stageId || undefined,
      receiptUrl,
      paymentHistory: editingExpense
        ? editingExpense.paymentHistory
        : numPaid > 0
        ? [
            {
              id: `pay_${Date.now()}`,
              date,
              amount: numPaid,
              method: paymentMethod,
              notes: 'Initial payment recorded',
              createdAt: new Date().toISOString(),
            },
          ]
        : [],
      createdAt: editingExpense ? editingExpense.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveExpense(expensePayload);
    onClose();
  };

  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: Category = {
      id: `custom_${Date.now()}`,
      name: newCatName.trim(),
      nameUrdu: newCatNameUrdu.trim() || newCatName.trim(),
      icon: 'Tag',
      isCustom: true,
      plannedBudget: 0,
    };
    if (onAddCategory) {
      onAddCategory(newCat);
      setCategoryId(newCat.id);
      setIsAddingNewCat(false);
      setNewCatName('');
      setNewCatNameUrdu('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-modal-title"
      >
        {/* Header */}
        <div className="bg-[#143d2b] text-white px-5 py-4 flex items-center justify-between">
          <div>
            <h2 id="expense-modal-title" className="text-lg font-bold">
              {editingExpense ? t.updateExpense : t.addExpense}
            </h2>
            <p className="text-xs text-emerald-200/80">
              {isUrdu ? 'تعمیراتی اخراجات کی تفصیل درج کریں' : 'Record construction expense details'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-800/80 text-emerald-200 transition"
            aria-label={t.cancel}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t.expenseTitle} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.expenseTitlePlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm font-medium transition"
            />
          </div>

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.amountPKR} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-stone-500 pointer-events-none">
                  Rs.
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm font-bold text-stone-900 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.date} <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm font-medium transition"
              />
            </div>
          </div>

          {/* Category & New Category Option */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-700">
                {t.category} <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'نئی کیٹیگری بنائیں' : '+ Add Custom Category'}</span>
              </button>
            </div>

            {isAddingNewCat && (
              <div className="p-3 mb-2 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <input
                  type="text"
                  placeholder="Category Name (English)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300"
                />
                <input
                  type="text"
                  placeholder="نام (اردو)"
                  value={newCatNameUrdu}
                  onChange={(e) => setNewCatNameUrdu(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCat(false)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-stone-200 text-stone-700"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-700 text-white"
                  >
                    {isUrdu ? 'شامل کریں' : 'Save'}
                  </button>
                </div>
              </div>
            )}

            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm font-medium bg-white transition"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {isUrdu ? `${cat.nameUrdu} (${cat.name})` : `${cat.name} (${cat.nameUrdu})`}
                </option>
              ))}
            </select>
          </div>

          {/* Paid To / Vendor */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t.vendorPaidTo} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder={t.vendorPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm font-medium transition"
            />
          </div>

          {/* Payment Status & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.paymentStatus}
              </label>
              <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => handleStatusChange('paid')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    paymentStatus === 'paid'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {t.paid}
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('partially_paid')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    paymentStatus === 'partially_paid'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {isUrdu ? 'جزوی' : 'Partial'}
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('unpaid')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    paymentStatus === 'unpaid'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {t.unpaid}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.paymentMethod}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm font-medium bg-white transition"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.value} value={pm.value}>
                    {isUrdu ? pm.labelUrdu : pm.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount Paid vs Due (Calculated Breakdown) */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.amountPaidPKR}
                </label>
                <input
                  type="number"
                  min="0"
                  max={amount}
                  step="any"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-bold text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.amountDuePKR}
                </label>
                <div className="px-3 py-2 rounded-xl bg-stone-200/60 border border-stone-300 text-sm font-bold text-amber-900">
                  {formatPKR(calculatedDue, { isUrdu })}
                </div>
              </div>
            </div>
            {calculatedDue > 0 && (
              <p className="text-[11px] text-amber-800 font-medium">
                {isUrdu ? 'یہ بقایا رقم واجب الادا کھاتوں میں نظر آئے گی۔' : 'This remaining balance will appear under outstanding payables.'}
              </p>
            )}
          </div>

          {/* Optional: Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.quantity}
              </label>
              <input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g., 100"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.unit}
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Bags, Bricks, Tons, Days"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-medium"
              />
            </div>
          </div>

          {/* Optional: Construction Stage */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t.constructionStage}
            </label>
            <select
              value={stageId}
              onChange={(e) => setStageId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-medium bg-white"
            >
              <option value="">{isUrdu ? 'کسی مرحلے سے منسلک نہیں' : '-- None / General --'}</option>
              {stages.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.order}. {isUrdu ? st.nameUrdu : st.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes / Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t.description}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.descriptionPlaceholder}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-xs sm:text-sm font-medium"
            />
          </div>

          {/* Receipt / Invoice Photo Attachment */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t.attachReceipt}
            </label>
            {receiptUrl ? (
              <div className="relative rounded-xl border border-stone-200 overflow-hidden bg-stone-100 p-2 flex items-center justify-between">
                <img
                  src={receiptUrl}
                  alt="Receipt attachment"
                  className="h-20 w-24 object-cover rounded-lg border border-stone-300"
                />
                <div className="flex-1 px-3 text-xs text-stone-600 truncate">
                  <span className="font-semibold text-emerald-800 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {isUrdu ? 'تصویر منسلک ہو گئی' : 'Receipt Attached'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptUrl(undefined)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title={t.removeReceipt}
                  aria-label={t.removeReceipt}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-stone-300 hover:border-emerald-600 rounded-2xl cursor-pointer bg-stone-50/50 hover:bg-emerald-50/30 transition text-stone-600">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                  <Camera className="w-4 h-4" />
                  <span>{t.chooseImage}</span>
                </div>
                <span className="text-[11px] text-stone-400 mt-0.5">
                  {isUrdu ? 'کیمرہ یا گیلری سے بل کی تصویر منتخب کریں (JPG, PNG)' : 'Take photo with phone camera or upload bill image'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-sm hover:bg-stone-100 transition"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition active:scale-95"
            >
              {editingExpense ? t.updateExpense : t.saveExpense}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
