import { Category, ConstructionStage, PaymentMethod } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cement', name: 'Cement', nameUrdu: 'سیمنٹ', icon: 'Package', plannedBudget: 800000 },
  { id: 'bricks', name: 'Bricks', nameUrdu: 'اینٹیں', icon: 'Boxes', plannedBudget: 600000 },
  { id: 'sand', name: 'Sand', nameUrdu: 'ریت', icon: 'Layers', plannedBudget: 150000 },
  { id: 'crush', name: 'Crush / Gravel', nameUrdu: 'بجری', icon: 'Component', plannedBudget: 250000 },
  { id: 'steel', name: 'Steel / Saria', nameUrdu: 'سریا', icon: 'Shield', plannedBudget: 1200000 },
  { id: 'concrete', name: 'Concrete', nameUrdu: 'کنکریٹ', icon: 'Maximize2', plannedBudget: 300000 },
  { id: 'labor_wages', name: 'Labor Wages', nameUrdu: 'مزدوری', icon: 'Users', plannedBudget: 1000000 },
  { id: 'contractor', name: 'Contractor Payments', nameUrdu: 'ٹھیکیدار ادائیگی', icon: 'Briefcase', plannedBudget: 1500000 },
  { id: 'plumbing', name: 'Plumbing', nameUrdu: 'پلمبنگ و سینیٹری', icon: 'Wrench', plannedBudget: 350000 },
  { id: 'electrical', name: 'Electrical Work', nameUrdu: 'بجلی کا سامان و وائرنگ', icon: 'Zap', plannedBudget: 400000 },
  { id: 'paint', name: 'Paint', nameUrdu: 'رنگ و روغن', icon: 'Paintbrush', plannedBudget: 300000 },
  { id: 'tiles_flooring', name: 'Tiles & Flooring', nameUrdu: 'ٹائلیں اور فرش', icon: 'Grid', plannedBudget: 500000 },
  { id: 'woodwork_doors', name: 'Woodwork & Doors', nameUrdu: 'لکڑی اور دروازے', icon: 'DoorClosed', plannedBudget: 450000 },
  { id: 'windows_glass', name: 'Windows & Glass', nameUrdu: 'کھڑکیاں اور شیشہ', icon: 'Square', plannedBudget: 250000 },
  { id: 'roofing', name: 'Roofing', nameUrdu: 'چھت کی واٹر پروفنگ', icon: 'Home', plannedBudget: 200000 },
  { id: 'foundation', name: 'Foundation', nameUrdu: 'بنیادیں', icon: 'Anchor', plannedBudget: 400000 },
  { id: 'excavation', name: 'Excavation', nameUrdu: 'کھدائی', icon: 'Shovel', plannedBudget: 120000 },
  { id: 'transportation', name: 'Transportation', nameUrdu: 'کرایہ اور مال برداری', icon: 'Truck', plannedBudget: 150000 },
  { id: 'machinery_rental', name: 'Machinery Rental', nameUrdu: 'مشینری کرایہ', icon: 'Cpu', plannedBudget: 100000 },
  { id: 'hardware_tools', name: 'Hardware & Tools', nameUrdu: 'ہارڈویئر اور اوزار', icon: 'Hammer', plannedBudget: 80000 },
  { id: 'water_electricity', name: 'Water & Electricity', nameUrdu: 'پانی اور بجلی کنکشن', icon: 'Droplets', plannedBudget: 100000 },
  { id: 'govt_fees', name: 'Government Fees & Approvals', nameUrdu: 'سرکاری فیس و نقشہ منظوری', icon: 'FileText', plannedBudget: 150000 },
  { id: 'miscellaneous', name: 'Miscellaneous', nameUrdu: 'متفرق اخراجات', icon: 'MoreHorizontal', plannedBudget: 150000 },
];

export const DEFAULT_STAGES: ConstructionStage[] = [
  { id: 'stage_1', order: 1, name: 'Planning and Approvals', nameUrdu: 'منصوبہ بندی اور سرکاری منظوری', status: 'completed' },
  { id: 'stage_2', order: 2, name: 'Excavation and Foundation', nameUrdu: 'کھدائی اور بنیادیں', status: 'completed' },
  { id: 'stage_3', order: 3, name: 'Structure and Columns', nameUrdu: 'ڈھانچہ اور پلرز', status: 'in_progress' },
  { id: 'stage_4', order: 4, name: 'Brickwork', nameUrdu: 'چنائی اور دیواریں', status: 'in_progress' },
  { id: 'stage_5', order: 5, name: 'Roof and Slab', nameUrdu: 'چھت اور لینٹر', status: 'not_started' },
  { id: 'stage_6', order: 6, name: 'Plumbing and Electrical', nameUrdu: 'پلمبنگ اور الیکٹریکل پائپنگ', status: 'not_started' },
  { id: 'stage_7', order: 7, name: 'Plastering', nameUrdu: 'پلستر کا کام', status: 'not_started' },
  { id: 'stage_8', order: 8, name: 'Flooring and Tiles', nameUrdu: 'فرش اور ٹائلیں لگانا', status: 'not_started' },
  { id: 'stage_9', order: 9, name: 'Doors and Windows', nameUrdu: 'دروازے اور کھڑکیاں', status: 'not_started' },
  { id: 'stage_10', order: 10, name: 'Painting', nameUrdu: 'پینٹ اور فنشنگ', status: 'not_started' },
  { id: 'stage_11', order: 11, name: 'Finishing and Final Work', nameUrdu: 'آخری فنشنگ اور ہینڈ اوور', status: 'not_started' },
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string; labelUrdu: string }[] = [
  { value: 'cash', label: 'Cash (نقد)', labelUrdu: 'نقد (کیش)' },
  { value: 'bank_transfer', label: 'Bank Transfer (بینک ٹرانسفر)', labelUrdu: 'بینک ٹرانسفر' },
  { value: 'easypaisa', label: 'Easypaisa (ایزی پیسہ)', labelUrdu: 'ایزی پیسہ' },
  { value: 'jazzcash', label: 'JazzCash (جاز کیش)', labelUrdu: 'جاز کیش' },
  { value: 'cheque', label: 'Cheque (چیک)', labelUrdu: 'بینک چیک' },
  { value: 'other', label: 'Other (دیگر)', labelUrdu: 'دیگر' },
];
