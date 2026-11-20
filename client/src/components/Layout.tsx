import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { logout } from '../features/auth/authSlice';
import { Role } from '../types';
import { Icon, IconName } from './icons';
import { Logo } from './Logo';

const links: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/medicines', label: 'Medicines', icon: 'pill' },
  { to: '/pharmacies', label: 'Pharmacies', icon: 'store' },
  { to: '/orders', label: 'Orders', icon: 'orders' },
];

const roleLabel: Record<Role, string> = { admin: 'Company Admin', mr: 'Medical Rep', pharmacy: 'Pharmacy' };

export default function Layout() {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false); // mobile menu
  const [profile, setProfile] = useState(false); // avatar dropdown

  const onLogout = async () => { await dispatch(logout()); navigate('/login'); };
  const initials = (user?.name ?? '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const pill = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-linear-to-r from-brand-600 to-accent-600 text-white shadow-md shadow-brand-600/25'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <div className="app-bg min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10" />
            <div className="leading-none">
              <div className="text-lg font-extrabold tracking-tight text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>PharmaConnect</div>
              <div className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600 sm:block">Distribution</div>
            </div>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 rounded-full bg-slate-100/70 p-1 ring-1 ring-slate-200/70 lg:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} className={pill}>
                <Icon name={l.icon} className="h-4 w-4" />{l.label}
              </NavLink>
            ))}
          </nav>

          {/* Profile + mobile toggle */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setProfile(!profile)} className="flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 shadow-sm ring-1 ring-slate-200 transition hover:ring-brand-300" aria-label="Account menu">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-linear-to-br from-brand-400 to-accent-600 text-xs font-bold text-white">{initials}</span>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block text-sm font-semibold text-slate-800">{user?.name}</span>
                  <span className="block text-[11px] text-slate-500">{user && roleLabel[user.role]}</span>
                </span>
              </button>
              {profile && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfile(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-60 rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-slate-900/5">
                    <div className="px-3 py-2">
                      <div className="truncate text-sm font-semibold">{user?.name}</div>
                      <div className="truncate text-xs text-slate-500">{user?.email}</div>
                      <span className="mt-2 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700">{user && roleLabel[user.role]}</span>
                    </div>
                    <button onClick={onLogout} className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50">
                      <Icon name="logout" className="h-4 w-4" />Log out
                    </button>
                  </div>
                </>
              )}
            </div>
            <button className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 lg:hidden" onClick={() => setMenu(!menu)} aria-label="Toggle menu">
              <Icon name={menu ? 'close' : 'menu'} />
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {menu && (
          <nav className="space-y-1 border-t border-slate-200/70 bg-white/95 p-3 lg:hidden" onClick={() => setMenu(false)}>
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} className={pill}>
                <Icon name={l.icon} className="h-4 w-4" />{l.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-7xl p-4 md:p-8"><Outlet /></main>
    </div>
  );
}
