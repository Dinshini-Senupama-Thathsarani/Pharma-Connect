import { connectDB } from './config/db';
import { assertEnv } from './config/env';
import { Medicine } from './models/Medicine';
import { User } from './models/User';

(async () => {
  assertEnv();
  await connectDB();

  if (!(await User.exists({ role: 'admin' }))) {
    await User.create({ name: 'Company Admin', email: 'admin@pharmaconnect.lk', password: 'Admin@123', role: 'admin' });
    console.log('Admin created: admin@pharmaconnect.lk / Admin@123');
  }

  if ((await Medicine.countDocuments()) === 0) {
    const year = new Date().getFullYear();
    await Medicine.insertMany([
      { name: 'Paracetamol 500mg', genericName: 'Paracetamol', category: 'Analgesic', price: 5, stock: 500, batchNo: 'PC-001', expiryDate: new Date(year + 2, 5, 1) },
      { name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', category: 'Antibiotic', price: 18, stock: 300, batchNo: 'AM-014', expiryDate: new Date(year + 1, 8, 1) },
      { name: 'Cetirizine 10mg', genericName: 'Cetirizine', category: 'Antihistamine', price: 8, stock: 8, batchNo: 'CT-102', expiryDate: new Date(year + 1, 2, 1) },
      { name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Gastro', price: 22, stock: 200, batchNo: 'OM-077', expiryDate: new Date(year, 11, 31) },
      { name: 'Metformin 500mg', genericName: 'Metformin', category: 'Antidiabetic', price: 12, stock: 400, batchNo: 'MF-330', expiryDate: new Date(year + 2, 0, 1) },
    ]);
    console.log('Sample medicines inserted');
  }
  process.exit(0);
})();
