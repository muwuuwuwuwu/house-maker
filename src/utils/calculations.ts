import { Expense, FinancialSummary, Category, ConstructionStage, DailyLaborDetails } from '../types';

/**
 * Calculates project-wide financial summary from expenses and project budget.
 * Zero budget is safely handled (returns 0% usage).
 */
export function calculateFinancialSummary(totalBudget: number, expenses: Expense[]): FinancialSummary {
  let totalRecordedCost = 0;
  let totalPaid = 0;
  let outstandingPayables = 0;
  let paidCount = 0;
  let partiallyPaidCount = 0;
  let unpaidCount = 0;

  for (const exp of expenses) {
    const cost = Math.max(0, Number(exp.amount) || 0);
    const paid = Math.max(0, Number(exp.amountPaid) || 0);
    // Explicitly compute due to avoid negative numbers or drift
    const due = Math.max(0, cost - paid);

    totalRecordedCost += cost;
    totalPaid += paid;
    outstandingPayables += due;

    if (due === 0 && cost > 0) {
      paidCount++;
    } else if (paid > 0 && due > 0) {
      partiallyPaidCount++;
    } else {
      unpaidCount++;
    }
  }

  const safeBudget = Math.max(0, Number(totalBudget) || 0);
  const remainingBudget = safeBudget - totalRecordedCost;
  const cashBudgetRemaining = safeBudget - totalPaid;
  const budgetUsagePercentage = safeBudget > 0 ? (totalRecordedCost / safeBudget) * 100 : 0;

  return {
    totalBudget: safeBudget,
    totalRecordedCost,
    totalPaid,
    outstandingPayables,
    remainingBudget,
    cashBudgetRemaining,
    budgetUsagePercentage: Number(budgetUsagePercentage.toFixed(1)),
    transactionsCount: expenses.length,
    paidCount,
    partiallyPaidCount,
    unpaidCount,
  };
}

/**
 * Calculates category-wise spending breakdown
 */
export function calculateCategorySpending(expenses: Expense[], categories: Category[]) {
  const map = new Map<string, { recordedCost: number; paid: number; unpaid: number; count: number }>();

  for (const cat of categories) {
    map.set(cat.id, { recordedCost: 0, paid: 0, unpaid: 0, count: 0 });
  }

  for (const exp of expenses) {
    const entry = map.get(exp.categoryId) || { recordedCost: 0, paid: 0, unpaid: 0, count: 0 };
    const cost = Math.max(0, Number(exp.amount) || 0);
    const paid = Math.max(0, Number(exp.amountPaid) || 0);
    const due = Math.max(0, cost - paid);

    entry.recordedCost += cost;
    entry.paid += paid;
    entry.unpaid += due;
    entry.count += 1;
    map.set(exp.categoryId, entry);
  }

  return categories.map((cat) => {
    const data = map.get(cat.id) || { recordedCost: 0, paid: 0, unpaid: 0, count: 0 };
    const planned = cat.plannedBudget || 0;
    const difference = planned > 0 ? planned - data.recordedCost : 0;
    const percentageUsed = planned > 0 ? Number(((data.recordedCost / planned) * 100).toFixed(1)) : 0;
    const isOverBudget = planned > 0 && data.recordedCost > planned;

    return {
      category: cat,
      ...data,
      plannedBudget: planned,
      difference,
      percentageUsed,
      isOverBudget,
    };
  });
}

/**
 * Calculates stage-wise spending breakdown
 */
export function calculateStageSpending(expenses: Expense[], stages: ConstructionStage[]) {
  const map = new Map<string, number>();
  for (const stage of stages) {
    map.set(stage.id, 0);
  }

  let totalExpenses = 0;
  for (const exp of expenses) {
    const cost = Math.max(0, Number(exp.amount) || 0);
    totalExpenses += cost;
    if (exp.stageId && map.has(exp.stageId)) {
      map.set(exp.stageId, (map.get(exp.stageId) || 0) + cost);
    }
  }

  return stages.map((st) => {
    const cost = map.get(st.id) || 0;
    const percentageOfTotal = totalExpenses > 0 ? Number(((cost / totalExpenses) * 100).toFixed(1)) : 0;
    return {
      stage: st,
      cost,
      percentageOfTotal,
    };
  });
}

/**
 * Calculates monthly spending summary
 */
export function calculateMonthlySpending(expenses: Expense[]) {
  const monthlyMap: Record<string, { monthKey: string; label: string; cost: number; paid: number; unpaid: number }> = {};

  for (const exp of expenses) {
    if (!exp.date) continue;
    const dateObj = new Date(exp.date);
    if (isNaN(dateObj.getTime())) continue;

    const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
    const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { monthKey, label, cost: 0, paid: 0, unpaid: 0 };
    }

    const cost = Math.max(0, Number(exp.amount) || 0);
    const paid = Math.max(0, Number(exp.amountPaid) || 0);
    const due = Math.max(0, cost - paid);

    monthlyMap[monthKey].cost += cost;
    monthlyMap[monthKey].paid += paid;
    monthlyMap[monthKey].unpaid += due;
  }

  // Sort by date key ascending
  return Object.values(monthlyMap).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
}

/**
 * Formats Pakistani Rupees (PKR) with Rs. prefix and comma separators
 */
export function formatPKR(val: number, options?: { showSign?: boolean; isUrdu?: boolean }): string {
  const num = Math.round(Number(val) || 0);
  const formatted = Math.abs(num).toLocaleString('en-PK');
  const prefix = options?.isUrdu ? 'روپے ' : 'Rs. ';
  
  if (options?.showSign && num > 0) {
    return `+${prefix}${formatted}`;
  }
  if (num < 0) {
    return `-${prefix}${formatted}`;
  }
  return `${prefix}${formatted}`;
}

/**
 * Daily labor wage calculation
 * Total = (Workers × Daily Wage × Days Worked)
 * Outstanding = Total - (Advance + Paid)
 */
export function calculateLaborWages(details: {
  workersCount: number;
  dailyWagePerWorker: number;
  daysWorked: number;
  advancePayments: number;
  amountPaid: number;
}): { totalWages: number; totalPaidOverall: number; outstandingWages: number } {
  const workers = Math.max(0, Number(details.workersCount) || 0);
  const wage = Math.max(0, Number(details.dailyWagePerWorker) || 0);
  const days = Math.max(0, Number(details.daysWorked) || 0);
  const advance = Math.max(0, Number(details.advancePayments) || 0);
  const paid = Math.max(0, Number(details.amountPaid) || 0);

  const totalWages = workers * wage * days;
  const totalPaidOverall = advance + paid;
  const outstandingWages = Math.max(0, totalWages - totalPaidOverall);

  return {
    totalWages,
    totalPaidOverall,
    outstandingWages,
  };
}

/**
 * Compute progress bar color state based on usage percentage
 */
export function getBudgetStatus(usagePercentage: number): {
  color: 'emerald' | 'amber' | 'rose';
  label: string;
  labelUrdu: string;
} {
  if (usagePercentage < 75) {
    return {
      color: 'emerald',
      label: 'Within Budget',
      labelUrdu: 'بجٹ کے اندر',
    };
  }
  if (usagePercentage <= 99.9) {
    return {
      color: 'amber',
      label: 'Approaching Limit',
      labelUrdu: 'بجٹ کی حد کے قریب',
    };
  }
  return {
    color: 'rose',
    label: 'Budget Exceeded',
    labelUrdu: 'بجٹ سے زیادہ خرچ',
  };
}
