import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Medicines from './pages/Medicines';
import NewOrder from './pages/NewOrder';
import Orders from './pages/Orders';
import Pharmacies from './pages/Pharmacies';
import Register from './pages/Register';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/pharmacies" element={<Pharmacies />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/new" element={<ProtectedRoute roles={['mr', 'pharmacy']}><NewOrder /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
