import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  Receipt, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  CreditCard,
  Calendar,
  X,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { Expense, Category, ConstructionStage, PaymentStatus, PaymentMethod, Language, PaymentRecord } from '../types';
import { translations } from '../utils/translations';
import { formatPKR } from '../utils/calculations';
import { PAYMENT_METHODS } from '../utils/constants';

interface ExpensesViewProps {
  expenses: Expense[];
  categories: Category[];
  stages: ConstructionStage[];
  language: Language;
  onQuickAdd: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onRecordPayment: (expense: Expense) => void;
  selectedExpenseId?: string;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  categories,
  stages,
  language,
  onQuickAdd,
  onEditExpense,
  onDeleteExpense,
  onRecordPayment,
  selectedExpenseId,
}) => {
  const t = translations[language];
  const isUrdu = language === 'ur';

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Modal for viewing single expense details
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(() => {
    if (selectedExpenseId) {
      return expenses.find(e => e.id === selectedExpenseId) || null;
    }
    return null;
  });

  // Modal for receipt image preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Confirm delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Category map
  const catMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach(c => map.set(c.id, c));
    return map;
  }, [categories]);

  // Stage map
  const stageMap = useMemo(() => {
    const map = new Map<string, ConstructionStage>();
    stages.forEach(s => map.set(s.id, s));
    return map;
  }, [stages]);

  // Filter & Sort Logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = exp.title.toLowerCase().includes(query);
        const matchesVendor = exp.vendorName.toLowerCase().includes(query);
        const matchesDesc = (exp.description || '').toLowerCase().includes(query);
        const cat = catMap.get(exp.categoryId);
        const matchesCat = cat 
          ? cat.name.toLowerCase().includes(query) || cat.nameUrdu.includes(query) 
          : false;

        if (!matchesTitle && !matchesVendor && !matchesDesc && !matchesCat) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'all' && exp.categoryId !== selectedCategory) {
        return false;
      }

      // Status
      if (selectedStatus !== 'all' && exp.paymentStatus !== selectedStatus) {
        return false;
      }

      // Payment method
      if (selectedMethod !== 'all' && exp.paymentMethod !== selectedMethod) {
        return false;
      }

      // Date range
      if (startDate && exp.date < startDate) return false;
      if (endDate && exp.date > endDate) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'highest') return b.amount - a.amount;
      if (sortBy === 'lowest') return a.amount - b.amount;
      return 0;
    });
  }, [expenses, searchQuery, selectedCategory, selectedStatus, selectedMethod, startDate, endDate, sortBy, catMap]);

  // Filtered totals
  const filteredTotal = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const filteredPaid = filteredExpenses.reduce((acc, curr) => acc + curr.amountPaid, 0);
  const filteredDue = filteredExpenses.reduce((acc, curr) => acc + curr.amountDue, 0);

  const handleDelete = (id: string) => {
    onDeleteExpense(id);
    setDeleteConfirmId(null);
    if (viewingExpense && viewingExpense.id === id) {
      setViewingExpense(null);
    }
  };

  return (
    <div className="space-y-5 pb-20 md:pb-8">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            {t.expenses}
          </h2>
          <p className="text-xs text-stone-500">
            {isUrdu 
              ? `کل ${expenses.length} اخراجات درج ہیں (${filteredExpenses.length} فلٹر شدہ)` 
              : `Total ${expenses.length} records (${filteredExpenses.length} filtered)`}
          </p>
        </div>

        <button
          onClick={onQuickAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addExpense}</span>
        </button>
      </div>

      {/* Filter & Search Bar Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchExpenses}
            className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">{t.category}</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
            >
              <option value="all">{t.allCategories}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {isUrdu ? c.nameUrdu : c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">{t.paymentStatus}</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
            >
              <option value="all">{t.allStatuses}</option>
              <option value="paid">{t.paid}</option>
              <option value="partially_paid">{t.partiallyPaid}</option>
              <option value="unpaid">{t.unpaid}</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">{t.paymentMethod}</label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
            >
              <option value="all">{t.allMethods}</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm.value} value={pm.value}>
                  {isUrdu ? pm.labelUrdu : pm.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">{t.sortBy}</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-medium"
            >
              <option value="newest">{t.newestFirst}</option>
              <option value="oldest">{t.oldestFirst}</option>
              <option value="highest">{t.highestAmount}</option>
              <option value="lowest">{t.lowestAmount}</option>
            </select>
          </div>
        </div>

        {/* Date Range Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-100 text-xs">
          <span className="font-semibold text-stone-500">{isUrdu ? 'تاریخ کا انتخاب:' : 'Date Range:'}</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2 py-1 rounded-md border border-stone-300 text-xs"
          />
          <span className="text-stone-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2 py-1 rounded-md border border-stone-300 text-xs"
          />
          {(startDate || endDate || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedMethod !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSelectedMethod('all');
                setStartDate('');
                setEndDate('');
              }}
              className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold ml-auto"
            >
              {isUrdu ? 'فلٹر صاف کریں' : 'Clear Filters'}
            </button>
          )}
        </div>
      </div>

      {/* Filter Summary Banner */}
      <div className="bg-emerald-900 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div>
          <span className="text-emerald-300 font-medium">
            {isUrdu ? 'فلٹر شدہ کل رقم:' : 'Filtered Total Cost:'}
          </span>{' '}
          <span className="text-base sm:text-lg font-bold">{formatPKR(filteredTotal, { isUrdu })}</span>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <span className="text-emerald-300/80">{isUrdu ? 'ادا شدہ:' : 'Paid:'}</span>{' '}
            <span className="font-semibold text-white">{formatPKR(filteredPaid, { isUrdu })}</span>
          </div>
          {filteredDue > 0 && (
            <div>
              <span className="text-amber-300/90">{isUrdu ? 'بقایا واجب الادا:' : 'Due:'}</span>{' '}
              <span className="font-bold text-amber-300">{formatPKR(filteredDue, { isUrdu })}</span>
            </div>
          )}
        </div>
      </div>

      {/* Expenses Cards List */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-stone-200 text-stone-500">
          <Receipt className="w-12 h-12 text-stone-300 mx-auto mb-2" />
          <p className="text-sm font-semibold">
            {isUrdu ? 'کوئی خرچ نہیں ملا۔' : 'No expenses match your filters.'}
          </p>
          <p className="text-xs text-stone-400 mt-1">
            {isUrdu ? 'سرچ تبدیل کریں یا نیا خرچ درج کریں۔' : 'Try adjusting your search criteria or add a new expense.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredExpenses.map((exp) => {
            const cat = catMap.get(exp.categoryId);
            const stage = exp.stageId ? stageMap.get(exp.stageId) : null;

            return (
              <div
                key={exp.id}
                className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs hover:border-emerald-600 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Main info */}
                <div 
                  className="flex items-start gap-3 flex-1 cursor-pointer"
                  onClick={() => setViewingExpense(exp)}
                >
                  <div className="w-11 h-11 rounded-xl bg-[#143d2b]/10 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="truncate flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-stone-900 text-sm sm:text-base truncate">
                        {exp.title}
                      </h3>
                      {exp.receiptUrl && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage(exp.receiptUrl!);
                          }}
                          className="text-emerald-700 hover:text-emerald-900"
                          title="View Receipt"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500 mt-0.5">
                      <span className="font-semibold text-stone-700">{exp.vendorName}</span>
                      <span>•</span>
                      <span>{exp.date}</span>
                      <span>•</span>
                      <span className="bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                        {cat ? (isUrdu ? cat.nameUrdu : cat.name) : exp.categoryId}
                      </span>
                      {stage && (
                        <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-200">
                          {isUrdu ? stage.nameUrdu : stage.name}
                        </span>
                      )}
                    </div>

                    {exp.description && (
                      <p className="text-xs text-stone-400 truncate mt-1 italic">
                        "{exp.description}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Amount, status & Action buttons */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100 gap-2 shrink-0">
                  <div className="sm:text-right">
                    <div className="text-base sm:text-lg font-extrabold text-stone-900">
                      {formatPKR(exp.amount, { isUrdu })}
                    </div>
                    {exp.amountDue > 0 ? (
                      <div className="text-xs font-semibold text-amber-800">
                        {isUrdu ? 'بقایا واجب الادا:' : 'Due:'} {formatPKR(exp.amountDue, { isUrdu })}
                      </div>
                    ) : (
                      <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 sm:justify-end">
                        <CheckCircle className="w-3 h-3" />
                        <span>{t.paid}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {exp.amountDue > 0 && (
                      <button
                        onClick={() => onRecordPayment(exp)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition"
                        title={t.recordPayment}
                      >
                        {t.recordPayment}
                      </button>
                    )}
                    <button
                      onClick={() => setViewingExpense(exp)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition"
                      aria-label="View details"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditExpense(exp)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-800 hover:bg-emerald-50 transition"
                      aria-label="Edit expense"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(exp.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      aria-label="Delete expense"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Expense Detail Modal */}
      {viewingExpense && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden my-6">
            <div className="bg-[#143d2b] text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base sm:text-lg">{viewingExpense.title}</h3>
                <p className="text-xs text-emerald-200">{viewingExpense.vendorName}</p>
              </div>
              <button
                onClick={() => setViewingExpense(null)}
                className="p-1.5 rounded-full hover:bg-emerald-800 text-emerald-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
              {/* Financial Box */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[11px] text-stone-500 font-semibold">{t.amountPKR}</span>
                  <p className="text-sm sm:text-base font-extrabold text-stone-900 mt-0.5">
                    {formatPKR(viewingExpense.amount, { isUrdu })}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 font-semibold">{t.amountPaidPKR}</span>
                  <p className="text-sm sm:text-base font-extrabold text-emerald-700 mt-0.5">
                    {formatPKR(viewingExpense.amountPaid, { isUrdu })}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 font-semibold">{t.amountDuePKR}</span>
                  <p className={`text-sm sm:text-base font-extrabold mt-0.5 ${
                    viewingExpense.amountDue > 0 ? 'text-amber-800' : 'text-stone-400'
                  }`}>
                    {formatPKR(viewingExpense.amountDue, { isUrdu })}
                  </p>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-stone-400 block">{t.date}</span>
                  <span className="font-semibold text-stone-800">{viewingExpense.date}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">{t.category}</span>
                  <span className="font-semibold text-stone-800">
                    {catMap.get(viewingExpense.categoryId)
                      ? (isUrdu ? catMap.get(viewingExpense.categoryId)?.nameUrdu : catMap.get(viewingExpense.categoryId)?.name)
                      : viewingExpense.categoryId}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block">{t.paymentMethod}</span>
                  <span className="font-semibold text-stone-800 capitalize">
                    {viewingExpense.paymentMethod.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block">{t.paymentStatus}</span>
                  <span className={`font-bold ${
                    viewingExpense.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-800'
                  }`}>
                    {viewingExpense.paymentStatus === 'paid' ? t.paid : viewingExpense.paymentStatus === 'partially_paid' ? t.partiallyPaid : t.unpaid}
                  </span>
                </div>
                {viewingExpense.quantity && (
                  <div>
                    <span className="text-stone-400 block">{t.quantityUnit}</span>
                    <span className="font-semibold text-stone-800">
                      {viewingExpense.quantity} {viewingExpense.unit || ''}
                    </span>
                  </div>
                )}
                {viewingExpense.stageId && (
                  <div>
                    <span className="text-stone-400 block">{t.constructionStage}</span>
                    <span className="font-semibold text-stone-800">
                      {stageMap.get(viewingExpense.stageId)
                        ? (isUrdu ? stageMap.get(viewingExpense.stageId)?.nameUrdu : stageMap.get(viewingExpense.stageId)?.name)
                        : viewingExpense.stageId}
                    </span>
                  </div>
                )}
              </div>

              {viewingExpense.description && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-400 text-xs block font-medium">{t.description}</span>
                  <p className="text-stone-800 mt-1">{viewingExpense.description}</p>
                </div>
              )}

              {/* Receipt Preview */}
              {viewingExpense.receiptUrl && (
                <div>
                  <span className="text-stone-600 font-bold block mb-1">{t.attachReceipt}</span>
                  <img
                    src={viewingExpense.receiptUrl}
                    alt="Receipt"
                    className="w-full max-h-56 object-contain rounded-xl border border-stone-200 bg-stone-50"
                  />
                </div>
              )}

              {/* Payment History */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-stone-900 text-xs sm:text-sm">
                    {t.paymentHistory} ({viewingExpense.paymentHistory.length})
                  </h4>
                  {viewingExpense.amountDue > 0 && (
                    <button
                      onClick={() => {
                        const target = viewingExpense;
                        setViewingExpense(null);
                        onRecordPayment(target);
                      }}
                      className="text-xs font-bold text-emerald-800 hover:underline"
                    >
                      + {t.recordPayment}
                    </button>
                  )}
                </div>

                {viewingExpense.paymentHistory.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">No payments logged yet.</p>
                ) : (
                  <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                    {viewingExpense.paymentHistory.map((p, idx) => (
                      <div key={p.id || idx} className="p-2.5 flex items-center justify-between bg-stone-50/50 text-xs">
                        <div>
                          <p className="font-bold text-stone-800">{formatPKR(p.amount, { isUrdu })}</p>
                          <p className="text-[11px] text-stone-500">{p.date} • {p.method}</p>
                        </div>
                        {p.notes && <p className="text-[11px] text-stone-500 italic">{p.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal footer actions */}
              <div className="pt-3 flex items-center justify-between border-t border-stone-200">
                <button
                  onClick={() => {
                    setDeleteConfirmId(viewingExpense.id);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  {t.delete}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const exp = viewingExpense;
                      setViewingExpense(null);
                      onEditExpense(exp);
                    }}
                    className="px-3 py-1.5 text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition"
                  >
                    {isUrdu ? 'تبدیل کریں' : 'Edit'}
                  </button>
                  <button
                    onClick={() => setViewingExpense(null)}
                    className="px-4 py-1.5 text-xs font-bold bg-stone-900 text-white rounded-lg"
                  >
                    {isUrdu ? 'بند کریں' : 'Close'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-stone-200 space-y-3">
            <h3 className="font-bold text-base text-stone-900">{t.delete}</h3>
            <p className="text-xs text-stone-600">{t.confirmDelete}</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 text-stone-700"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Image Lightbox */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh]">
            <img src={previewImage} alt="Receipt Full Preview" className="max-h-[85vh] rounded-2xl shadow-2xl" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
