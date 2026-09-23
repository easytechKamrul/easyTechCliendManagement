import { useEffect, useState } from 'react';
import { Entry, EntryInput, EntryStatus, Payment, STATUSES } from '../types';
import { money, received, remaining, today } from '../utils/money';

interface Props {
  entry: Entry | null;          // null = "add" mode
  open: boolean;
  services: string[];           // for the datalist suggestion
  onClose: () => void;
  onSave: (data: EntryInput, id?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const blank: EntryInput = {
  date: today(), client: '', service: '', status: 'Pending',
  deal: 0, advance: 0, payments: [], commission: 0, reference: '', email: '', phone: '', notes: ''
};

export default function AddEditModal({ entry, open, services, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState<EntryInput>(blank);
  const [payDate, setPayDate] = useState(today());
  const [payAmount, setPayAmount] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(entry ? { ...entry, email: entry.email || '', phone: entry.phone || '', notes: entry.notes || '', payments: [...entry.payments] } : { ...blank, date: today() });
    setPayDate(today());
    setPayAmount('');
  }, [entry, open]);

  if (!open) return null;

  const set = <K extends keyof EntryInput>(key: K, value: EntryInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const addPayment = () => {
    const amt = Number(payAmount);
    if (!amt || amt <= 0) return;
    set('payments', [...form.payments, { date: payDate, amount: amt }] as Payment[]);
    setPayAmount('');
  };
  const removePayment = (i: number) => set('payments', form.payments.filter((_, idx) => idx !== i) as Payment[]);

  const save = async () => {
    if (!form.client.trim()) return;
    setSaving(true);
    try {
      await onSave({ ...form, service: form.service.trim() || 'Not set' }, entry?._id);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!entry) return;
    if (!confirm('Delete this entry? It cannot be undone.')) return;
    await onDelete(entry._id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:grid sm:place-items-center p-0 sm:p-6">
        <div className="bg-card w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-lift max-h-[90vh] overflow-y-auto">
          <div className="px-5 py-4 border-b border-line flex items-center justify-between sticky top-0 bg-card">
            <h2 className="font-extrabold">{entry ? 'Edit entry' : 'Add entry'}</h2>
            <button onClick={onClose} className="text-muted text-sm font-semibold">Close</button>
          </div>

          <div className="p-5 grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-muted">Working date</span>
              <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-paper border border-line text-sm outline-none focus:border-brand" />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-muted">Client name</span>
              <input type="text" value={form.client} placeholder="Client name" onChange={(e) => set('client', e.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-paper border border-line text-sm outline-none focus:border-brand" />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-muted">Service type</span>
              <input list="service-list" value={form.service} placeholder="Uber id recovery" onChange={(e) => set('service', e.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-paper border border-line text-sm outline-none focus:border-brand" />
              <datalist id="service-list">{services.map((s) => <option key={s} value={s} />)}</datalist>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-muted">Status</span>
              <select value={form.status} onChange={(e) => set('status', e.target.value as EntryStatus)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-paper border border-line text-sm outline-none focus:border-brand">
                {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.key}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-muted">Deal amount</span>
              <input type="number" min={0} inputMode="numeric" value={form.deal || ''} onChange={(e) => set('deal', Number(e.target.value))}
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-paper border border-line text-sm tnum outline-none focus:border-brand" />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-muted">Advance paid</span>
              <input type="number" min={0} inputMode="numeric" value={form.advance || ''} onChange={(e) => set('advance', Number(e.target.value))}
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-paper border border-line text-sm tnum outline-none focus:border-brand" />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-muted">Agent commission</span>
              <input type="number" min={0} inputMode="numeric" value={form.commission || ''} onChange={(e) => set('commission', Number(e.target.value))}
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-paper border border-line text-sm tnum outline-none focus:border-brand" />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-muted">Reference</span>
              <input type="text" value={form.reference} placeholder="Dipu / Tajul" onChange={(e) => set('reference', e.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-paper border border-line text-sm outline-none focus:border-brand" />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-muted">Work email</span>
              <input type="email" value={form.email} placeholder="client@gmail.com" onChange={(e) => set('email', e.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-paper border border-line text-sm outline-none focus:border-brand" />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-muted">Phone number</span>
              <input type="tel" inputMode="tel" value={form.phone} placeholder="+44 7XXX XXXXXX" onChange={(e) => set('phone', e.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-paper border border-line text-sm outline-none focus:border-brand" />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold text-muted">Discussion notes</span>
              <textarea value={form.notes} placeholder="What was discussed with this client?" onChange={(e) => set('notes', e.target.value)} rows={3}
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-paper border border-line text-sm outline-none focus:border-brand resize-y" />
            </label>

            {/* Later payments — only shown once the entry already exists */}
            {entry && (
              <div className="sm:col-span-2 rounded-xl border border-line overflow-hidden">
                <div className="px-4 py-3 bg-paper flex items-center justify-between">
                  <p className="text-sm font-bold">Later payments</p>
                  <p className="text-sm tnum text-muted">
                    Total <b className="text-good">{money(form.payments.reduce((s, p) => s + p.amount, 0))}</b>
                  </p>
                </div>
                <div className="divide-y divide-line">
                  {form.payments.length ? form.payments.map((p, i) => (
                    <div key={i} className="px-4 py-2.5 flex items-center gap-3 text-sm">
                      <span className="text-muted tnum w-28">{p.date}</span>
                      <span className="font-bold tnum text-good flex-1">{money(p.amount)}</span>
                      <button onClick={() => removePayment(i)} className="text-xs font-bold text-bad">Remove</button>
                    </div>
                  )) : <p className="px-4 py-3 text-sm text-muted">No later payment yet.</p>}
                </div>
                <div className="p-3 flex gap-2 border-t border-line">
                  <input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)}
                    className="w-40 px-3 py-2.5 rounded-xl bg-paper border border-line text-sm outline-none focus:border-brand" />
                  <input type="number" min={0} inputMode="numeric" placeholder="Amount" value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-paper border border-line text-sm tnum outline-none focus:border-brand" />
                  <button onClick={addPayment} className="px-4 py-2.5 rounded-xl bg-good text-white text-sm font-bold whitespace-nowrap">Add payment</button>
                </div>
              </div>
            )}

            <div className="sm:col-span-2 rounded-xl bg-brandsoft border border-line p-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span className="text-muted">Received <b className="text-good tnum">{money(received(form))}</b></span>
              <span className="text-muted">Remaining <b className="text-bad tnum">{money(remaining(form))}</b></span>
            </div>
          </div>

          <div className="px-5 py-4 border-t border-line flex gap-2 sticky bottom-0 bg-card">
            {entry && (
              <button onClick={remove} className="px-4 py-2.5 rounded-xl border border-line text-bad text-sm font-bold">
                Delete
              </button>
            )}
            <button onClick={onClose} className="ml-auto px-4 py-2.5 rounded-xl border border-line text-sm font-semibold">Cancel</button>
            <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-bold disabled:opacity-60">
              {saving ? 'Saving…' : 'Save entry'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
