import { Document, Schema, Types, model } from 'mongoose';

export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'delivered';

export interface IOrderItem {
  medicine: Types.ObjectId;
  name: string; // snapshot, so history survives medicine edits/deletes
  qty: number;
  unitPrice: number;
}

export interface IOrder extends Document {
  orderNo: string;
  pharmacy: Types.ObjectId;
  placedBy: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  approvedBy?: Types.ObjectId;
  createdAt: Date;
}

const itemSchema = new Schema<IOrderItem>(
  {
    medicine: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNo: { type: String, required: true, unique: true },
    pharmacy: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true, index: true },
    placedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [itemSchema], validate: (v: unknown[]) => v.length > 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'delivered'], default: 'pending', index: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Order = model<IOrder>('Order', orderSchema);
