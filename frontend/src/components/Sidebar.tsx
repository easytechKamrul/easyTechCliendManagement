import { NavLink } from 'react-router-dom';
import { Entry, STATUSES } from '../types';
import { money, received, n } from '../utils/money';
import { useAuth } from '../context/AuthContext';

interface Props {
  entries: Entry[];
  statusFilter: string;
  onStatusFilter: (s: string) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const navClass = ({ isActive }: { isActive: boolean }) =>
  `w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold block ${
    isActive ? 'bg-white/10 text-white' : 'text-white/70'
  }`;

export default function Sidebar({ entries, statusFilter, onStatusFilter, theme, onThemeToggle }: Props) {
  const { logout } = useAuth();

  const activeEntries = entries.filter((e) => e.status !== 'Pending' && e.status !== 'Cancelled');
  const totalDeal = activeEntries.reduce((s, e) => s + n(e.deal), 0);
  const totalRecv = activeEntries.reduce((s, e) => s + received(e), 0);
  const pct = totalDeal ? Math.round((totalRecv / totalDeal) * 100) : 0;

  const items = [{ key: 'all', label: 'All entries' }, ...STATUSES.map((s) => ({ key: s.key, label: s.key }))];
  const counts: Record<string, number> = { all: entries.length };
  STATUSES.forEach((s) => (counts[s.key] = entries.filter((e) => e.status === s.key).length));

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-[264px] lg:h-screen lg:sticky lg:top-0 bg-ink text-white/85 shrink-0">
      <div className="px-6 py-6 border-b border-white/10 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-brand grid place-items-center font-extrabold text-white text-sm">ETS</div>
        <div>
          <p className="font-extrabold text-white leading-tight">Easy Tech Solution</p>
          <p className="text-xs text-white/55">Client &amp; payment ledger</p>
        </div>
      </div>

      <div className="p-4 space-y-1">
        <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
        <NavLink to="/ledger" className={navClass}>All entries</NavLink>
      </div>

      <div className="px-4 pb-2 pt-4 text-[11px] font-bold text-white/40">Filter by status</div>
      <nav className="px-4 space-y-1">
        {items.map((i) => {
          const on = statusFilter === i.key;
          return (
            <button
              key={i.key}
              onClick={() => onStatusFilter(i.key)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold ${
                on ? 'bg-white/10 text-white' : 'text-white/70'
              }`}
            >
              <span>{i.label}</span>
              <span className={`tnum text-xs ${on ? 'text-white' : 'text-white/45'}`}>{counts[i.key]}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-4 border-t border-white/10 space-y-2">
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-xs text-white/55">Collected so far</p>
          <p className="text-2xl font-extrabold text-white tnum">{money(totalRecv)}</p>
          <div className="mt-3 h-1.5 rounded-full bg-white/15 overflow-hidden">
            <div className="h-full bg-brand transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-xs text-white/55">{pct}% of all deal value</p>
        </div>
        <button onClick={onThemeToggle} className="w-full flex items-center justify-between text-sm text-white/70 px-3 py-2 rounded-lg">
          <span>Theme</span>
          <span className="text-xs font-bold">{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>
        <button onClick={logout} className="w-full text-left text-sm text-white/70 px-3 py-2 rounded-lg">
          Sign out
        </button>
      </div>
    </aside>
  );
}
