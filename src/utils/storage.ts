import { Expense, Category, ConstructionStage, ContractorWorker, ProjectSettings } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_STAGES } from './constants';

const STORAGE_KEY_EXPENSES = 'ghar_hisab_expenses_v1';
const STORAGE_KEY_CATEGORIES = 'ghar_hisab_categories_v1';
const STORAGE_KEY_STAGES = 'ghar_hisab_stages_v1';
const STORAGE_KEY_CONTRACTORS = 'ghar_hisab_contractors_v1';
const STORAGE_KEY_PROJECT = 'ghar_hisab_project_v1';

export const INITIAL_PROJECT: ProjectSettings = {
  id: 'proj_1',
  name: 'Hamara Ghar (Our Dream Home)',
  location: 'Sector B, Bahria Town, Lahore',
  totalBudget: 6500000, // Rs. 6,500,000
  startDate: '2026-09-01',
  expectedCompletionDate: '2027-04-30',
  language: 'en',
  currency: 'PKR',
  budgetAlertThreshold: 85,
};

export const SAMPLE_CONTRACTORS: ContractorWorker[] = [
  {
    id: 'cont_1',
    name: 'Mistri Aslam & Sons',
    phone: '0300-4567890',
    workType: 'Grey Structure Masonry & Labor',
    type: 'contractor',
    agreedAmount: 950000,
    notes: 'Square foot rate agreed at Rs. 420/sqft including shuttering and casting',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'cont_2',
    name: 'Mughal Steel Traders',
    phone: '0321-9876543',
    workType: '60-Grade Deformed Steel Rebar Supply',
    type: 'supplier',
    agreedAmount: 1100000,
    notes: 'Delivery directly to plot included, mill test certificate provided',
    createdAt: '2026-09-05T11:00:00Z',
  },
  {
    id: 'cont_3',
    name: 'Tariq Mason Party (Daily Wage)',
    phone: '0345-1234567',
    workType: 'Excavation & Foundation Stone Filling',
    type: 'daily_labor',
    dailyLaborDetails: {
      workerOrTeamName: 'Tariq Mason Party',
      workersCount: 4,
      dailyWagePerWorker: 1800,
      daysWorked: 5,
      advancePayments: 8000,
      amountPaid: 20000,
      outstandingWages: 8000,
    },
    notes: 'Worked on boundary wall and foundation digging',
    createdAt: '2026-09-10T09:00:00Z',
  },
];

