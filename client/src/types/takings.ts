export interface Takings {
  id: number;
  takings_date: string;
  cash_takings: string | number;
  card_takings: string | number;
  total: string | number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TakingsInput {
  takings_date: string;
  cash_takings: number;
  card_takings: number;
  notes?: string | null;
}

export interface TakingsSummary {
  weekTotal: number;
  monthTotal: number;
}
