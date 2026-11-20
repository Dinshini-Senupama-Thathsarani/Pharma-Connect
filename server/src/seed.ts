import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { assertEnv } from './config/env';
import { Medicine } from './models/Medicine';
import { Order } from './models/Order';
import { Pharmacy } from './models/Pharmacy';
import { User } from './models/User';

const year = new Date().getFullYear();
const d = (yearsAhead: number, month: number) => new Date(year + yearsAhead, month, 1);
const demoPassword = 'Demo@123';

const users = [
  { name: 'Company Admin', email: 'admin@pharmaconnect.lk', role: 'admin' as const },
  { name: 'Nimal Perera', email: 'nimal.mr@pharmaconnect.lk', role: 'mr' as const },
  { name: 'Kavindu Silva', email: 'kavindu.mr@pharmaconnect.lk', role: 'mr' as const },
  { name: 'Sahan Fernando', email: 'sahan.mr@pharmaconnect.lk', role: 'mr' as const },
  { name: 'Tharushi Jayawardena', email: 'tharushi.mr@pharmaconnect.lk', role: 'mr' as const },
  { name: 'Amaya Pharmacy', email: 'amaya.pharmacy@pharmaconnect.lk', role: 'pharmacy' as const },
  { name: 'Lakeside Pharmacy', email: 'lakeside.pharmacy@pharmaconnect.lk', role: 'pharmacy' as const },
  { name: 'Hilltop Pharmacy', email: 'hilltop.pharmacy@pharmaconnect.lk', role: 'pharmacy' as const },
  { name: 'Wellness Pharmacy', email: 'wellness.pharmacy@pharmaconnect.lk', role: 'pharmacy' as const },
  { name: 'New Town Pharmacy', email: 'newtown.pharmacy@pharmaconnect.lk', role: 'pharmacy' as const },
];

