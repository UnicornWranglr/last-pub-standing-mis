export interface PayrollEntry {
  id: number;
  pay_period_start: string;
  pay_period_end: string;
  employee_name: string;
  gross_pay: string | number;
  ni_contribution: string | number;
  pension: string | number;
  net_pay: string | number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayrollInput {
  pay_period_start: string;
  pay_period_end: string;
  employee_name: string;
  gross_pay: number;
  ni_contribution: number;
  pension: number;
  notes?: string | null;
}

export interface PayrollSummary {
  weekNet: number;
  monthNet: number;
  quarterNet: number;
  yearNet: number;
  monthGross: number;
}
