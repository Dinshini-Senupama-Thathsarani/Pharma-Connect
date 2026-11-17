export type Role = 'admin' | 'mr' | 'pharmacy';
export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'delivered';

export interface User { id: string; name: string; email: string; role: Role }
export interface UserRef { _id: string; name: string; email?: string }

export interface Medicine {
  _id: string; name: string; genericName?: string; category: string; price: number;
  stock: number; batchNo: string; expiryDate: string; reorderLevel: number;
}
export type MedicineInput = Omit<Medicine, '_id'>;

export interface Pharmacy {
  _id: string; name: string; licenseNo: string; address: string; city: string; phone: string;
  owner?: UserRef; assignedMR?: UserRef;
}
export interface PharmacyInput {
  name: string; licenseNo: string; address: string; city: string; phone: string; assignedMR?: string;
}

export interface OrderItem { medicine: string; name: string; qty: number; unitPrice: number }
export interface Order {
  _id: string; orderNo: string; status: OrderStatus; totalAmount: number; createdAt: string;
  items: OrderItem[]; pharmacy: { _id: string; name: string; city: string };
  placedBy: { _id: string; name: string; role: Role };
}

export interface DashboardStats {
  totalOrders: number; pendingOrders: number; revenue: number; pharmacies: number;
  monthlySales: { month: string; sales: number; orders: number }[];
  topMedicines: { name: string; qty: number; sales: number }[];
  medicines?: number; lowStock?: number; nearExpiry?: number;
}

export interface ApiError { message: string }
