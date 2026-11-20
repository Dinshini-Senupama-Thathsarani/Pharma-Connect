import { Request, Response } from 'express';
import { Medicine } from '../models/Medicine';
import { Order } from '../models/Order';
import { Pharmacy } from '../models/Pharmacy';
import { orderScope, pharmacyScope } from '../utils/scope';

const REVENUE = ['approved', 'delivered'];

export const getStats = async (req: Request, res: Response) => {
  const user = req.user!;
  const scope = await orderScope(user);
  const since = new Date();
  since.setMonth(since.getMonth() - 5, 1);
  since.setHours(0, 0, 0, 0);

  const [totals, monthly, top, pharmacies] = await Promise.all([
    Order.aggregate([
      { $match: scope },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          revenue: { $sum: { $cond: [{ $in: ['$status', REVENUE] }, '$totalAmount', 0] } },
        },
      },
    ]),
    Order.aggregate([
      { $match: { ...scope, status: { $in: REVENUE }, createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, sales: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: { ...scope, status: { $in: REVENUE } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', qty: { $sum: '$items.qty' }, sales: { $sum: { $multiply: ['$items.qty', '$items.unitPrice'] } } } },
      { $sort: { qty: -1 } },
      { $limit: 5 },
    ]),
    Pharmacy.countDocuments(pharmacyScope(user)),
  ]);

  const stats: Record<string, unknown> = {
    totalOrders: totals[0]?.totalOrders ?? 0,
    pendingOrders: totals[0]?.pendingOrders ?? 0,
    revenue: totals[0]?.revenue ?? 0,
    pharmacies,
    monthlySales: Array.from({ length: 6 }, (_, index) => {
      const date = new Date(since);
      date.setMonth(since.getMonth() + index);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const data = monthly.find((item) => item._id === month);
      return { month, sales: data?.sales ?? 0, orders: data?.orders ?? 0 };
    }),
    topMedicines: top.map((t) => ({ name: t._id, qty: t.qty, sales: t.sales })),
  };

  if (user.role === 'admin') {
    const soon = new Date();
    soon.setDate(soon.getDate() + 90);
    const [medicines, lowStock, nearExpiry] = await Promise.all([
      Medicine.countDocuments(),
      Medicine.countDocuments({ $expr: { $lte: ['$stock', '$reorderLevel'] } }),
      Medicine.countDocuments({ expiryDate: { $lte: soon } }),
    ]);
    Object.assign(stats, { medicines, lowStock, nearExpiry });
  }
  res.json({ success: true, data: stats });
};
