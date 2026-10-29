import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Calendar, 
  FileSpreadsheet, 
  PieChart, 
  Building2,
  Receipt,
  Clock,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Expense, Category, ConstructionStage, ProjectSettings, Language, FinancialSummary } from '../types';
import { calculateFinancialSummary, calculateCategorySpending, calculateStageSpending, formatPKR } from '../utils/calculations';
import { translations } from '../utils/translations';

interface ReportsViewProps {
  expenses: Expense[];
  categories: Category[];
  stages: ConstructionStage[];
  project: ProjectSettings;
  summary: FinancialSummary;
  language: Language;
}

type Timeframe = 'all' | 'daily' | 'weekly' | 'monthly' | 'custom';
type ReportTab = 'category' | 'vendor' | 'method' | 'status' | 'stages';

export const ReportsView: React.FC<ReportsViewProps> = ({
  expenses,
  categories,
  stages,
  project,
  summary,
  language,
}) => {
  const t = translations[language];
  const isUrdu = language === 'ur';

  const [timeframe, setTimeframe] = useState<Timeframe>('all');
  const [reportTab, setReportTab] = useState<ReportTab>('category');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Filter expenses by timeframe
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return expenses.filter(e => {
      if (timeframe === 'daily') {
        return e.date === todayStr;
      }
      if (timeframe === 'weekly') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return e.date >= weekAgo && e.date <= todayStr;
      }
      if (timeframe === 'monthly') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return e.date >= monthAgo && e.date <= todayStr;
      }
      if (timeframe === 'custom') {
        if (customStart && e.date < customStart) return false;
        if (customEnd && e.date > customEnd) return false;
      }
      return true;
    });
  }, [expenses, timeframe, customStart, customEnd]);

  // Recalculate summary for filtered scope
  const scopedSummary = useMemo(() => {
    return calculateFinancialSummary(project.totalBudget, filteredExpenses);
  }, [project.totalBudget, filteredExpenses]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    return calculateCategorySpending(filteredExpenses, categories)
      .filter(c => c.recordedCost > 0)
      .sort((a, b) => b.recordedCost - a.recordedCost);
  }, [filteredExpenses, categories]);

  // Vendor breakdown
  const vendorBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; recorded: number; paid: number; due: number; count: number }>();
    for (const exp of filteredExpenses) {
      const v = exp.vendorName.trim() || 'Unspecified';
      const entry = map.get(v) || { name: v, recorded: 0, paid: 0, due: 0, count: 0 };
      entry.recorded += exp.amount;
      entry.paid += exp.amountPaid;
      entry.due += exp.amountDue;
      entry.count += 1;
      map.set(v, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.recorded - a.recorded);
  }, [filteredExpenses]);

  // Payment method breakdown
  const methodBreakdown = useMemo(() => {
    const map = new Map<string, { method: string; total: number; count: number }>();
    for (const exp of filteredExpenses) {
      const m = exp.paymentMethod;
      const entry = map.get(m) || { method: m, total: 0, count: 0 };
      entry.total += exp.amount;
      entry.count += 1;
      map.set(m, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [filteredExpenses]);

  // Stages breakdown
  const stageBreakdown = useMemo(() => {
    return calculateStageSpending(filteredExpenses, stages).filter(s => s.cost > 0);
  }, [filteredExpenses, stages]);

  // Export CSV with UTF-8 BOM
  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Date', 'Category', 'Vendor', 'Amount (PKR)', 'Amount Paid (PKR)', 'Amount Due (PKR)', 'Payment Method', 'Payment Status', 'Notes'];
    
    const rows = filteredExpenses.map(e => {
      const cat = categories.find(c => c.id === e.categoryId);
      const catName = isUrdu ? (cat?.nameUrdu || cat?.name || e.categoryId) : (cat?.name || e.categoryId);
      return [
        `"${e.id}"`,
        `"${e.title.replace(/"/g, '""')}"`,
        `"${e.date}"`,
        `"${catName}"`,
        `"${e.vendorName.replace(/"/g, '""')}"`,
        e.amount,
        e.amountPaid,
        e.amountDue,
        `"${e.paymentMethod}"`,
        `"${e.paymentStatus}"`,
        `"${(e.description || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${project.name.replace(/\s+/g, '_')}_Expenses_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            {t.reports}
          </h2>
          <p className="text-xs text-stone-500">
            {isUrdu 
              ? 'مالیاتی اعداد و شمار، کیٹیگری اور سپلائر رپورٹس' 
              : 'Detailed construction financial audits, vendor reports, and exports'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-200 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
            <span>{t.exportCSV}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printReport}</span>
          </button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs print:border-none print:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-4 mb-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-stone-900">{project.name}</h1>
            <p className="text-xs text-stone-500">
              {project.location ? `${project.location} • ` : ''}
              {isUrdu ? 'تعمیراتی مالیاتی رپورٹ' : 'House Construction Financial Statement'}
            </p>
          </div>
          <div className="text-xs text-stone-500 sm:text-right">
            <p>{isUrdu ? 'رپورٹ تاریخ:' : 'Generated on:'} {new Date().toLocaleDateString()}</p>
            <p>{isUrdu ? 'کل منظور شدہ بجٹ:' : 'Project Budget:'} <span className="font-bold text-stone-800">{formatPKR(project.totalBudget, { isUrdu })}</span></p>
          </div>
        </div>

        {/* Timeframe selector (hidden during print) */}
        <div className="flex flex-wrap items-center gap-1.5 no-print mb-4">
          <button
            onClick={() => setTimeframe('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              timeframe === 'all' ? 'bg-emerald-800 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {t.overallReport}
          </button>
          <button
            onClick={() => setTimeframe('daily')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              timeframe === 'daily' ? 'bg-emerald-800 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {t.dailyReport}
          </button>
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              timeframe === 'weekly' ? 'bg-emerald-800 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {t.weeklyReport}
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              timeframe === 'monthly' ? 'bg-emerald-800 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {t.monthlyReport}
          </button>
          <button
            onClick={() => setTimeframe('custom')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              timeframe === 'custom' ? 'bg-emerald-800 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {t.customRange}
          </button>

          {timeframe === 'custom' && (
            <div className="flex items-center gap-1.5 ml-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2 py-1 text-xs rounded-lg border border-stone-300"
              />
              <span className="text-xs text-stone-400">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2 py-1 text-xs rounded-lg border border-stone-300"
              />
            </div>
          )}
        </div>

        {/* 4 Primary Financial Totals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200 text-center">
          <div>
            <span className="text-[11px] font-bold text-stone-500 block">{t.totalSpent}</span>
            <span className="text-base sm:text-lg font-extrabold text-stone-900">
              {formatPKR(scopedSummary.totalRecordedCost, { isUrdu })}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-stone-500 block">{t.totalPaid}</span>
            <span className="text-base sm:text-lg font-extrabold text-emerald-800">
              {formatPKR(scopedSummary.totalPaid, { isUrdu })}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-stone-500 block">{t.unpaidExpenses}</span>
            <span className="text-base sm:text-lg font-extrabold text-amber-800">
              {formatPKR(scopedSummary.outstandingPayables, { isUrdu })}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-stone-500 block">{t.remainingBudget}</span>
            <span className={`text-base sm:text-lg font-extrabold ${scopedSummary.remainingBudget < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {formatPKR(scopedSummary.remainingBudget, { isUrdu })}
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown Tab Switcher (no-print) */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 no-print overflow-x-auto scrollbar-none">
        <button
          onClick={() => setReportTab('category')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            reportTab === 'category' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          {isUrdu ? 'کیٹیگری رپورٹ' : 'Category Breakdown'}
        </button>
        <button
          onClick={() => setReportTab('vendor')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            reportTab === 'vendor' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          {isUrdu ? 'سپلائر / کاریگر رپورٹ' : 'Vendor & Contractor'}
        </button>
        <button
          onClick={() => setReportTab('stages')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            reportTab === 'stages' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          {isUrdu ? 'تعمیراتی مراحل' : 'Construction Stages'}
        </button>
        <button
          onClick={() => setReportTab('method')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            reportTab === 'method' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          {isUrdu ? 'ادائیگی کا ذریعہ' : 'Payment Methods'}
        </button>
      </div>

      {/* Tab 1: Category Report Table */}
      {reportTab === 'category' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-200 bg-stone-50 font-bold text-xs text-stone-700">
            {isUrdu ? 'شعبہ جات کی تفصیلات' : 'Category Spending Breakdown'}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-stone-100/70 text-stone-600 border-b border-stone-200">
                <tr>
                  <th className="p-3">{t.category}</th>
                  <th className="p-3 text-right rtl:text-left">{t.totalSpent}</th>
                  <th className="p-3 text-right rtl:text-left">{t.totalPaid}</th>
                  <th className="p-3 text-right rtl:text-left">{t.unpaidExpenses}</th>
                  <th className="p-3 text-center">{t.recordedTransactions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {categoryBreakdown.map(item => (
                  <tr key={item.category.id} className="hover:bg-stone-50/50">
                    <td className="p-3 font-bold text-stone-800">
                      {isUrdu ? item.category.nameUrdu : item.category.name}
                    </td>
                    <td className="p-3 text-right rtl:text-left font-bold text-stone-900">
                      {formatPKR(item.recordedCost, { isUrdu })}
                    </td>
                    <td className="p-3 text-right rtl:text-left font-medium text-emerald-800">
                      {formatPKR(item.paid, { isUrdu })}
                    </td>
                    <td className="p-3 text-right rtl:text-left font-medium text-amber-800">
                      {formatPKR(item.unpaid, { isUrdu })}
                    </td>
                    <td className="p-3 text-center text-stone-500">
                      {item.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Vendor Report Table */}
      {reportTab === 'vendor' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-200 bg-stone-50 font-bold text-xs text-stone-700">
            {isUrdu ? 'سپلائر و کاریگر کے مطابق اخراجات' : 'Vendor & Contractor Spending'}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-stone-100/70 text-stone-600 border-b border-stone-200">
                <tr>
                  <th className="p-3">{t.vendorPaidTo}</th>
                  <th className="p-3 text-right rtl:text-left">{t.totalSpent}</th>
                  <th className="p-3 text-right rtl:text-left">{t.totalPaid}</th>
                  <th className="p-3 text-right rtl:text-left">{t.unpaidExpenses}</th>
                  <th className="p-3 text-center">{t.recordedTransactions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {vendorBreakdown.map(v => (
                  <tr key={v.name} className="hover:bg-stone-50/50">
                    <td className="p-3 font-bold text-stone-800">{v.name}</td>
                    <td className="p-3 text-right rtl:text-left font-bold text-stone-900">
                      {formatPKR(v.recorded, { isUrdu })}
                    </td>
                    <td className="p-3 text-right rtl:text-left font-medium text-emerald-800">
                      {formatPKR(v.paid, { isUrdu })}
                    </td>
                    <td className="p-3 text-right rtl:text-left font-medium text-amber-800">
                      {formatPKR(v.due, { isUrdu })}
                    </td>
                    <td className="p-3 text-center text-stone-500">{v.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Stages Report Table */}
      {reportTab === 'stages' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-200 bg-stone-50 font-bold text-xs text-stone-700">
            {isUrdu ? 'تعمیراتی مراحل کے اخراجات' : 'Expenses by Construction Stage'}
          </div>
          <div className="divide-y divide-stone-100 text-xs">
            {stageBreakdown.map(s => (
              <div key={s.stage.id} className="p-3.5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900">
                    {s.stage.order}. {isUrdu ? s.stage.nameUrdu : s.stage.name}
                  </h4>
                  <span className="text-[11px] text-stone-500">{s.percentageOfTotal}% of total spend</span>
                </div>
                <span className="font-extrabold text-stone-900 text-sm">
                  {formatPKR(s.cost, { isUrdu })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Method Report Table */}
      {reportTab === 'method' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-200 bg-stone-50 font-bold text-xs text-stone-700">
            {isUrdu ? 'ادائیگی کے ذرائع کے مطابق تفصیل' : 'Payment Method Distribution'}
          </div>
          <div className="divide-y divide-stone-100 text-xs">
            {methodBreakdown.map(m => (
              <div key={m.method} className="p-3.5 flex items-center justify-between">
                <span className="font-bold text-stone-800 capitalize">{m.method.replace('_', ' ')}</span>
                <div className="text-right">
                  <span className="font-bold text-stone-900">{formatPKR(m.total, { isUrdu })}</span>
                  <span className="text-stone-400 text-[11px] block">{m.count} records</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
