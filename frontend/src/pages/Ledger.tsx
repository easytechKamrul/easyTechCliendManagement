import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LayoutContext } from '../components/Layout';
import SummaryCards from '../components/SummaryCards';
import EntryTable from '../components/EntryTable';
import EntryCards from '../components/EntryCards';
import { STATUSES } from '../types';
import { money, prettyDate, remaining } from '../utils/money';

type SortKey = 'date-desc' | 'date-asc' | 'due-desc' | 'deal-desc' | 'name-asc';

export default function Ledger() {
  const { entries, statusFilter, setStatusFilter, openDetails, openAddMoney, startProcessing } = useOutletContext<LayoutContext>();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<SortKey>('date-desc');

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let out = entries.filter((e) => {
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      if (!query) return true;
      return [e.client, e.service, e.reference, e.email, e.phone, e.notes, e.status]
        .some((f) => String(f ?? '').toLowerCase().includes(query));
    });

    const sorters: Record<SortKey, (a: typeof entries[number], b: typeof entries[number]) => number> = {
      'date-desc': (a, b) => b.date.localeCompare(a.date),
      'date-asc': (a, b) => a.date.localeCompare(b.date),
      'due-desc': (a, b) => remaining(b) - remaining(a),
      'deal-desc': (a, b) => b.deal - a.deal,
      'name-asc': (a, b) => a.client.localeCompare(b.client)
    };
    return out.sort(sorters[sort]);
  }, [entries, q, sort, statusFilter]);

  const printReport = () => {
    const rows = filtered.map((e) => `
      <tr>
        <td>${prettyDate(e.date)}</td><td>${e.client}</td><td>${e.service}</td><td>${e.status}</td>
        <td style="text-align:right">${money(e.deal)}</td>
        <td style="text-align:right">${money(remaining(e))}</td>
        <td>${e.reference || '—'}</td><td>${e.email || '—'}</td><td>${e.phone || '—'}</td>
      </tr>`).join('');

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Easy Tech Solution — report</title>
        <style>
          body{font-family:Arial,sans-serif;color:#111;padding:20px}
          table{width:100%;border-collapse:collapse;font-size:12px;margin-top:12px}
          th,td{border:1px solid #ccd3da;padding:6px 8px;text-align:left}
          th{background:#eef2f5}
        </style>
      </head><body>
        <h2>Easy Tech Solution — Client &amp; Payment Report</h2>
        <p>${filtered.length} entries · Printed ${prettyDate(new Date().toISOString().slice(0, 10))}</p>
        <table><thead><tr><th>Date</th><th>Client</th><th>Service</th><th>Status</th><th>Deal</th><th>Remaining</th><th>Reference</th><th>Email</th><th>Phone</th></tr></thead>
        <tbody>${rows}</tbody></table>
      </body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-line rounded-2xl shadow-soft">
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
          <label className="relative flex-1">
            <span className="sr-only">Search</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Search client, service, phone, reference or email"
              className="w-full px-3 py-2.5 rounded-xl bg-paper border border-line text-sm placeholder:text-muted focus:border-brand outline-none" />
          </label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="sm:w-48 px-3 py-2.5 rounded-xl bg-paper border border-line text-sm font-medium focus:border-brand outline-none">
            <option value="all">All statuses</option>
            {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.key}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}
            className="sm:w-48 px-3 py-2.5 rounded-xl bg-paper border border-line text-sm font-medium focus:border-brand outline-none">
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="due-desc">Biggest due first</option>
            <option value="deal-desc">Biggest deal first</option>
            <option value="name-asc">Client A–Z</option>
          </select>
          <button onClick={printReport} className="px-4 py-2.5 rounded-xl border border-line bg-card text-sm font-semibold whitespace-nowrap">
            Save as PDF
          </button>
        </div>
      </div>

      <SummaryCards entries={filtered} statusFilter={statusFilter} />
      <EntryTable entries={filtered} onDetails={openDetails} onAddMoney={openAddMoney} onStartProcessing={startProcessing} />
      <EntryCards entries={filtered} onDetails={openDetails} onAddMoney={openAddMoney} onStartProcessing={startProcessing} />

      {filtered.length === 0 && (
        <div className="bg-card border border-dashed border-line rounded-2xl p-10 text-center">
          <p className="font-bold">No entry matches this search</p>
          <p className="text-sm text-muted mt-1">Clear the search box or pick another status.</p>
          <button onClick={() => { setQ(''); setStatusFilter('all'); }} className="mt-4 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-bold">
            Show all entries
          </button>
        </div>
      )}
    </div>
  );
}
