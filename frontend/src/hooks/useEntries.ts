import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { Entry, EntryInput, Payment } from '../types';

interface UseEntriesResult {
  entries: Entry[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createEntry: (data: EntryInput) => Promise<Entry>;
  updateEntry: (id: string, data: Partial<EntryInput>) => Promise<Entry>;
  deleteEntry: (id: string) => Promise<void>;
  addPayment: (id: string, payment: Payment) => Promise<Entry>;
}

// Central place for every entries API call, plus the in-memory list the pages render from.
export function useEntries(): UseEntriesResult {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Entry[]>('/entries');
      setEntries(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not load entries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const createEntry = useCallback(async (data: EntryInput) => {
    const res = await api.post<Entry>('/entries', data);
    setEntries((prev) => [res.data, ...prev]);
    return res.data;
  }, []);

  const updateEntry = useCallback(async (id: string, data: Partial<EntryInput>) => {
    const res = await api.put<Entry>(`/entries/${id}`, data);
    setEntries((prev) => prev.map((e) => (e._id === id ? res.data : e)));
    return res.data;
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    await api.delete(`/entries/${id}`);
    setEntries((prev) => prev.filter((e) => e._id !== id));
  }, []);

  const addPayment = useCallback(async (id: string, payment: Payment) => {
    const res = await api.post<Entry>(`/entries/${id}/payments`, payment);
    setEntries((prev) => prev.map((e) => (e._id === id ? res.data : e)));
    return res.data;
  }, []);

  return { entries, loading, error, refresh, createEntry, updateEntry, deleteEntry, addPayment };
}
