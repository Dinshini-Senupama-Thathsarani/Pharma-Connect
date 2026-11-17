import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../app/store';
import { Role } from '../types';
import { ReactNode } from 'react';

export default function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const user = useAppSelector((s) => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
