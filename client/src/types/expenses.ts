export type ExpenseCategory =
  | 'bar_stock'
  | 'food_stock'
  | 'utilities'
  | 'fixed'
  | 'maintenance'
  | 'other';

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'bar_stock', label: 'Bar Stock' },
  { value: 'food_stock', label: 'Food Stock' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'fixed', label: 'Fixed costs (rent, rates, insurance)' },
  { value: 'maintenance', label: 'Maintenance & repairs' },
  { value: 'other', label: 'Other' },
];

export function formatCategory(category: ExpenseCategory): string {
  return EXPENSE_CATEGORIES.find((c) => c.value === category)?.label ?? category;
}

export interface Expense {
  id: number;
  expense_date: string;
  category: ExpenseCategory;
  amount: string | number;
  supplier: string | null;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseInput {
  expense_date: string;
  category: ExpenseCategory;
  amount: number;
  supplier?: string | null;
  description?: string | null;
  notes?: string | null;
}

export interface ExpensesSummary {
  weekTotal: number;
  monthTotal: number;
  quarterTotal: number;
  yearTotal: number;
  byCategoryThisMonth: { category: ExpenseCategory; total: number }[];
}
