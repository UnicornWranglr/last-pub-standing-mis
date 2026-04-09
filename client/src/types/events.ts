export type EntryType = 'paid' | 'free';

export interface PubEvent {
  id: number;
  name: string;
  theme: string | null;
  event_date: string;
  event_time: string | null;
  entry_type: EntryType;
  ticket_price: string | number | null;
  contact_name: string | null;
  contact_info: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PubEventInput {
  name: string;
  theme?: string | null;
  event_date: string;
  event_time?: string | null;
  entry_type: EntryType;
  ticket_price?: number | null;
  contact_name?: string | null;
  contact_info?: string | null;
  notes?: string | null;
}
