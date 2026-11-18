import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { logout } from '../features/auth/authSlice';
import { Role } from '../types';
import { Icon, IconName } from './icons';

const links: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/medicines', label: 'Medicines', icon: 'pill' },
  { to: '/pharmacies', label: 'Pharmacies', icon: 'store' },
  { to: '/orders', label: 'Orders', icon: 'orders' },
];

const roleLabel: Record<Role, string> = { admin: 'Company Admin', mr: 'Medical Rep', pharmacy: 'Pharmacy' };

const Brand = () => (
  <div className="flex items-center gap-3">
    <div className="grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br from-teal-300 to-cyan-500 text-white shadow-lg shadow-teal-500/30">
      <Icon name="pill" className="h-5 w-5" />
    </div>
    <div>
      <div className="font-display text-lg font-extrabold leading-none tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>PharmaConnect</div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-teal-200/70">Distribution</div>
    </div>
  </div>
);

export default function Layout() {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const onLogout = async () => { await dispatch(logout()); navigate('/login'); };
  const initials = (user?.name ?? '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const cls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
      isActive ? 'bg-white/12 text-white shadow-inner ring-1 ring-white/15' : 'text-slate-300 hover:bg-white/6 hover:text-white'
    }`;

  return (
    <div className="app-bg min-h-screen lg:flex">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-slate-900 px-4 py-3 lg:hidden">
        <Brand />
        <button className="rounded-lg p-2 text-white hover:bg-white/10" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <Icon name={open ? 'close' : 'menu'} />
        </button>
      </header>

      <aside className={`${open ? 'block' : 'hidden'} sidebar lg:sticky lg:top-0 lg:block lg:h-screen lg:w-64 lg:shrink-0`}>
        <div className="flex h-full flex-col justify-between p-4 lg:p-5">
          <div>
            <div className="mb-8 hidden lg:block"><Brand /></div>
            <div className="mb-2 px-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Menu</div>
            <nav className="space-y-1" onClick={() => setOpen(false)}>
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.to === '/'} className={cls}>
                  <Icon name={l.icon} className="h-[18px] w-[18px]" />{l.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="mt-8 rounded-2xl bg-white/6 p-3 ring-1 ring-white/10">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-linear-to-br from-teal-300 to-cyan-500 text-sm font-bold text-slate-900">{initials}</div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">{user?.name}</div>
                <div className="text-xs text-teal-200/70">{user && roleLabel[user.role]}</div>
              </div>
            </div>
            <button onClick={onLogout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/15">
              <Icon name="logout" className="h-4 w-4" />Log out
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="hidden items-center justify-between px-8 pt-6 lg:flex">
          <div className="text-sm text-slate-500">{today}</div>
          <div className="flex items-center gap-2 rounded-full bg-white/80 py-1.5 pl-1.5 pr-4 text-sm shadow-sm ring-1 ring-slate-200">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-linear-to-br from-teal-400 to-cyan-500 text-xs font-bold text-white">{initials}</span>
            <span className="font-medium text-slate-700">{user?.name}</span>
          </div>
        </div>
        <div className="p-4 md:p-8"><Outlet /></div>
      </main>
    </div>
  );
}
