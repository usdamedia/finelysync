
export interface Income {
  husband: number;
  wife: number;
}

export type SplitType = '50/50' | 'Custom' | 'Tiada Split';

export type IncomeOwner = 'husband' | 'wife';

export enum IncomeCategory {
  GAJI = 'Gaji Hakiki',
  FREELANCE = 'Freelance',
  BONUS = 'Bonus',
  CLAIM = 'Claim',
  HADIAH = 'Hadiah/Menang',
  SEWA = 'Hasil Sewa',
  DIVIDEN = 'Dividen/Pelaburan',
  BAYAR_HUTANG = 'Orang Bayar Hutang',
  ORANG_BAGI = 'Orang Bagi',
  LAIN = 'Lain-lain'
}

export interface IncomeItem {
  id: string;
  owner: IncomeOwner;
  category: string;
  description: string;
  amount: number;
  accountId?: string; // Tagging for account isolation
  isRecurring?: boolean; // Automatically populate in future months
  recurringSourceId?: string; // Stable source id for recurring propagation across months
}

export type ExpenseStatus = 'pending' | 'aside' | 'paid';
export type PartnerSettlementDirection = 'husband_to_wife' | 'wife_to_husband';

export interface Expense {
  id: string;
  category: string;
  description: string;
  totalAmount: number;
  splitType: SplitType;
  husbandContribution: number;
  wifeContribution: number;
  status: ExpenseStatus;
  paidBy: 'husband' | 'wife' | 'both';
  accountId?: string; // Tagging for account isolation
  payToPartner?: boolean; // New field: If true, money is set aside but transferred to partner
  partnerSettlementDirection?: PartnerSettlementDirection; // Explicit direction for partner settlement
  isRecurring?: boolean; // New field: Automatically populate in future months
  recurringSourceId?: string; // Stable source id for recurring propagation across months
  dueDay?: number; // Optional day of month (1-31) the commitment is due
}

export interface SummaryMetrics {
  totalHusbandCommitment: number;
  totalWifeCommitment: number;
  balanceHusband: number;
  balanceWife: number;
}

export interface MonthlyData {
  incomes: IncomeItem[];
  expenses: Expense[];
}

export type FinancialRecords = Record<string, MonthlyData>;

export type BillingCycle = 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  name: string;
  startDate: string; // ISO date "YYYY-MM-DD"
  price: number;
  billingCycle: BillingCycle;
  color?: string;
  accountId?: string;
  createdAt?: any;
}

export enum ExpenseCategory {
  SUBSCRIPTION = 'Subscription',
  RUMAH = 'Rumah',
  PENGANGKUTAN = 'Pengangkutan',
  DAPUR = 'Dapur',
  TECH = 'Tech',
  FAMILY = 'Family',
  DEBT = 'Debt',
  SEDEKAH = 'Sedekah/Sumbangan',
  SELF_CARE = 'Self Care',
  MAKAN_LUAR = 'Makan Luar',
  ENTERTAINMENT = 'Entertainment',
  SIMPANAN = 'Simpanan',
  PELABURAN = 'Pelaburan',
  INSURAN = 'Insuran',
  SERVIS = 'Servis',
  LAIN = 'Lain-lain'
}

export interface UserSettings {
  displayName: string;
  role: 'Suami' | 'Isteri' | 'Bujang';
  currency: 'MYR' | 'USD' | 'SGD' | 'IDR';
  language?: 'ms' | 'en' | 'zh' | 'ta';
  themeColor: string;
  isDarkMode?: boolean;
  themeMode?: 'light' | 'dark' | 'dark-grey' | 'system';
  budgets?: Record<string, number>; // Monthly budget limit per expense category
  linkedAccountId?: string;
  linkedAccountEmail?: string;
  photoURL?: string;
  sharedAccountIds?: string[]; // New field: List of account IDs shared with partner
  themeStyle?: 'modern' | 'japandi';
  palette?: 'default' | 'salt-pepper' | 'winter-chill' | 'winter-salt';
}

export interface Feedback {
  sentiment: 'love' | 'neutral' | 'dislike';
  timestamp: any;
  userAgent: string;
  platform: string;
}

export type AccountType = 'bank' | 'wallet' | 'savings' | 'investment';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  color: string;
  icon?: string;
  lastUpdated?: any;
}

export interface TransferRecord {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: any;
  note?: string;
}