export const SAMPLE_EXPENSES: Expense[] = [
  {
    id: 'exp_1',
    title: 'Excavation of Basement & Footings',
    amount: 110000,
    amountPaid: 110000,
    amountDue: 0,
    date: '2026-09-03',
    categoryId: 'excavation',
    vendorName: 'CAT Excavator Services',
    description: '14 hours machine excavator work for foundation trenches',
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    quantity: 14,
    unit: 'Hours',
    stageId: 'stage_2',
    paymentHistory: [
      { id: 'p_1', date: '2026-09-03', amount: 110000, method: 'cash', notes: 'Full cash payment on site completion', createdAt: '2026-09-03T18:00:00Z' }
    ],
    createdAt: '2026-09-03T18:00:00Z',
    updatedAt: '2026-09-03T18:00:00Z',
  },
  {
    id: 'exp_2',
    title: 'Mughal 60-Grade Steel (4.2 Tons)',
    amount: 1050000,
    amountPaid: 800000,
    amountDue: 250000,
    date: '2026-09-08',
    categoryId: 'steel',
    vendorName: 'Mughal Steel Traders',
    description: '1/2 inch and 3/8 inch deformed steel rebars for footing & pillars',
    paymentMethod: 'bank_transfer',
    paymentStatus: 'partially_paid',
    quantity: 4.2,
    unit: 'Tons',
    stageId: 'stage_2',
    paymentHistory: [
      { id: 'p_2', date: '2026-09-08', amount: 800000, method: 'bank_transfer', notes: 'Bank transfer advance. Balance Rs. 250,000 due after column tie', createdAt: '2026-09-08T14:30:00Z' }
    ],
    createdAt: '2026-09-08T14:30:00Z',
    updatedAt: '2026-09-08T14:30:00Z',
  },
  {
    id: 'exp_3',
    title: 'Bestway Cement (150 Bags)',
    amount: 217500,
    amountPaid: 217500,
    amountDue: 0,
    date: '2026-09-12',
    categoryId: 'cement',
    vendorName: 'Haji Cement Store',
    description: 'Grade 53 Ordinary Portland Cement @ Rs. 1,450 per bag',
    paymentMethod: 'cheque',
    paymentStatus: 'paid',
    quantity: 150,
    unit: 'Bags',
    stageId: 'stage_2',
    paymentHistory: [
      { id: 'p_3', date: '2026-09-12', amount: 217500, method: 'cheque', notes: 'HBL Cheque #894012', createdAt: '2026-09-12T11:00:00Z' }
    ],
    createdAt: '2026-09-12T11:00:00Z',
    updatedAt: '2026-09-12T11:00:00Z',
  },
  {
    id: 'exp_4',
    title: 'Awal Quality Red Bricks (8,000 Bricks)',
    amount: 112000,
    amountPaid: 70000,
    amountDue: 42000,
    date: '2026-09-18',
    categoryId: 'bricks',
    vendorName: 'Awami Bhatta Company',
    description: 'First class kiln burnt clay bricks for plinth and boundary',
    paymentMethod: 'cash',
    paymentStatus: 'partially_paid',
    quantity: 8000,
    unit: 'Bricks',
    stageId: 'stage_4',
    paymentHistory: [
      { id: 'p_4', date: '2026-09-18', amount: 70000, method: 'cash', notes: 'Trolley unloaded. Remaining Rs. 42,000 on next delivery', createdAt: '2026-09-18T16:00:00Z' }
    ],
    createdAt: '2026-09-18T16:00:00Z',
    updatedAt: '2026-09-18T16:00:00Z',
  },
  {
    id: 'exp_5',
    title: 'Chenab Fine Sand (2 Heavy Dumpers)',
    amount: 46000,
    amountPaid: 46000,
    amountDue: 0,
    date: '2026-09-22',
    categoryId: 'sand',
    vendorName: 'Chenab Building Materials',
    description: 'Screened riverbed sand for plaster and masonry mortar',
    paymentMethod: 'jazzcash',
    paymentStatus: 'paid',
    quantity: 2,
    unit: 'Dumpers',
    stageId: 'stage_4',
    paymentHistory: [
      { id: 'p_5', date: '2026-09-22', amount: 46000, method: 'jazzcash', notes: 'JazzCash TID 88392100', createdAt: '2026-09-22T13:15:00Z' }
    ],
    createdAt: '2026-09-22T13:15:00Z',
    updatedAt: '2026-09-22T13:15:00Z',
  },
  {
    id: 'exp_6',
    title: 'Margalla Crush Gravel (1 Dumper)',
    amount: 54000,
    amountPaid: 54000,
    amountDue: 0,
    date: '2026-09-26',
    categoryId: 'crush',
    vendorName: 'Khan Crush Supplier',
    description: '1/2 inch blue limestone aggregate for column casting',
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    quantity: 1,
    unit: 'Dumper',
    stageId: 'stage_3',
    paymentHistory: [
      { id: 'p_6', date: '2026-09-26', amount: 54000, method: 'cash', notes: 'Paid on plot delivery', createdAt: '2026-09-26T17:20:00Z' }
    ],
    createdAt: '2026-09-26T17:20:00Z',
    updatedAt: '2026-09-26T17:20:00Z',
  },
  {
    id: 'exp_7',
    title: 'Mistri Aslam Contractor 1st Running Bill',
    amount: 180000,
    amountPaid: 150000,
    amountDue: 30000,
    date: '2026-10-02',
    categoryId: 'contractor',
    vendorName: 'Mistri Aslam & Sons',
    description: 'Plinth beam completion and underground water tank shuttering',
    paymentMethod: 'bank_transfer',
    paymentStatus: 'partially_paid',
    stageId: 'stage_3',
    paymentHistory: [
      { id: 'p_7', date: '2026-10-02', amount: 150000, method: 'bank_transfer', notes: 'Rs. 30,000 kept as retention until water testing', createdAt: '2026-10-02T19:00:00Z' }
    ],
    createdAt: '2026-10-02T19:00:00Z',
    updatedAt: '2026-10-02T19:00:00Z',
  },
  {
    id: 'exp_8',
    title: 'UPVC Sewerage Pipes & Fittings',
    amount: 88000,
    amountPaid: 0,
    amountDue: 88000,
    date: '2026-10-15',
    categoryId: 'plumbing',
    vendorName: 'Master Sanitary & Hardware',
    description: '4-inch Class B UPVC drainage pipes and gully traps for foundation',
    paymentMethod: 'other',
    paymentStatus: 'unpaid',
    stageId: 'stage_6',
    paymentHistory: [],
    createdAt: '2026-10-15T12:00:00Z',
    updatedAt: '2026-10-15T12:00:00Z',
  },
  {
    id: 'exp_9',
    title: 'Water Boring & Motor Installation',
    amount: 95000,
    amountPaid: 95000,
    amountDue: 0,
    date: '2026-09-02',
    categoryId: 'water_electricity',
    vendorName: 'Rehman Boring Works',
    description: '120 feet deep water boring with 1.5HP submersible pump for construction water',
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    stageId: 'stage_1',
    paymentHistory: [
      { id: 'p_9', date: '2026-09-02', amount: 95000, method: 'cash', notes: 'Completed and water pumping verified', createdAt: '2026-09-02T16:00:00Z' }
    ],
    createdAt: '2026-09-02T16:00:00Z',
    updatedAt: '2026-09-02T16:00:00Z',
  },
];

