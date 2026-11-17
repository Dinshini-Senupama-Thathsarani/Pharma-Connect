import { Router } from 'express';
import * as auth from '../controllers/authController';
import * as dash from '../controllers/dashboardController';
import * as med from '../controllers/medicineController';
import * as ord from '../controllers/orderController';
import * as ph from '../controllers/pharmacyController';
import * as report from '../controllers/reportController';
import { authorize, protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler as h } from '../utils/asyncHandler';

const router = Router();

// Auth
router.post('/auth/register', validate(auth.registerSchema), h(auth.register));
router.post('/auth/login', validate(auth.loginSchema), h(auth.login));
router.post('/auth/refresh', validate(auth.refreshSchema), h(auth.refresh));
router.post('/auth/logout', protect, h(auth.logout));
router.get('/auth/me', protect, h(auth.me));
router.get('/users', protect, authorize('admin'), h(auth.listUsers));

// Medicines
router.get('/medicines', protect, h(med.listMedicines));
router.get('/medicines/:id', protect, h(med.getMedicine));
router.post('/medicines', protect, authorize('admin'), validate(med.medicineSchema), h(med.createMedicine));
router.put('/medicines/:id', protect, authorize('admin'), validate(med.medicineSchema), h(med.updateMedicine));
router.delete('/medicines/:id', protect, authorize('admin'), h(med.deleteMedicine));

// Pharmacies
router.get('/pharmacies', protect, h(ph.listPharmacies));
router.get('/pharmacies/:id', protect, h(ph.getPharmacy));
router.post('/pharmacies', protect, validate(ph.pharmacySchema), h(ph.createPharmacy));
router.put('/pharmacies/:id', protect, validate(ph.pharmacySchema), h(ph.updatePharmacy));
router.delete('/pharmacies/:id', protect, authorize('admin'), h(ph.deletePharmacy));

// Orders
router.get('/orders', protect, h(ord.listOrders));
router.get('/orders/:id', protect, h(ord.getOrder));
router.post('/orders', protect, authorize('mr', 'pharmacy'), validate(ord.createOrderSchema), h(ord.createOrder));
router.patch('/orders/:id/status', protect, authorize('admin'), validate(ord.statusSchema), h(ord.updateOrderStatus));

// Dashboard & reports
router.get('/dashboard/stats', protect, h(dash.getStats));
router.get('/reports/monthly-sales', protect, authorize('admin'), h(report.monthlySalesReport));

export default router;
