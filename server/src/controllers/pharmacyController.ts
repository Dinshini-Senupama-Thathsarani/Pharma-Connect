import { Request, Response } from 'express';
import { z } from 'zod';
import { Pharmacy } from '../models/Pharmacy';
import { HttpError } from '../utils/HttpError';
import { pharmacyScope } from '../utils/scope';

export const pharmacySchema = z.object({
  name: z.string().min(2),
  licenseNo: z.string().min(2),
  address: z.string().min(3),
  city: z.string().min(2),
  phone: z.string().min(7),
  owner: z.string().optional(),
  assignedMR: z.string().optional(),
});

export const listPharmacies = async (req: Request, res: Response) => {
  const data = await Pharmacy.find(pharmacyScope(req.user!))
    .populate('assignedMR', 'name email')
    .populate('owner', 'name email')
    .sort('name');
  res.json({ success: true, data });
};

export const getPharmacy = async (req: Request, res: Response) => {
  const ph = await Pharmacy.findOne({ _id: req.params.id, ...pharmacyScope(req.user!) })
    .populate('assignedMR', 'name email')
    .populate('owner', 'name email');
  if (!ph) throw new HttpError(404, 'Pharmacy not found');
  res.json({ success: true, data: ph });
};

export const createPharmacy = async (req: Request, res: Response) => {
  const { role, id } = req.user!;
  const body = { ...req.body };
  if (role === 'pharmacy') {
    if (await Pharmacy.exists({ owner: id })) throw new HttpError(409, 'You already have a pharmacy profile');
    body.owner = id;
    delete body.assignedMR;
  } else if (role === 'mr') {
    body.assignedMR = id; // an MR can only register pharmacies under themselves
  }
  const ph = await Pharmacy.create(body);
  res.status(201).json({ success: true, message: 'Pharmacy created', data: ph });
};

export const updatePharmacy = async (req: Request, res: Response) => {
  const body = { ...req.body };
  if (req.user!.role !== 'admin') {
    delete body.owner; // only admin can reassign ownership / MR
    delete body.assignedMR;
  }
  const ph = await Pharmacy.findOneAndUpdate({ _id: req.params.id, ...pharmacyScope(req.user!) }, body, {
    new: true,
    runValidators: true,
  });
  if (!ph) throw new HttpError(404, 'Pharmacy not found');
  res.json({ success: true, message: 'Pharmacy updated', data: ph });
};

export const deletePharmacy = async (req: Request, res: Response) => {
  const ph = await Pharmacy.findByIdAndDelete(req.params.id);
  if (!ph) throw new HttpError(404, 'Pharmacy not found');
  res.json({ success: true, message: 'Pharmacy deleted' });
};