export function getStoredProject(): ProjectSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECT);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading project settings:', err);
  }
  return INITIAL_PROJECT;
}

export function saveStoredProject(project: ProjectSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROJECT, JSON.stringify(project));
  } catch (err) {
    console.error('Failed saving project settings:', err);
  }
}

export function getStoredExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXPENSES);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading expenses:', err);
  }
  return SAMPLE_EXPENSES;
}

export function saveStoredExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
  } catch (err) {
    console.error('Failed saving expenses:', err);
  }
}

export function getStoredCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading categories:', err);
  }
  return DEFAULT_CATEGORIES;
}

export function saveStoredCategories(categories: Category[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed saving categories:', err);
  }
}

export function getStoredStages(): ConstructionStage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STAGES);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading stages:', err);
  }
  return DEFAULT_STAGES;
}

export function saveStoredStages(stages: ConstructionStage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_STAGES, JSON.stringify(stages));
  } catch (err) {
    console.error('Failed saving stages:', err);
  }
}

export function getStoredContractors(): ContractorWorker[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONTRACTORS);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading contractors:', err);
  }
  return SAMPLE_CONTRACTORS;
}

export function saveStoredContractors(contractors: ContractorWorker[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONTRACTORS, JSON.stringify(contractors));
  } catch (err) {
    console.error('Failed saving contractors:', err);
  }
}

export function exportBackupJSON(): string {
  const data = {
    app: 'Ghar Hisab',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    project: getStoredProject(),
    expenses: getStoredExpenses(),
    categories: getStoredCategories(),
    stages: getStoredStages(),
    contractors: getStoredContractors(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupJSON(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.expenses || !Array.isArray(data.expenses)) {
      throw new Error('Invalid backup structure: expenses missing');
    }
    if (data.project) saveStoredProject(data.project);
    if (data.expenses) saveStoredExpenses(data.expenses);
    if (data.categories) saveStoredCategories(data.categories);
    if (data.stages) saveStoredStages(data.stages);
    if (data.contractors) saveStoredContractors(data.contractors);
    return true;
  } catch (err) {
    console.error('Failed to import backup JSON:', err);
    return false;
  }
}

export function resetToEmptyProject(customName?: string, customBudget?: number): void {
  const freshProject: ProjectSettings = {
    ...INITIAL_PROJECT,
    id: `proj_${Date.now()}`,
    name: customName || 'Hamara Ghar',
    totalBudget: customBudget || 5000000,
    startDate: new Date().toISOString().split('T')[0],
  };
  saveStoredProject(freshProject);
  saveStoredExpenses([]);
  saveStoredCategories(DEFAULT_CATEGORIES);
  saveStoredStages(DEFAULT_STAGES.map(s => ({ ...s, status: 'not_started' })));
  saveStoredContractors([]);
}

export function reloadSampleData(): void {
  saveStoredProject(INITIAL_PROJECT);
  saveStoredExpenses(SAMPLE_EXPENSES);
  saveStoredCategories(DEFAULT_CATEGORIES);
  saveStoredStages(DEFAULT_STAGES);
  saveStoredContractors(SAMPLE_CONTRACTORS);
}
