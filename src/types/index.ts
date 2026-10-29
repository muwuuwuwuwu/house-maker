export type Language = 'en' | 'ur';

export type PaymentMethod = 
  | 'cash' 
  | 'bank_transfer' 
  | 'easypaisa' 
  | 'jazzcash' 
  | 'cheque' 
  | 'other';

export type PaymentStatus = 'paid' | 'partially_paid' | 'unpaid';

export type StageStatus = 'not_started' | 'in_progress' | 'completed';

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number; // Total recorded cost in PKR
  amountPaid: number; // Actual amount paid so far
  amountDue: number; // Remaining amount due (amount - amountPaid)
  date: string;
  categoryId: string;
  vendorName: string;
  description?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  quantity?: number;
  unit?: string;
  stageId?: string;
  receiptUrl?: string; // base64 or photo URL
  paymentHistory: PaymentRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameUrdu: string;
  icon: string;
  isCustom?: boolean;
  plannedBudget?: number;
}

export interface ConstructionStage {
  id: string;
  order: number;
  name: string;
  nameUrdu: string;
  status: StageStatus;
  notes?: string;
}

export interface DailyLaborDetails {
  workerOrTeamName: string;
  workersCount: number;
  dailyWagePerWorker: number;
  daysWorked: number;
  advancePayments: number;
  amountPaid: number;
  outstandingWages: number;
}

export interface ContractorWorker {
  id: string;
  name: string;
  phone: string;
  workType: string;
  type: 'contractor' | 'daily_labor' | 'supplier' | 'other';
  agreedAmount?: number;
  notes?: string;
  dailyLaborDetails?: DailyLaborDetails;
  createdAt: string;
}

export interface ProjectSettings {
  id: string;
  name: string;
  location?: string;
  totalBudget: number;
  startDate: string;
  expectedCompletionDate?: string;
  language: Language;
  currency: string;
  budgetAlertThreshold: number; // e.g. 85%
}

export interface FinancialSummary {
  totalBudget: number;
  totalRecordedCost: number; // Sum of full cost of all expenses
  totalPaid: number; // Sum of actual payments made
  outstandingPayables: number; // Sum of unpaid balances (amountDue)
  remainingBudget: number; // Total Budget - Total Recorded Cost
  cashBudgetRemaining: number; // Total Budget - Total Paid
  budgetUsagePercentage: number; // (Total Recorded Cost / Total Budget) * 100
  transactionsCount: number;
  paidCount: number;
  partiallyPaidCount: number;
  unpaidCount: number;
}
