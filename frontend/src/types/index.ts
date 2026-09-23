export type EntryStatus = 'Complete' | 'Progress' | 'Due Later' | 'Pending' | 'Cancelled';

export interface Payment {
  date: string;
  amount: number;
}

export interface Entry {
  _id: string;
  date: string;
  client: string;
  service: string;
  status: EntryStatus;
  deal: number;
  advance: number;
  payments: Payment[];
  commission: number;
  reference?: string;
  email?: string;
  phone?: string;
  notes?: string;
  startedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Shape used when creating/editing an entry (no _id yet, payments optional).
export type EntryInput = Omit<Entry, '_id' | 'createdAt' | 'updatedAt'>;

export const STATUSES: { key: EntryStatus; badgeClass: string }[] = [
  { key: 'Complete', badgeClass: 'bg-goodsoft text-good' },
  { key: 'Progress', badgeClass: 'bg-warnsoft text-warn' },
  { key: 'Due Later', badgeClass: 'bg-badsoft text-bad' },
  { key: 'Pending', badgeClass: 'bg-pendingsoft text-pending' },
  { key: 'Cancelled', badgeClass: 'bg-paper text-muted' }
];
