import { Request, Response } from 'express';
import Entry, { applyAutoStatus, ENTRY_STATUSES } from '../models/Entry';
import { asyncHandler } from '../middleware/errorHandler';
import { sendWhatsAppNotification } from '../services/whatsAppService';

// GET /api/entries
export const getEntries = asyncHandler(async (_req: Request, res: Response) => {
  const entries = await Entry.find().sort({ date: -1, createdAt: -1 });
  res.json(entries);
});

// POST /api/entries
export const createEntry = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;
  if (!body.client || !body.client.trim()) {
    return res.status(400).json({ message: 'Client name is required' });
  }
  if (body.status && !ENTRY_STATUSES.includes(body.status)) {
    return res.status(400).json({ message: 'Invalid entry status' });
  }

  const dealVal = Number(body.deal) || 0;
  const advanceVal = Number(body.advance) || 0;
  const paymentsArr = Array.isArray(body.payments) ? body.payments : [];

  const entry = new Entry({
    date: body.date,
    client: body.client.trim(),
    service: (body.service || 'Not set').trim(),
    status: body.status || 'Progress',
    deal: dealVal,
    advance: advanceVal,
    payments: paymentsArr,
    commission: Number(body.commission) || 0,
    reference: body.reference || '',
    email: body.email || '',
    phone: body.phone || '',
    notes: body.notes || '',
    startedDate: body.status === 'Progress' ? new Date().toISOString().slice(0, 10) : undefined
  });

  await entry.save(); // pre('save') hook applies the auto-complete rule

  await sendWhatsAppNotification(entry, 'created');

  res.status(201).json(entry);
});

// PUT /api/entries/:id
export const updateEntry = asyncHandler(async (req: Request, res: Response) => {
  const entry = await Entry.findById(req.params.id);
  if (!entry) return res.status(404).json({ message: 'Entry not found' });

  const body = req.body;
  if (body.status !== undefined && !ENTRY_STATUSES.includes(body.status)) {
    return res.status(400).json({ message: 'Invalid entry status' });
  }

  // পুরানো মানগুলো সংরক্ষণ করে রাখছি তুলনা করার জন্য
  const oldStatus = entry.status;
  const oldDeal = entry.deal;
  const oldService = entry.service;

  // ফিল্ডগুলো আপডেট করা
  if (body.date !== undefined) entry.date = body.date;
  if (body.client !== undefined) entry.client = body.client.trim();
  if (body.service !== undefined) entry.service = body.service.trim();
  
  if (body.status !== undefined) {
    const wasPending = entry.status === 'Pending';
    entry.status = body.status;
    if (wasPending && entry.status === 'Progress' && !entry.startedDate) {
      entry.startedDate = new Date().toISOString().slice(0, 10);
    }
  }
  if (body.deal !== undefined) entry.deal = Number(body.deal) || 0;
  if (body.advance !== undefined) entry.advance = Number(body.advance) || 0;
  if (body.payments !== undefined) entry.payments = body.payments;
  if (body.commission !== undefined) entry.commission = Number(body.commission) || 0;
  if (body.reference !== undefined) entry.reference = body.reference;
  if (body.email !== undefined) entry.email = body.email;
  if (body.phone !== undefined) entry.phone = body.phone;
  if (body.notes !== undefined) entry.notes = body.notes;

  await entry.save(); // re-applies the auto-complete rule

  // চেক করা হচ্ছে স্ট্যাটাস অথবা ডিল অ্যামাউন্ট অথবা সার্ভিস পরিবর্তন হয়েছে কিনা
  const hasStatusChanged = body.status !== undefined && oldStatus !== entry.status;
  const hasDealChanged = body.deal !== undefined && oldDeal !== entry.deal;
  const hasServiceChanged = body.service !== undefined && oldService !== entry.service;

  if (hasStatusChanged || hasDealChanged || hasServiceChanged) {
    await sendWhatsAppNotification(entry, 'updated');
  }

  res.json(entry);
});
// DELETE /api/entries/:id
export const deleteEntry = asyncHandler(async (req: Request, res: Response) => {
  const entry = await Entry.findByIdAndDelete(req.params.id);
  if (!entry) return res.status(404).json({ message: 'Entry not found' });
  res.json({ message: 'Deleted', id: req.params.id });
});
// POST /api/entries/:id/payments   { date, amount }
export const addPayment = asyncHandler(async (req: Request, res: Response) => {
  const { date, amount } = req.body as { date?: string; amount?: number };
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ message: 'Enter a payment amount greater than zero' });
  }

  const entry = await Entry.findById(req.params.id);
  if (!entry) return res.status(404).json({ message: 'Entry not found' });

  const paidAmountNum = Number(amount);
  entry.payments.push({ date: date || new Date().toISOString().slice(0, 10), amount: paidAmountNum });
  entry.status = applyAutoStatus(entry) as typeof entry.status;
  await entry.save();

  await sendWhatsAppNotification(entry, 'payment_received', paidAmountNum);

  res.json(entry);
});
