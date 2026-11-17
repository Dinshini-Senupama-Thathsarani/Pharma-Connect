import { Document, Schema, Types, model } from 'mongoose';

export interface IPharmacy extends Document {
  name: string;
  licenseNo: string;
  address: string;
  city: string;
  phone: string;
  owner?: Types.ObjectId;
  assignedMR?: Types.ObjectId;
}

const pharmacySchema = new Schema<IPharmacy>(
  {
    name: { type: String, required: true, trim: true },
    licenseNo: { type: String, required: true, unique: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    assignedMR: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  },
  { timestamps: true }
);

export const Pharmacy = model<IPharmacy>('Pharmacy', pharmacySchema);
