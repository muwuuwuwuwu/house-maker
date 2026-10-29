import React, { useState } from 'react';
import { 
  Users, 
  Calculator, 
  Plus, 
  Phone, 
  Briefcase, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  Trash2, 
  PlusCircle, 
  X,
  FileCheck
} from 'lucide-react';
import { ContractorWorker, Expense, Language } from '../types';
import { calculateLaborWages, formatPKR } from '../utils/calculations';
import { translations } from '../utils/translations';

interface LaborContractorViewProps {
  contractors: ContractorWorker[];
  expenses: Expense[];
  language: Language;
  onSaveContractor: (contractor: ContractorWorker) => void;
  onDeleteContractor: (id: string) => void;
  onAddLaborExpense: (expenseData: Partial<Expense>) => void;
}

export const LaborContractorView: React.FC<LaborContractorViewProps> = ({
  contractors,
  expenses,
  language,
  onSaveContractor,
  onDeleteContractor,
  onAddLaborExpense,
}) => {
  const t = translations[language];
  const isUrdu = language === 'ur';

  // Daily Wage Calculator State
  const [workerName, setWorkerName] = useState('Mistri Tariq Party');
  const [workersCount, setWorkersCount] = useState<number>(4);
  const [dailyWage, setDailyWage] = useState<number>(1800);
  const [daysWorked, setDaysWorked] = useState<number>(6);
  const [advance, setAdvance] = useState<number>(5000);
  const [amountPaidNow, setAmountPaidNow] = useState<number>(25000);
  const [calcSuccessMsg, setCalcSuccessMsg] = useState(false);

  // Modal for adding new contractor
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newType, setNewType] = useState<'contractor' | 'daily_labor' | 'supplier' | 'other'>('contractor');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newWorkType, setNewWorkType] = useState('');
  const [newAgreedAmount, setNewAgreedAmount] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Calculate live daily labor wages
  const wageCalc = calculateLaborWages({
    workersCount,
    dailyWagePerWorker: dailyWage,
    daysWorked,
    advancePayments: advance,
    amountPaid: amountPaidNow,
  });

  // Handle adding calculator result as expense
  const handleRecordAsExpense = () => {
    const totalAmount = wageCalc.totalWages;
    const totalPaid = wageCalc.totalPaidOverall;
    const due = wageCalc.outstandingWages;

    onAddLaborExpense({
      title: `${workerName} - ${workersCount} Workers (${daysWorked} Days)`,
      amount: totalAmount,
      amountPaid: totalPaid,
      amountDue: due,
      date: new Date().toISOString().split('T')[0],
      categoryId: 'labor_wages',
      vendorName: workerName,
      paymentMethod: 'cash',
      paymentStatus: due === 0 ? 'paid' : totalPaid > 0 ? 'partially_paid' : 'unpaid',
      description: `Daily labor wage: ${workersCount} workers × Rs. ${dailyWage} × ${daysWorked} days. Advance: Rs. ${advance}, Paid now: Rs. ${amountPaidNow}.`,
      quantity: daysWorked,
      unit: isUrdu ? 'دن' : 'Days',
    });

    setCalcSuccessMsg(true);
    setTimeout(() => setCalcSuccessMsg(false), 3500);
  };

  const handleCreateContractor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const contractor: ContractorWorker = {
      id: `cont_${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      workType: newWorkType.trim(),
      type: newType,
      agreedAmount: newAgreedAmount ? parseFloat(newAgreedAmount) : undefined,
      notes: newNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveContractor(contractor);
    setIsAddModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewWorkType('');
    setNewAgreedAmount('');
    setNewNotes('');
  };

  // Helper to compute actual payments made to a contractor from expenses
  const getContractorFinancials = (contractor: ContractorWorker) => {
    const relatedExpenses = expenses.filter(
      (e) => e.vendorName.toLowerCase() === contractor.name.toLowerCase()
    );
    const totalRecorded = relatedExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalPaid = relatedExpenses.reduce((sum, e) => sum + e.amountPaid, 0);
    const agreed = contractor.agreedAmount || totalRecorded;
    const balance = Math.max(0, agreed - totalPaid);

    return { totalRecorded, totalPaid, agreed, balance, count: relatedExpenses.length };
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            {t.workersContractors}
          </h2>
          <p className="text-xs text-stone-500">
            {isUrdu 
              ? 'مزدوروں کی یومیہ دیہاڑی، ٹھیکیداروں کے معاہدے اور ادائیگیاں' 
              : 'Daily labor wages calculator, contractor agreements, and payments'}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addNewContractor}</span>
        </button>
      </div>

      {/* Daily Labor Wage Calculator Card */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm sm:text-base">
              {t.laborWageCalculator}
            </h3>
            <p className="text-xs text-stone-500">{t.laborSubtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">{t.workerOrTeamName}</label>
            <input
              type="text"
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              placeholder={t.workerNamePlaceholder}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">{t.numberOfWorkers}</label>
            <input
              type="number"
              min="1"
              value={workersCount}
              onChange={(e) => setWorkersCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">{t.dailyWagePerWorker}</label>
            <input
              type="number"
              min="0"
              step="100"
              value={dailyWage}
              onChange={(e) => setDailyWage(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">{t.daysWorked}</label>
            <input
              type="number"
              min="1"
              value={daysWorked}
              onChange={(e) => setDaysWorked(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">{t.advanceGiven}</label>
            <input
              type="number"
              min="0"
              value={advance}
              onChange={(e) => setAdvance(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">{isUrdu ? 'آج ادا کی جانے والی رقم' : 'Amount Paid Today (Rs.)'}</label>
            <input
              type="number"
              min="0"
              value={amountPaidNow}
              onChange={(e) => setAmountPaidNow(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
            />
          </div>
        </div>

        {/* Calculated Result Ribbon */}
        <div className="mt-4 p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
            <div>
              <span className="text-stone-500 font-medium">{t.totalWageAmount}:</span>{' '}
              <span className="font-extrabold text-stone-900 text-sm">{formatPKR(wageCalc.totalWages, { isUrdu })}</span>
            </div>
            <div>
              <span className="text-stone-500 font-medium">{isUrdu ? 'کل ادا شدہ:' : 'Total Paid:'}</span>{' '}
              <span className="font-bold text-emerald-700 text-sm">{formatPKR(wageCalc.totalPaidOverall, { isUrdu })}</span>
            </div>
            <div>
              <span className="text-stone-500 font-medium">{t.netPayableToday}:</span>{' '}
              <span className="font-extrabold text-amber-800 text-sm">{formatPKR(wageCalc.outstandingWages, { isUrdu })}</span>
            </div>
          </div>

          <button
            onClick={handleRecordAsExpense}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition active:scale-95 shrink-0"
          >
            <FileCheck className="w-4 h-4" />
            <span>{t.addToExpensesButton}</span>
          </button>
        </div>

        {calcSuccessMsg && (
          <div className="mt-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-center animate-in fade-in">
            ✓ {isUrdu ? 'دیہاڑی کا خرچ کامیابی کے ساتھ اخراجات میں درج ہو گیا!' : 'Labor wage expense recorded successfully!'}
          </div>
        )}
      </div>

      {/* Contractors & Suppliers List */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-stone-900 text-base">
            {t.contractorsList} ({contractors.length})
          </h3>
        </div>

        {contractors.length === 0 ? (
          <div className="py-8 text-center text-stone-400 text-xs">
            {isUrdu ? 'ابھی تک کوئی ٹھیکیدار یا سپلائر درج نہیں کیا گیا۔' : 'No contractors recorded yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contractors.map((cont) => {
              const fin = getContractorFinancials(cont);

              return (
                <div
                  key={cont.id}
                  className="p-4 rounded-2xl border border-stone-200/90 bg-stone-50/50 hover:bg-white hover:border-emerald-600 transition flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-stone-900 text-sm truncate">{cont.name}</h4>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                          {cont.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                        <Briefcase className="w-3.5 h-3.5 text-stone-400" />
                        <span className="truncate">{cont.workType || 'General Work'}</span>
                      </p>
                      {cont.phone && (
                        <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5 font-medium">
                          <Phone className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{cont.phone}</span>
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => onDeleteContractor(cont.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title={t.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Financial breakdown */}
                  <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-xl border border-stone-200 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 block">{t.agreedContractAmount}</span>
                      <span className="font-bold text-stone-900">{formatPKR(fin.agreed, { isUrdu })}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">{t.totalPaidContractor}</span>
                      <span className="font-bold text-emerald-700">{formatPKR(fin.totalPaid, { isUrdu })}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">{t.remainingContractorBalance}</span>
                      <span className={`font-bold ${fin.balance > 0 ? 'text-amber-800' : 'text-stone-400'}`}>
                        {formatPKR(fin.balance, { isUrdu })}
                      </span>
                    </div>
                  </div>

                  {cont.notes && (
                    <p className="text-xs text-stone-500 italic bg-white p-2 rounded-lg border border-stone-100">
                      "{cont.notes}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Contractor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden">
            <div className="bg-[#143d2b] text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">{t.addNewContractor}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-emerald-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContractor} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  {isUrdu ? 'نام ٹھیکیدار / سپلائر' : 'Contractor / Supplier Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Master Aslam Mason"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">{t.contactNumber}</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">{t.workType}</label>
                <input
                  type="text"
                  value={newWorkType}
                  onChange={(e) => setNewWorkType(e.target.value)}
                  placeholder={t.workTypePlaceholder}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">{t.agreedContractAmount}</label>
                <input
                  type="number"
                  min="0"
                  value={newAgreedAmount}
                  onChange={(e) => setNewAgreedAmount(e.target.value)}
                  placeholder="Rs. 500,000"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">{t.description}</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Rates, specifications, contract conditions"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold"
                >
                  {isUrdu ? 'محفوظ کریں' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
