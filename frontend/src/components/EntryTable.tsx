import { Entry } from '../types';
import { money, prettyDate, remaining } from '../utils/money';
import StatusBadge from './StatusBadge';

interface Props {
  entries: Entry[];
  onDetails: (entry: Entry) => void;
  onAddMoney: (entry: Entry) => void;
  onStartProcessing: (entry: Entry) => Promise<void>;
}

// Desktop / tablet table — kept to the essential columns; everything else lives
// behind the "Details" button so the table doesn't get too wide.
export default function EntryTable({ entries, onDetails, onAddMoney, onStartProcessing }: Props) {
  const totalDeal = entries.reduce((s, e) => s + e.deal, 0);
  const totalDue = entries
    .filter((e) => e.status === 'Progress' || e.status === 'Due Later')
    .reduce((s, e) => s + remaining(e), 0);

  return (
    <div className="hidden md:block bg-card border border-line rounded-2xl shadow-soft overflow-hidden">
      <div className="tablewrap max-h-[62vh]">
        <table className="w-full text-sm border-collapse">
          <thead className="text-left">
            <tr className="border-b border-line">
              <th className="py-3 px-4 font-semibold text-muted whitespace-nowrap">Date</th>
              <th className="py-3 px-4 font-semibold text-muted whitespace-nowrap">Client</th>
              <th className="py-3 px-4 font-semibold text-muted whitespace-nowrap">Service</th>
              <th className="py-3 px-4 font-semibold text-muted whitespace-nowrap">Status</th>
              <th className="py-3 px-4 font-semibold text-muted text-right whitespace-nowrap">Deal</th>
              <th className="py-3 px-4 font-semibold text-muted text-right whitespace-nowrap">Remaining</th>
              <th className="py-3 px-4 font-semibold text-muted text-right whitespace-nowrap">Action</th>
              <th className="py-3 px-4 font-semibold text-muted text-right whitespace-nowrap">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {entries.map((e) => {
              const isPending = e.status === 'Pending';
              const due = isPending ? 0 : remaining(e);
              return (
                <tr key={e._id}>
                  <td className="py-3 px-4 whitespace-nowrap tnum text-muted">{prettyDate(e.date)}</td>
                  <td className="py-3 px-4 font-bold whitespace-nowrap">{e.client}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{e.service}</td>
                  <td className="py-3 px-4 whitespace-nowrap"><StatusBadge status={e.status} /></td>
                  <td className="py-3 px-4 text-right tnum font-semibold">{money(e.deal)}</td>
                  <td className={`py-3 px-4 text-right tnum font-bold ${due ? 'text-bad' : 'text-muted'}`}>{isPending ? '—' : money(due)}</td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {e.status === 'Pending' ? (
                      <button onClick={() => onStartProcessing(e)} className="px-3 py-1.5 rounded-lg bg-warn text-white text-xs font-bold">
                        Start processing
                      </button>
                    ) : due ? (
                      <button onClick={() => onAddMoney(e)} className="px-3 py-1.5 rounded-lg bg-good text-white text-xs font-bold">
                        Add money
                      </button>
                    ) : <span className="text-muted text-xs">—</span>}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button onClick={() => onDetails(e)} className="px-3 py-1.5 rounded-lg border border-line text-xs font-bold text-brand">
                      Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t-2 border-line">
            <tr className="bg-paper font-bold tnum">
              <td className="py-3 px-4" colSpan={4}>Totals shown</td>
              <td className="py-3 px-4 text-right">{money(totalDeal)}</td>
              <td className="py-3 px-4 text-right text-bad">{money(totalDue)}</td>
              <td className="py-3 px-4" colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
