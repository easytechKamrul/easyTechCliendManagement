import { Entry } from '../types';
import { money, prettyDate, received, remaining } from '../utils/money';
import StatusBadge from './StatusBadge';

interface Props {
  entry: Entry | null;
  onClose: () => void;
  onEdit: (entry: Entry) => void;
  onAddMoney: (entry: Entry) => void;
  onStartProcessing: (entry: Entry) => Promise<void>;
}

export default function DetailsModal({ entry, onClose, onEdit, onAddMoney, onStartProcessing }: Props) {
  if (!entry) return null;
  const isPending = entry.status === 'Pending';
  const due = isPending ? 0 : remaining(entry);

  return (
    <div className="fixed inset-0 z-[52]">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:grid sm:place-items-center p-0 sm:p-6">
        <div className="bg-card w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-lift max-h-[90vh] overflow-y-auto">
          <div className="px-5 py-4 border-b border-line flex items-center justify-between sticky top-0 bg-card">
            <div>
              <h2 className="font-extrabold">{entry.client}</h2>
              <p className="text-sm text-muted">{entry.service}</p>
            </div>
            <button onClick={onClose} className="text-muted text-sm font-semibold">Close</button>
          </div>

          <div className="p-5 space-y-4">
            <StatusBadge status={entry.status} />

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-paper p-3"><p className="text-[11px] text-muted">{isPending ? 'Discussed amount' : 'Deal'}</p><p className="font-extrabold tnum">{money(entry.deal)}</p></div>
              <div className="rounded-xl bg-goodsoft p-3"><p className="text-[11px] text-good/80">Received</p><p className="font-extrabold tnum text-good">{money(received(entry))}</p></div>
              <div className={`rounded-xl p-3 ${isPending ? 'bg-pendingsoft' : 'bg-badsoft'}`}><p className={`text-[11px] ${isPending ? 'text-pending/80' : 'text-bad/80'}`}>{isPending ? 'Not started' : 'Remaining'}</p><p className={`font-extrabold tnum ${isPending ? 'text-pending' : 'text-bad'}`}>{isPending ? '—' : money(due)}</p></div>
            </div>

            <dl className="text-sm space-y-2 pt-1">
              <div className="flex justify-between"><dt className="text-muted">Working date</dt><dd className="tnum font-semibold">{prettyDate(entry.date)}</dd></div>
              {entry.startedDate && <div className="flex justify-between"><dt className="text-muted">Work taken date</dt><dd className="tnum font-semibold">{prettyDate(entry.startedDate)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted">Advance paid</dt><dd className="tnum font-semibold">{money(entry.advance)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Agent commission</dt><dd className="tnum font-semibold">{money(entry.commission)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Reference</dt><dd className="font-semibold">{entry.reference || '—'}</dd></div>
              <div className="flex justify-between gap-3 min-w-0">
                <dt className="text-muted shrink-0">Work email</dt>
                <dd className="font-semibold truncate">
                  {entry.email ? <a className="text-calm" href={`mailto:${entry.email}`}>{entry.email}</a> : '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-3 min-w-0">
                <dt className="text-muted shrink-0">Phone number</dt>
                <dd className="font-semibold truncate">
                  {entry.phone ? <a className="text-calm" href={`tel:${entry.phone}`}>{entry.phone}</a> : '—'}
                </dd>
              </div>
            </dl>

            <div className="rounded-xl bg-paper p-4">
              <p className="text-xs font-semibold text-muted">Discussion notes</p>
              <p className="mt-1.5 text-sm whitespace-pre-wrap">{entry.notes || '—'}</p>
            </div>

            {!isPending && <div className="rounded-xl border border-line overflow-hidden">
              <div className="px-4 py-2.5 bg-paper text-sm font-bold">Later payments</div>
              <div className="divide-y divide-line">
                {entry.payments.length ? entry.payments.map((p, i) => (
                  <div key={i} className="px-4 py-2.5 flex justify-between text-sm">
                    <span className="text-muted tnum">{prettyDate(p.date)}</span>
                    <span className="font-bold tnum text-good">{money(p.amount)}</span>
                  </div>
                )) : <p className="px-4 py-3 text-sm text-muted">No later payment yet.</p>}
              </div>
            </div>}
          </div>

          <div className="px-5 py-4 border-t border-line flex gap-2 sticky bottom-0 bg-card">
            {entry.status === 'Pending' ? (
              <button onClick={() => onStartProcessing(entry)} className="px-4 py-2.5 rounded-xl bg-warn text-white text-sm font-bold">
                Start processing
              </button>
            ) : due > 0 && (
              <button onClick={() => onAddMoney(entry)} className="px-4 py-2.5 rounded-xl bg-good text-white text-sm font-bold">
                Add money
              </button>
            )}
            <button onClick={() => onEdit(entry)} className="ml-auto px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-bold">
              Edit entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
