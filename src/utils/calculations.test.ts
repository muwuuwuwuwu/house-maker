import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateFinancialSummary, 
  calculateCategorySpending, 
  calculateLaborWages, 
  formatPKR,
  getBudgetStatus
} from './calculations';
import { Expense, Category } from '../types';

test('calculateFinancialSummary calculates accurately for fully paid, partially paid, and unpaid expenses', () => {
  const sampleExpenses: Expense[] = [
    {
      id: '1',
      title: 'Cement 100 Bags',
      amount: 100000,
      amountPaid: 60000,
      amountDue: 40000,
      date: '2026-10-01',
      categoryId: 'cement',
      vendorName: 'Bestway Cement Dealer',
      paymentMethod: 'cash',
      paymentStatus: 'partially_paid',
      paymentHistory: [],
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Bricks 5000 Awal',
      amount: 75000,
      amountPaid: 75000,
      amountDue: 0,
      date: '2026-10-02',
      categoryId: 'bricks',
      vendorName: 'Bhatta Bhatta & Co',
      paymentMethod: 'bank_transfer',
      paymentStatus: 'paid',
      paymentHistory: [],
      createdAt: '2026-10-02T00:00:00Z',
      updatedAt: '2026-10-02T00:00:00Z',
    },
    {
      id: '3',
      title: 'Sand 2 Dumpers',
      amount: 30000,
      amountPaid: 0,
      amountDue: 30000,
      date: '2026-10-03',
      categoryId: 'sand',
      vendorName: 'Ravi Sand Supply',
      paymentMethod: 'other',
      paymentStatus: 'unpaid',
      paymentHistory: [],
      createdAt: '2026-10-03T00:00:00Z',
      updatedAt: '2026-10-03T00:00:00Z',
    }
  ];

  const totalBudget = 5000000;
  const summary = calculateFinancialSummary(totalBudget, sampleExpenses);

  // Total Recorded Cost: 100,000 + 75,000 + 30,000 = 205,000
  assert.equal(summary.totalRecordedCost, 205000);
  // Total Paid: 60,000 + 75,000 + 0 = 135,000
  assert.equal(summary.totalPaid, 135000);
  // Outstanding Payables: 40,000 + 0 + 30,000 = 70,000
  assert.equal(summary.outstandingPayables, 70000);
  // Budget Remaining (Total Budget - Recorded Cost): 5,000,000 - 205,000 = 4,795,000
  assert.equal(summary.remainingBudget, 4795000);
  // Cash Budget Remaining: 5,000,000 - 135,000 = 4,865,000
  assert.equal(summary.cashBudgetRemaining, 4865000);
  // Usage %: (205,000 / 5,000,000) * 100 = 4.1%
  assert.equal(summary.budgetUsagePercentage, 4.1);
  // Counts
  assert.equal(summary.transactionsCount, 3);
  assert.equal(summary.paidCount, 1);
  assert.equal(summary.partiallyPaidCount, 1);
  assert.equal(summary.unpaidCount, 1);
});

test('calculateFinancialSummary safely handles 0 budget and over-budget scenarios', () => {
  const overBudgetExpenses: Expense[] = [
    {
      id: '1',
      title: 'Structural Steel',
      amount: 1500000,
      amountPaid: 1500000,
      amountDue: 0,
      date: '2026-10-01',
      categoryId: 'steel',
      vendorName: 'Mughal Steel',
      paymentMethod: 'bank_transfer',
      paymentStatus: 'paid',
      paymentHistory: [],
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z',
    }
  ];

  // Budget 1,000,000 vs Cost 1,500,000
  const overSummary = calculateFinancialSummary(1000000, overBudgetExpenses);
  assert.equal(overSummary.remainingBudget, -500000);
  assert.equal(overSummary.budgetUsagePercentage, 150);

  const status = getBudgetStatus(overSummary.budgetUsagePercentage);
  assert.equal(status.color, 'rose');
  assert.equal(status.label, 'Budget Exceeded');

  // Zero budget test
  const zeroSummary = calculateFinancialSummary(0, overBudgetExpenses);
  assert.equal(zeroSummary.budgetUsagePercentage, 0);
  assert.equal(zeroSummary.remainingBudget, -1500000);
});

test('calculateCategorySpending calculates planned vs actual difference and over-budget warning', () => {
  const categories: Category[] = [
    { id: 'cement', name: 'Cement', nameUrdu: 'سیمنٹ', icon: 'Package', plannedBudget: 200000 },
    { id: 'sand', name: 'Sand', nameUrdu: 'ریت', icon: 'Layers', plannedBudget: 50000 }
  ];

  const expenses: Expense[] = [
    {
      id: '1',
      title: 'Cement batch 1',
      amount: 250000, // over planned 200,000
      amountPaid: 200000,
      amountDue: 50000,
      date: '2026-10-01',
      categoryId: 'cement',
      vendorName: 'Dealer',
      paymentMethod: 'cash',
      paymentStatus: 'partially_paid',
      paymentHistory: [],
      createdAt: '',
      updatedAt: ''
    }
  ];

  const results = calculateCategorySpending(expenses, categories);
  const cementResult = results.find(r => r.category.id === 'cement')!;
  assert.equal(cementResult.recordedCost, 250000);
  assert.equal(cementResult.difference, -50000);
  assert.equal(cementResult.isOverBudget, true);
  assert.equal(cementResult.percentageUsed, 125);
});

test('calculateLaborWages calculates workers × wage × days minus advance correctly', () => {
  // 5 workers, 2,000 wage, 6 days = 60,000 total
  // 10,000 advance paid, 30,000 weekly paid = 40,000 paid overall
  // Outstanding = 60,000 - 40,000 = 20,000
  const result = calculateLaborWages({
    workersCount: 5,
    dailyWagePerWorker: 2000,
    daysWorked: 6,
    advancePayments: 10000,
    amountPaid: 30000
  });

  assert.equal(result.totalWages, 60000);
  assert.equal(result.totalPaidOverall, 40000);
  assert.equal(result.outstandingWages, 20000);
});

test('formatPKR formats numbers cleanly with Rs. and comma separators', () => {
  assert.equal(formatPKR(1500000), 'Rs. 1,500,000');
  assert.equal(formatPKR(0), 'Rs. 0');
  assert.equal(formatPKR(-50000), '-Rs. 50,000');
  assert.equal(formatPKR(1500000, { isUrdu: true }), 'روپے 1,500,000');
});
