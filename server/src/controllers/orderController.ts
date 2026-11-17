import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { Medicine } from '../models/Medicine';
import { IOrderItem, Order, OrderStatus } from '../models/Order';
import { Pharmacy } from '../models/Pharmacy';
import { HttpError } from '../utils/HttpError';
import { orderScope, pharmacyScope } from '../utils/scope';

export const createOrderSchema = z.object({
  pharmacy: z.string().optional(),
  items: z.array(z.object({ medicine: z.string(), qty: z.coerce.number().int().min(1) })).min(1),
});

export const statusSchema = z.object({ status: z.enum(['approved', 'rejected', 'delivered']) });

// Allowed status transitions (a tiny state machine)
const transitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ['approved', 'rejected'],
  approved: ['delivered'],
  rejected: [],
  delivered: [],
};

export const createOrder = async (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role === 'admin') throw new HttpError(403, 'Admins do not place orders');

  // Pharmacy users order for their own pharmacy; MRs order for one of their pharmacies
  const pharmacyFilter =
    user.role === 'pharmacy' ? pharmacyScope(user) : { _id: req.body.pharmacy, ...pharmacyScope(user) };
  const pharmacy = await Pharmacy.findOne(pharmacyFilter);
  if (!pharmacy) throw new HttpError(400, 'Pharmacy not found (create your pharmacy profile first)');

  const items: IOrderItem[] = [];
  for (const line of req.body.items as { medicine: string; qty: number }[]) {
    const med = await Medicine.findById(line.medicine);
    if (!med) throw new HttpError(400, 'Medicine not found');
    if (med.expiryDate < new Date()) throw new HttpError(400, `${med.name} is expired`);
    if (med.stock < line.qty) throw new HttpError(400, `Only ${med.stock} units of ${med.name} in stock`);
    items.push({ medicine: med._id as Types.ObjectId, name: med.name, qty: line.qty, unitPrice: med.price });
  }

  const totalAmount = items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
  const order = await Order.create({
    orderNo: `ORD-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`,
    pharmacy: pharmacy._id,
    placedBy: user.id,
    items,
    totalAmount,
  });
  res.status(201).json({ success: true, message: 'Order placed', data: order });
};

export const listOrders = async (req: Request, res: Response) => {
  const filter = await orderScope(req.user!);
  if (req.query.status) Object.assign(filter, { status: String(req.query.status) });
  const data = await Order.find(filter)
    .populate('pharmacy', 'name city')
    .populate('placedBy', 'name role')
    .sort('-createdAt');
  res.json({ success: true, data });
};

export const getOrder = async (req: Request, res: Response) => {
  const scope = await orderScope(req.user!);
  const order = await Order.findOne({ _id: req.params.id, ...scope })
    .populate('pharmacy', 'name city address phone')
    .populate('placedBy', 'name role');
  if (!order) throw new HttpError(404, 'Order not found');
  res.json({ success: true, data: order });
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const next = req.body.status as OrderStatus;
  const order = await Order.findById(req.params.id);
  if (!order) throw new HttpError(404, 'Order not found');
  if (!transitions[order.status].includes(next))
    throw new HttpError(400, `Cannot change status from ${order.status} to ${next}`);

  if (next === 'approved') {
    // Atomic stock deduction: the $gte condition makes the check + update one operation,
    // so two admins approving at the same time can never push stock below zero.
    const done: IOrderItem[] = [];
    for (const item of order.items) {
      const ok = await Medicine.findOneAndUpdate(
        { _id: item.medicine, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } }
      );
      if (!ok) {
        for (const d of done) await Medicine.findByIdAndUpdate(d.medicine, { $inc: { stock: d.qty } }); // rollback
        throw new HttpError(400, `Insufficient stock for ${item.name}`);
      }
      done.push(item);
    }
    order.approvedBy = new Types.ObjectId(req.user!.id);
  }

  order.status = next;
  await order.save();
  res.json({ success: true, message: `Order ${next}`, data: order });
};
