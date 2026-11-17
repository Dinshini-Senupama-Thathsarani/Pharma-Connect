import { Document, Schema, model } from 'mongoose';

export interface IMedicine extends Document {
  name: string;
  genericName?: string;
  category: string;
  price: number;
  stock: number;
  batchNo: string;
  expiryDate: Date;
  reorderLevel: number;
}

const medicineSchema = new Schema<IMedicine>(
  {
    name: { type: String, required: true, trim: true },
    genericName: { type: String, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    batchNo: { type: String, required: true, trim: true },
    expiryDate: { type: Date, required: true, index: true },
    reorderLevel: { type: Number, default: 10, min: 0 },
  },
  { timestamps: true }
);

medicineSchema.index({ name: 'text', genericName: 'text' });

export const Medicine = model<IMedicine>('Medicine', medicineSchema);
