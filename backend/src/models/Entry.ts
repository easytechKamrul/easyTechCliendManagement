import { Schema, model, Document } from 'mongoose';

export type EntryStatus = 'Complete' | 'Progress' | 'Due Later' | 'Pending' | 'Cancelled';

export const ENTRY_STATUSES: EntryStatus[] = ['Complete', 'Progress', 'Due Later', 'Pending', 'Cancelled'];

export interface IPayment {
  date: string;    // ISO date (yyyy-mm-dd)
  amount: number;
}

export interface IEntry extends Document {
  date: string;
  client: string;
  service: string;
  status: EntryStatus;
  deal: number;
  advance: number;
  payments: IPayment[];
  commission: number;
  reference?: string;
  email?: string;
  phone?: string;
  notes?: string;
  startedDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    date: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const entrySchema = new Schema<IEntry>(
  {
    date: { type: String, required: true },
    client: { type: String, required: true, trim: true },
    service: { type: String, required: true, trim: true },
    status: { type: String, enum: ENTRY_STATUSES, default: 'Progress' },
    deal: { type: Number, required: true, min: 0, default: 0 },
    advance: { type: Number, min: 0, default: 0 },
    payments: { type: [paymentSchema], default: [] },
    commission: { type: Number, min: 0, default: 0 },
    reference: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    notes: { type: String, default: '', trim: true },
    startedDate: { type: String, trim: true }
  },
  { timestamps: true }
);

/**
 * Keeps status in sync with the remaining due whenever a document is saved directly
 * (created, or edited and .save()'d). Controllers that use findByIdAndUpdate call this
 * same logic manually — see entryController.ts — since update queries skip document
 * middleware by default.
 */
export function applyAutoStatus(doc: { deal: number; advance: number; payments: IPayment[]; status: EntryStatus }) {
  // Pending jobs are future/on-hold work. A payment must not automatically move
  // them into the active/completed workflow; staff changes the status manually.
  if (doc.status === 'Cancelled' || doc.status === 'Pending') return doc.status;
  const received = doc.advance + doc.payments.reduce((s, p) => s + p.amount, 0);
  const remaining = Math.max(0, doc.deal - received);
  if (doc.deal > 0 && remaining === 0) return 'Complete';
  if (doc.status === 'Complete' && remaining > 0) return 'Due Later';
  return doc.status;
}

entrySchema.pre('save', function (next) {
  this.status = applyAutoStatus(this) as EntryStatus;
  next();
});

export default model<IEntry>('Entry', entrySchema);
