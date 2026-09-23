import { Entry } from '../types';
import { money, prettyDate, received, remaining } from '../utils/money';
import StatusBadge from './StatusBadge';

interface Props {
  entries: Entry[];
  onDetails: (entry: Entry) => void;
  onAddMoney: (entry: Entry) => void;
  onStartProcessing: (entry: Entry) => Promise<void>;
}

export default function EntryCards({ entries, onDetails, onAddMoney, onStartProcessing }: Props) {
  return (
    <div className="md:hidden space-y-3">
      {entries.map((e) => {
        const isPending = e.status === 'Pending';
        const due = isPending ? 0 : remaining(e);
        return (
          <article key={e._id} className="bg-card border border-line rounded-2xl p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-extrabold truncate">{e.client}</p>
                <p className="text-sm text-muted truncate">{e.service}</p>
              </div>
              <StatusBadge status={e.status} />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-paper py-2">
                <p className="text-[11px] text-muted">Deal</p>
                <p className="font-bold tnum text-sm">{money(e.deal)}</p>
              </div>
              <div className="rounded-xl bg-goodsoft py-2">
                <p className="text-[11px] text-good/80">Received</p>
                <p className="font-bold tnum text-sm text-good">{money(received(e))}</p>
              </div>
              <div className={`rounded-xl ${isPending ? 'bg-pendingsoft' : due ? 'bg-badsoft' : 'bg-paper'} py-2`}>
                <p className={`text-[11px] ${due ? 'text-bad/80' : 'text-muted'}`}>{isPending ? 'Not started' : 'Remaining'}</p>
                <p className={`font-bold tnum text-sm ${due ? 'text-bad' : 'text-muted'}`}>{isPending ? '—' : money(due)}</p>
              </div>
            </div>

            <p className="mt-3 text-xs text-muted tnum">{prettyDate(e.date)}</p>

            <div className="mt-3 flex gap-2">
              {e.status === 'Pending' ? (
                <button onClick={() => onStartProcessing(e)} className="flex-1 py-2.5 rounded-xl bg-warn text-white text-sm font-bold">
                  Start processing
                </button>
              ) : due > 0 && (
                <button onClick={() => onAddMoney(e)} className="flex-1 py-2.5 rounded-xl bg-good text-white text-sm font-bold">
                  Add money
                </button>
              )}
              <button onClick={() => onDetails(e)} className="flex-1 py-2.5 rounded-xl border border-line text-sm font-bold text-brand">
                Details
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
