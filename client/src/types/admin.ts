import type { Role } from '@/contexts/AuthContext';

export interface AdminUser {
  id: number;
  username: string;
  role: Role;
  created_at: string;
  last_login_at: string | null;
}

export interface AuditLogEntry {
  id: number;
  user_id: number | null;
  username: string | null;
  action: string;
  resource_type: string | null;
  resource_id: number | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface BusinessTotals {
  revenue: {
    week: number;
    month: number;
    quarter: number;
    year: number;
    allTime: number;
  };
  expenses: {
    month: number;
    year: number;
    allTime: number;
  };
  payroll: {
    month: number;
    year: number;
    allTime: number;
  };
  profit: {
    month: number;
    year: number;
    allTime: number;
  };
  events: {
    thisYear: number;
    allTime: number;
  };
  takings: {
    oldest: string | null;
    newest: string | null;
  };
}
