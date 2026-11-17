import { Request, Response } from 'express';
import { QueryFilter } from 'mongoose';
import { z } from 'zod';
import { IMedicine, Medicine } from '../models/Medicine';
import { HttpError } from '../utils/HttpError';

export const medicineSchema = z.object({
  name: z.string().min(2),
  genericName: z.string().optional(),
  category: z.string().min(2),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  batchNo: z.string().min(1),
  expiryDate: z.coerce.date(),
  reorderLevel: z.coerce.number().int().min(0).default(10),
});

export const listMedicines = async (req: Request, res: Response) => {
  const { q, category, lowStock, page = '1', limit = '50' } = req.query as Record<string, string>;
  const filter: QueryFilter<IMedicine> = {};
  if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { genericName: new RegExp(q, 'i') }];
  if (category) filter.category = category;
  if (lowStock === 'true') filter.$expr = { $lte: ['$stock', '$reorderLevel'] };

  const p = Math.max(1, Number(page));
  const l = Math.min(100, Math.max(1, Number(limit)));
  const [items, total] = await Promise.all([
    Medicine.find(filter).sort('name').skip((p - 1) * l).limit(l),
    Medicine.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) } });
};

export const getMedicine = async (req: Request, res: Response) => {
  const med = await Medicine.findById(req.params.id);
  if (!med) throw new HttpError(404, 'Medicine not found');
  res.json({ success: true, data: med });
};

export const createMedicine = async (req: Request, res: Response) => {
  const med = await Medicine.create(req.body);
  res.status(201).json({ success: true, message: 'Medicine created', data: med });
};

export const updateMedicine = async (req: Request, res: Response) => {
  const med = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!med) throw new HttpError(404, 'Medicine not found');
  res.json({ success: true, message: 'Medicine updated', data: med });
};

export const deleteMedicine = async (req: Request, res: Response) => {
  const med = await Medicine.findByIdAndDelete(req.params.id);
  if (!med) throw new HttpError(404, 'Medicine not found');
  res.json({ success: true, message: 'Medicine deleted' });
};
