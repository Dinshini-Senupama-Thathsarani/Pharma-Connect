import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { logout } from '../features/auth/authSlice';
import { Role } from '../types';

const links: { to: string; label: string; roles: Role[] }[] = [
  { to: '/', label: 'Dashboard', roles: ['admin', 'mr', 'pharmacy'] },
  { to: '/medicines', label: 'Medicines', roles: ['admin', 'mr', 'pharmacy'] },
  { to: '/pharmacies', label: 'Pharmacies', roles: ['admin', 'mr', 'pharmacy'] },
  { to: '/orders', label: 'Orders', roles: ['admin', 'mr', 'pharmacy'] },
];

export default function Layout() {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const onLogout = async () => { await dispatch(logout()); navigate('/login'); };
  const cls = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-teal-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`;

  return (
    <div className="min-h-screen md:flex">
      <header className="flex items-center justify-between border-b bg-white px-4 py-3 md:hidden">
        <span className="font-bold text-teal-700">PharmaConnect</span>
        <button className="btn-secondary" onClick={() => setOpen(!open)} aria-label="Toggle menu">☰</button>
      </header>
      <aside className={`${open ? 'block' : 'hidden'} w-full border-r bg-white p-4 md:block md:w-60 md:shrink-0`}>
        <div className="mb-6 hidden text-xl font-bold text-teal-700 md:block">💊 PharmaConnect</div>
        <nav className="space-y-1" onClick={() => setOpen(false)}>
          {links.filter((l) => user && l.roles.includes(user.role)).map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={cls}>{l.label}</NavLink>
          ))}
        </nav>
        <div className="mt-6 border-t pt-4 text-sm">
          <div className="font-medium">{user?.name}</div>
          <div className="mb-3 text-xs uppercase tracking-wide text-slate-500">{user?.role}</div>
          <button className="btn-secondary w-full" onClick={onLogout}>Log out</button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8"><Outlet /></main>
    </div>
  );
}
