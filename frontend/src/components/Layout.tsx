import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import AddEditModal from './AddEditModal';
import DetailsModal from './DetailsModal';
import QuickPayModal from './QuickPayModal';
import { useEntries } from '../hooks/useEntries';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Entry, EntryInput } from '../types';

export interface LayoutContext {
  entries: Entry[];
  loading: boolean;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  openAdd: () => void;
  openDetails: (e: Entry) => void;
  openAddMoney: (e: Entry) => void;
  startProcessing: (e: Entry) => Promise<void>;
}

export default function Layout() {
  const { entries, loading, createEntry, updateEntry, deleteEntry, addPayment } = useEntries();
  const { logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [statusFilter, setStatusFilter] = useState('all');
  const [editEntry, setEditEntry] = useState<Entry | null>(null);
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [detailsEntry, setDetailsEntry] = useState<Entry | null>(null);
  const [payEntry, setPayEntry] = useState<Entry | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    localStorage.getItem('ets-theme') === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('ets-theme', theme);
  }, [theme]);

  const services = useMemo(() => [...new Set(entries.map((e) => e.service))], [entries]);

  const openAdd = () => { setEditEntry(null); setShowAddEdit(true); };
  const openEdit = (e: Entry) => { setEditEntry(e); setShowAddEdit(true); setDetailsEntry(null); };
  const openDetails = (e: Entry) => setDetailsEntry(e);
  const openAddMoney = (e: Entry) => { setDetailsEntry(null); setPayEntry(e); };

  const handleSave = async (data: EntryInput, id?: string) => {
    if (id) {
      const updated = await updateEntry(id, data);
      toast(updated.status === 'Complete' ? 'Saved — due cleared, marked complete' : 'Entry updated');
    } else {
      await createEntry(data);
      toast('Entry added');
    }
  };

  const handleDelete = async (id: string) => { await deleteEntry(id); toast('Entry deleted'); };

  const handleQuickPay = async (id: string, date: string, amount: number) => {
    const updated = await addPayment(id, { date, amount });
    toast(updated.status === 'Complete' ? `${amount} received — due cleared, marked complete` : `${amount} received`);
  };

  const startProcessing = async (entry: Entry) => {
    const updated = await updateEntry(entry._id, { status: 'Progress' });
    setDetailsEntry((current) => current?._id === updated._id ? updated : current);
    toast('Work started — status changed to Progress');
  };

  const title = location.pathname.startsWith('/ledger') ? 'All entries' : 'Dashboard';

  const ctx: LayoutContext = { entries, loading, statusFilter, setStatusFilter, openAdd, openDetails, openAddMoney, startProcessing };

  return (
    <div className="lg:flex min-h-screen">
      <Sidebar
        entries={entries}
        statusFilter={statusFilter}
        onStatusFilter={(s) => { setStatusFilter(s); navigate('/ledger'); }}
        theme={theme}
        onThemeToggle={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}
      />

      <main className="flex-1 min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-ink text-white" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-brand grid place-items-center font-extrabold text-sm">ETS</div>
            <div className="min-w-0">
              <p className="font-extrabold leading-tight truncate">Easy Tech Solution</p>
              <p className="text-[11px] text-white/55">Client &amp; payment ledger</p>
            </div>
            <button onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')} className="ml-auto text-xs text-white/70 px-2 py-1 rounded-md">
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>
            <button onClick={logout} className="text-xs text-white/70 px-2 py-1 rounded-md">Sign out</button>
          </div>
          <div className="px-4 pb-3 flex gap-2">
            <button onClick={() => navigate('/dashboard')} className={`flex-1 py-2 rounded-lg text-sm font-bold ${title === 'Dashboard' ? 'bg-brand text-white' : 'bg-white/10 text-white/70'}`}>Dashboard</button>
            <button onClick={() => navigate('/ledger')} className={`flex-1 py-2 rounded-lg text-sm font-bold ${title === 'All entries' ? 'bg-brand text-white' : 'bg-white/10 text-white/70'}`}>All entries</button>
          </div>
        </header>

        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1500px] mx-auto space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">{title}</h1>
              <p className="text-sm text-muted mt-1">{loading ? 'Loading…' : `${entries.length} entries on the book`}</p>
            </div>
            <button onClick={openAdd} className="px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-bold shadow-soft">
              Add entry
            </button>
          </div>

          <Outlet context={ctx} />

          <p className="text-xs text-muted pb-4">
            Amounts in GBP. Received = advance + later payments. When an active client clears the full due, the entry is marked complete automatically.
          </p>
        </div>
      </main>

      <AddEditModal
        entry={editEntry}
        open={showAddEdit}
        services={services}
        onClose={() => setShowAddEdit(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
      <DetailsModal entry={detailsEntry} onClose={() => setDetailsEntry(null)} onEdit={openEdit} onAddMoney={openAddMoney} onStartProcessing={startProcessing} />
      <QuickPayModal entry={payEntry} onClose={() => setPayEntry(null)} onSave={handleQuickPay} />
    </div>
  );
}
