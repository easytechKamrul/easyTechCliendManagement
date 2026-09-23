import { Entry } from '../types';
import { money, n, received, remaining } from '../utils/money';

interface Props {
  entries: Entry[];
  statusFilter: string;
}

export default function SummaryCards({ entries, statusFilter }: Props) {
  const active = entries.filter((e) => e.status !== 'Pending' && e.status !== 'Cancelled');
  const pending = entries.filter((e) => e.status === 'Pending');
  const deal = active.reduce((s, e) => s + n(e.deal), 0);
  const recv = active.reduce((s, e) => s + received(e), 0);
  const dueEntries = active.filter((e) => e.status === 'Progress' || e.status === 'Due Later');
  const due = dueEntries.reduce((s, e) => s + remaining(e), 0);
  const done = active.filter((e) => e.status === 'Complete').length;
  const unpaid = dueEntries.filter((e) => remaining(e) > 0).length;
  const pendingDeal = pending.reduce((s, e) => s + n(e.deal), 0);
  const pendingProfit = pending.reduce((s, e) => s + n(e.deal) - n(e.commission), 0);

  if (statusFilter === 'Pending') {
    const cards = [
      { label: 'Pending entries', value: entries.length.toLocaleString(), sub: 'Discussion records, not active jobs', cls: '' },
      { label: 'Discussed amount', value: money(pendingDeal), sub: 'Amount discussed with clients', cls: '' },
      { label: 'Net balance (profit)', value: money(pendingProfit), sub: 'Discussed amount − agent commission', cls: 'text-pending' }
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {cards.map((c) => (
          <article key={c.label} className="bg-card border border-line rounded-2xl p-4 sm:p-5 shadow-soft">
            <p className="text-xs sm:text-sm text-muted font-medium">{c.label}</p>
            <p className={`mt-1.5 text-2xl sm:text-3xl font-extrabold tnum ${c.cls}`}>{c.value}</p>
            <p className="mt-1 text-xs text-muted">{c.sub}</p>
          </article>
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Entries shown', value: entries.length.toLocaleString(), sub: `${done} complete · ${unpaid} still owing`, cls: '' },
    { label: 'Active deal amount', value: money(deal), sub: 'Excludes pending deals', cls: '' },
    { label: 'Total received', value: money(recv), sub: 'Advance + later payments', cls: 'text-good' },
    { label: 'Remaining due', value: money(due), sub: `${unpaid} client${unpaid === 1 ? '' : 's'} to follow up`, cls: 'text-bad' },
    { label: 'Pending discussions', value: money(pendingDeal), sub: `${pending.length} future/on-hold entr${pending.length === 1 ? 'y' : 'ies'}`, cls: 'text-pending' }
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((c) => (
        <article key={c.label} className="bg-card border border-line rounded-2xl p-4 sm:p-5 shadow-soft">
          <p className="text-xs sm:text-sm text-muted font-medium">{c.label}</p>
          <p className={`mt-1.5 text-2xl sm:text-3xl font-extrabold tnum ${c.cls}`}>{c.value}</p>
          <p className="mt-1 text-xs text-muted">{c.sub}</p>
        </article>
      ))}
    </div>
  );
}
