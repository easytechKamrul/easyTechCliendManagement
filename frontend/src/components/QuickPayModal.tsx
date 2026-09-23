import { useEffect, useState } from 'react';
import { Entry } from '../types';
import { money, remaining, today } from '../utils/money';

interface Props {
  entry: Entry | null;
  onClose: () => void;
  onSave: (entryId: string, date: string, amount: number) => Promise<void>;
}

// The "take a later payment" flow: pick a date + amount, or use the whole due at once.
// Saving this drops the remaining due. Active entries are marked Complete
// automatically once it reaches zero; Pending entries stay Pending.
export default function QuickPayModal({ entry, onClose, onSave }: Props) {
  const [date, setDate] = useState(today());
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (entry) { setDate(today()); setAmount(''); }
  }, [entry]);

  if (!entry) return null;
  const due = remaining(entry);

  const save = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return;
    setSaving(true);
    try {
      await onSave(entry._id, date, amt);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[55]">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:grid sm:place-items-center p-0 sm:p-6">
        <div className="bg-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-lift">
          <div className="px-5 py-4 border-b border-line">
            <h2 className="font-extrabold">Receive payment</h2>
            <p className="text-sm text-muted mt-0.5">{entry.client} · {entry.service}</p>
          </div>

          <div className="p-5 space-y-4">
            <div className="rounded-xl bg-badsoft p-3 flex justify-between text-sm">
              <span className="font-semibold text-bad">Current due</span>
              <span className="font-extrabold tnum text-bad">{money(due)}</span>
            </div>

            <label className="block">
              <span className="text-xs font-semibold text-muted">Payment date</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-paper border border-line text-sm outline-none focus:border-brand" />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-muted">Amount received</span>
              <input type="number" min={0} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && save()}
                className="mt-1 w-full px-3 py-3 rounded-xl bg-paper border border-line text-lg font-bold tnum outline-none focus:border-brand" />
            </label>

            <button onClick={() => setAmount(String(due))} className="text-sm font-bold text-brand">
              Fill the full due amount
            </button>
          </div>

          <div className="px-5 py-4 border-t border-line flex gap-2">
            <button onClick={onClose} className="ml-auto px-4 py-2.5 rounded-xl border border-line text-sm font-semibold">Cancel</button>
            <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-xl bg-good text-white text-sm font-bold disabled:opacity-60">
              {saving ? 'Saving…' : 'Save payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
