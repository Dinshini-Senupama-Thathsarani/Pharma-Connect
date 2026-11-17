import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { Order } from '../models/Order';
import { HttpError } from '../utils/HttpError';

// GET /api/reports/monthly-sales?month=YYYY-MM  -> streams a PDF
export const monthlySalesReport = async (req: Request, res: Response) => {
  const now = new Date();
  const month = String(req.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new HttpError(400, 'month must be YYYY-MM');

  const [y, m] = month.split('-').map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);
  const orders = await Order.find({ status: { $in: ['approved', 'delivered'] }, createdAt: { $gte: start, $lt: end } })
    .populate('pharmacy', 'name')
    .sort('createdAt');

  const total = orders.reduce((s, o) => s + o.totalAmount, 0);
  const byMedicine = new Map<string, { qty: number; sales: number }>();
  orders.forEach((o) =>
    o.items.forEach((i) => {
      const cur = byMedicine.get(i.name) ?? { qty: 0, sales: 0 };
      byMedicine.set(i.name, { qty: cur.qty + i.qty, sales: cur.sales + i.qty * i.unitPrice });
    })
  );

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="sales-report-${month}.pdf"`);

  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(res);

  doc.fontSize(20).text('PharmaConnect - Monthly Sales Report');
  doc.fontSize(11).fillColor('#555').text(`Period: ${month}    Generated: ${now.toLocaleString()}`).moveDown();
  doc.fillColor('#000').fontSize(12).text(`Orders: ${orders.length}     Total sales: Rs. ${total.toFixed(2)}`).moveDown();

  doc.fontSize(14).text('Top medicines').moveDown(0.3);
  doc.fontSize(10);
  [...byMedicine.entries()]
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 10)
    .forEach(([name, v]) => doc.text(`${name} - ${v.qty} units - Rs. ${v.sales.toFixed(2)}`));
  doc.moveDown();

  doc.fontSize(14).text('Orders').moveDown(0.3);
  doc.fontSize(10);
  orders.forEach((o) => {
    if (doc.y > 760) doc.addPage();
    const ph = (o.pharmacy as unknown as { name?: string })?.name ?? '-';
    doc.text(`${o.orderNo} | ${ph} | ${o.createdAt.toISOString().slice(0, 10)} | ${o.status} | Rs. ${o.totalAmount.toFixed(2)}`);
  });
  if (!orders.length) doc.text('No sales recorded for this month.');
  doc.end();
};
