import { EntryStatus, STATUSES } from '../types';

export default function StatusBadge({ status }: { status: EntryStatus }) {
  const s = STATUSES.find((x) => x.key === status) ?? STATUSES[STATUSES.length - 1];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${s.badgeClass}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.key}
    </span>
  );
}
