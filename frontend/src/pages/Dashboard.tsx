import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LayoutContext } from '../components/Layout';
import { money, monthKey, monthName, n, prettyDate, remaining } from '../utils/money';

export default function Dashboard() {
  const { entries, openAddMoney } = useOutletContext<LayoutContext>();
  const [month, setMonth] = useState('all');

  const monthKeys = useMemo(
    () => [...new Set(entries.flatMap((e) => [e.date, ...e.payments.map((p) => p.date)]).map(monthKey).filter(Boolean))].sort().reverse(),
    [entries]
  );

  const scoped = month === 'all' ? entries : entries.filter((e) => monthKey(e.date) === month);
  // Pending entries are future/on-hold work, kept separate from active revenue.
  const active = scoped.filter((e) => e.status !== 'Cancelled' && e.status !== 'Pending');
  const pending = scoped.filter((e) => e.status === 'Pending');
  const done = active.filter((e) => e.status === 'Complete').length;
  const proc = active.filter((e) => e.status === 'Progress').length;
  const dueEntries = active.filter((e) => e.status === 'Progress' || e.status === 'Due Later');
  const owing = dueEntries.filter((e) => remaining(e) > 0);
  const total = active.length || 1;

  const deal = active.reduce((s, e) => s + n(e.deal), 0);
  // An advance belongs to the work date, while a later payment belongs to the date
  // it was received. This keeps a payment made in a later month out of the work month.
  const recv = entries
    .filter((e) => e.status !== 'Cancelled' && e.status !== 'Pending')
    .reduce((sum, e) => sum
      + (month === 'all' || monthKey(e.date) === month ? n(e.advance) : 0)
      + e.payments.reduce((paymentSum, p) => paymentSum + (month === 'all' || monthKey(p.date) === month ? n(p.amount) : 0), 0), 0);
  const comm = active.reduce((s, e) => s + n(e.commission), 0);
  const due = dueEntries.reduce((s, e) => s + remaining(e), 0);
  const pendingDeal = pending.reduce((s, e) => s + n(e.deal), 0);

  // Month-by-month breakdown, most recent first, capped to 6 rows.
  const byMonth: Record<string, { jobs: number; done: number; deal: number; recv: number; due: number }> = {};
  entries.filter((e) => e.status !== 'Cancelled' && e.status !== 'Pending').forEach((e) => {
    const k = monthKey(e.date);
    if (!k) return;
    byMonth[k] = byMonth[k] || { jobs: 0, done: 0, deal: 0, recv: 0, due: 0 };
    const m = byMonth[k];
    m.jobs++;
    if (e.status === 'Complete') m.done++;
    m.deal += n(e.deal); m.recv += n(e.advance);
    if (e.status === 'Progress' || e.status === 'Due Later') m.due += remaining(e);

    e.payments.forEach((p) => {
      const paymentMonth = monthKey(p.date);
      if (!paymentMonth) return;
      byMonth[paymentMonth] = byMonth[paymentMonth] || { jobs: 0, done: 0, deal: 0, recv: 0, due: 0 };
      byMonth[paymentMonth].recv += n(p.amount);
    });
  });
  const months = Object.keys(byMonth).sort().reverse().slice(0, 6);
  const peak = Math.max(1, ...months.map((k) => byMonth[k].jobs));

  const owingSorted = [...owing].sort((a, b) => remaining(b) - remaining(a)).slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="bg-card border border-line rounded-2xl shadow-soft p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <label className="text-sm font-semibold text-muted sm:w-40">Showing month</label>
        <select value={month} onChange={(e) => setMonth(e.target.value)}
          className="flex-1 px-3 py-2.5 rounded-xl bg-paper border border-line text-sm font-semibold outline-none focus:border-brand">
          <option value="all">All months</option>
          {monthKeys.map((k) => <option key={k} value={k}>{monthName(k)}</option>)}
        </select>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <article className="lg:col-span-2 bg-card border border-line rounded-2xl p-5 shadow-soft">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-extrabold">Work progress</h2>
            <p className="text-sm text-muted"><span className="font-bold text-body tnum">{done}</span> of <span className="tnum">{active.length}</span> jobs finished</p>
          </div>

          <div className="mt-4 h-3 rounded-full bg-paper overflow-hidden flex">
            <div className="h-full bg-good transition-[width] duration-500" style={{ width: `${(done / total) * 100}%` }} />
            <div className="h-full bg-warn transition-[width] duration-500" style={{ width: `${(proc / total) * 100}%` }} />
            <div className="h-full bg-bad transition-[width] duration-500" style={{ width: `${(active.filter((e) => e.status === 'Due Later').length / total) * 100}%` }} />
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-goodsoft p-3">
              <p className="text-xs font-semibold text-good">Completed</p>
              <p className="text-2xl font-extrabold text-good tnum">{done}</p>
              <p className="text-[11px] text-good/80">{Math.round((done / total) * 100)}% of work</p>
            </div>
            <div className="rounded-xl bg-warnsoft p-3">
              <p className="text-xs font-semibold text-warn">Processing</p>
              <p className="text-2xl font-extrabold text-warn tnum">{proc}</p>
              <p className="text-[11px] text-warn/80">In progress now</p>
            </div>
            <div className="rounded-xl bg-badsoft p-3">
              <p className="text-xs font-semibold text-bad">Payment pending</p>
              <p className="text-2xl font-extrabold text-bad tnum">{owing.length}</p>
              <p className="text-[11px] text-bad/80">Clients still owing</p>
            </div>
            <div className="rounded-xl bg-pendingsoft p-3">
              <p className="text-xs font-semibold text-pending">On hold</p>
              <p className="text-2xl font-extrabold text-pending tnum">{pending.length}</p>
              <p className="text-[11px] text-pending/80">{money(pendingDeal)} discussed</p>
            </div>
          </div>
        </article>

        <article className="bg-card border border-line rounded-2xl p-5 shadow-soft">
          <h2 className="font-extrabold">Money summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Deal amount</dt><dd className="font-bold tnum">{money(deal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Received</dt><dd className="font-bold tnum text-good">{money(recv)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Agent commission</dt><dd className="font-bold tnum">− {money(comm)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Due to collect</dt><dd className="font-bold tnum text-bad">{money(due)}</dd></div>
          </dl>
        </article>
      </div>

      <article className="bg-card border border-line rounded-2xl p-5 shadow-soft">
        <h2 className="font-extrabold">Month by month</h2>
        <p className="text-sm text-muted mt-1">Jobs finished and money collected in each month.</p>
        <div className="mt-5 space-y-4">
          {months.length ? months.map((k) => {
            const m = byMonth[k];
            const pctDone = m.jobs ? Math.round((m.done / m.jobs) * 100) : 0;
            return (
              <div key={k}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <p className="font-bold">{monthName(k)}</p>
                  <p className="text-muted tnum"><b className="text-body">{m.done}</b>/{m.jobs} done · {money(m.recv)} received</p>
                </div>
                <div className="mt-2 h-8 rounded-lg bg-paper overflow-hidden flex" style={{ width: `${Math.max(18, (m.jobs / peak) * 100)}%` }}>
                  <div className="h-full bg-good/90 grid place-items-center text-[11px] font-bold text-white" style={{ width: `${pctDone}%` }}>
                    {pctDone > 14 ? `${pctDone}%` : ''}
                  </div>
                  <div className="h-full bg-warn/70" style={{ width: `${100 - pctDone}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted tnum">Deal {money(m.deal)} · Due {money(m.due)}</p>
              </div>
            );
          }) : <p className="text-sm text-muted">No records yet.</p>}
        </div>
      </article>

      <article className="bg-card border border-line rounded-2xl p-5 shadow-soft">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-extrabold">Clients to follow up</h2>
          <span className="text-sm text-muted tnum">{owing.length} client{owing.length === 1 ? '' : 's'}</span>
        </div>
        <div className="mt-4 space-y-2">
          {owingSorted.length ? owingSorted.map((e) => (
            <div key={e._id} className="flex items-center gap-3 p-3 rounded-xl bg-paper">
              <div className="min-w-0 flex-1">
                <p className="font-bold truncate">{e.client}</p>
                <p className="text-xs text-muted truncate">{e.service} · {prettyDate(e.date)}</p>
              </div>
              <p className="font-extrabold tnum text-bad whitespace-nowrap">{money(remaining(e))}</p>
              <button onClick={() => openAddMoney(e)} className="px-3 py-2 rounded-lg bg-good text-white text-xs font-bold whitespace-nowrap">
                Take money
              </button>
            </div>
          )) : <p className="text-sm text-muted">Everyone has paid in full.</p>}
        </div>
      </article>
    </div>
  );
}
