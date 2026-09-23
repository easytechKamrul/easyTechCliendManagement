import { Entry } from '../types';

export const n = (v: unknown): number => Number(v) || 0;

export const laterPaid = (e: Pick<Entry, 'payments'>): number =>
  (e.payments || []).reduce((s, p) => s + n(p.amount), 0);

export const received = (e: Pick<Entry, 'advance' | 'payments'>): number =>
  n(e.advance) + laterPaid(e);

export const remaining = (e: Pick<Entry, 'deal' | 'advance' | 'payments'>): number =>
  Math.max(0, n(e.deal) - received(e));

export const money = (v: unknown): string => '£' + n(v).toLocaleString('en-GB');

export const monthKey = (iso: string): string => (iso || '').slice(0, 7);

export const monthName = (key: string): string => {
  if (key === 'all') return 'All months';
  const d = new Date(key + '-01T00:00:00');
  return isNaN(d.getTime()) ? key : d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
};

export const prettyDate = (iso?: string): string => {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const today = (): string => new Date().toISOString().slice(0, 10);
