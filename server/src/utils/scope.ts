import { QueryFilter, Types } from 'mongoose';
import { IOrder } from '../models/Order';
import { IPharmacy, Pharmacy } from '../models/Pharmacy';

type Caller = { id: string; role: 'admin' | 'mr' | 'pharmacy' };

// Which pharmacies can this user see?
export const pharmacyScope = (user: Caller): QueryFilter<IPharmacy> => {
  if (user.role === 'admin') return {};
  const id = new Types.ObjectId(user.id);
  return user.role === 'mr' ? { assignedMR: id } : { owner: id };
};

// Which orders can this user see?
export const orderScope = async (user: Caller): Promise<QueryFilter<IOrder>> => {
  if (user.role === 'admin') return {};
  const ids = (await Pharmacy.find(pharmacyScope(user)).select('_id')).map((p) => p._id);
  if (user.role === 'pharmacy') return { pharmacy: { $in: ids } };
  return { $or: [{ pharmacy: { $in: ids } }, { placedBy: new Types.ObjectId(user.id) }] };
};