const medicines = [
  { name: 'Paracetamol 500mg', genericName: 'Paracetamol', category: 'Analgesic', price: 5, stock: 500, batchNo: 'PC-001', expiryDate: d(2, 5) },
  { name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', category: 'Antibiotic', price: 18, stock: 300, batchNo: 'AM-014', expiryDate: d(1, 8) },
  { name: 'Cetirizine 10mg', genericName: 'Cetirizine', category: 'Antihistamine', price: 8, stock: 8, batchNo: 'CT-102', expiryDate: d(1, 2) },
  { name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Gastro', price: 22, stock: 200, batchNo: 'OM-077', expiryDate: d(0, 11) },
  { name: 'Metformin 500mg', genericName: 'Metformin', category: 'Antidiabetic', price: 12, stock: 400, batchNo: 'MF-330', expiryDate: d(2, 0) },
  { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'Analgesic', price: 9, stock: 350, batchNo: 'IB-210', expiryDate: d(2, 3) },
  { name: 'Azithromycin 500mg', genericName: 'Azithromycin', category: 'Antibiotic', price: 65, stock: 120, batchNo: 'AZ-045', expiryDate: d(1, 10) },
  { name: 'Amlodipine 5mg', genericName: 'Amlodipine', category: 'Cardiovascular', price: 14, stock: 260, batchNo: 'AL-502', expiryDate: d(2, 7) },
  { name: 'Atorvastatin 20mg', genericName: 'Atorvastatin', category: 'Cardiovascular', price: 28, stock: 15, batchNo: 'AT-318', expiryDate: d(1, 6) },
  { name: 'Losartan 50mg', genericName: 'Losartan', category: 'Cardiovascular', price: 20, stock: 180, batchNo: 'LS-640', expiryDate: d(2, 1) },
];

const pharmacies = [
  { name: 'City Care Pharmacy', licenseNo: 'PH-2026-001', address: '45 Main Street', city: 'Negombo', phone: '0312222001' },
  { name: 'Lanka Health Pharmacy', licenseNo: 'PH-2026-002', address: '12 Galle Road', city: 'Colombo', phone: '0112345602' },
  { name: 'Green Cross Pharmacy', licenseNo: 'PH-2026-003', address: '8 Temple Road', city: 'Kandy', phone: '0812223003' },
  { name: 'MediPlus Pharmacy', licenseNo: 'PH-2026-004', address: '101 High Level Road', city: 'Nugegoda', phone: '0112811004' },
  { name: 'Sunrise Pharmacy', licenseNo: 'PH-2026-005', address: '27 Beach Road', city: 'Galle', phone: '0912234005' },
  { name: 'Family Chemist', licenseNo: 'PH-2026-006', address: '66 Kandy Road', city: 'Kurunegala', phone: '0372224006' },
  { name: 'Amaya Pharmacy', licenseNo: 'PH-2026-007', address: '19 Station Road', city: 'Matara', phone: '0412222007' },
  { name: 'Lakeside Pharmacy', licenseNo: 'PH-2026-008', address: '33 Lake View Road', city: 'Anuradhapura', phone: '0252222008' },
  { name: 'Hilltop Pharmacy', licenseNo: 'PH-2026-009', address: '5 Peradeniya Road', city: 'Kandy', phone: '0812222009' },
  { name: 'Wellness Pharmacy', licenseNo: 'PH-2026-010', address: '72 Station Road', city: 'Jaffna', phone: '0212222010' },
];

const seed = async (): Promise<void> => {
  assertEnv();
  await connectDB();

  try {
    for (const user of users) {
      if (!(await User.exists({ email: user.email }))) {
        await User.create({ ...user, password: demoPassword });
      }
    }

    const seededUsers = await User.find({ email: { $in: users.map((user) => user.email) } });
    const usersByEmail = new Map(seededUsers.map((user) => [user.email, user]));
    const medicalReps = users.filter((user) => user.role === 'mr').map((user) => usersByEmail.get(user.email)!);
    const pharmacyUsers = users.filter((user) => user.role === 'pharmacy').map((user) => usersByEmail.get(user.email)!);
    const admin = usersByEmail.get('admin@pharmaconnect.lk')!;

    // Safe to run many times: only inserts what is missing, never overwrites existing data.
    for (const medicine of medicines) {
      await Medicine.updateOne({ name: medicine.name }, { $setOnInsert: medicine }, { upsert: true });
    }

    for (let i = 0; i < pharmacies.length; i += 1) {
      const pharmacy = pharmacies[i];
      await Pharmacy.updateOne(
        { licenseNo: pharmacy.licenseNo },
        {
          $setOnInsert: {
            ...pharmacy,
            owner: pharmacyUsers[i % pharmacyUsers.length]._id,
            assignedMR: medicalReps[i % medicalReps.length]._id,
          },
        },
        { upsert: true }
      );
    }

    const seededPharmacies = await Pharmacy.find({ licenseNo: { $in: pharmacies.map((pharmacy) => pharmacy.licenseNo) } });
    const pharmaciesByLicense = new Map(seededPharmacies.map((pharmacy) => [pharmacy.licenseNo, pharmacy]));
    const seededMedicines = await Medicine.find({ name: { $in: medicines.map((medicine) => medicine.name) } });
    const medicinesByName = new Map(seededMedicines.map((medicine) => [medicine.name, medicine]));

    const now = new Date();
    for (let i = 0; i < 10; i += 1) {
      const pharmacyData = pharmacies[i];
      const pharmacy = pharmaciesByLicense.get(pharmacyData.licenseNo)!;
      const medicineData = medicines[i % medicines.length];
      const medicine = medicinesByName.get(medicineData.name)!;
      const quantity = 8 + i * 3;
      const status = i < 2 ? 'approved' as const : 'delivered' as const;
      const soldAt = new Date(now.getFullYear(), now.getMonth() - (i % 6), 3 + (i % 20), 10, 30);

      await Order.updateOne(
        { orderNo: `ORD-SEED-${String(i + 1).padStart(3, '0')}` },
        {
          $set: {
            orderNo: `ORD-SEED-${String(i + 1).padStart(3, '0')}`,
            pharmacy: pharmacy._id,
            placedBy: pharmacyUsers[i % pharmacyUsers.length]._id,
            items: [{ medicine: medicine._id, name: medicine.name, qty: quantity, unitPrice: medicine.price }],
            totalAmount: quantity * medicine.price,
            status,
            createdAt: soldAt,
            updatedAt: soldAt,
          },
        },
        { upsert: true }
      );
    }

    console.log(`Seed ready: ${users.length} demo users, ${medicines.length} medicines, ${pharmacies.length} pharmacies, 10 orders.`);
    console.log(`Demo login password for newly created users: ${demoPassword}`);
    console.log(`Admin login: ${admin.email}`);
  } finally {
    await mongoose.disconnect();
  }
};

seed().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
