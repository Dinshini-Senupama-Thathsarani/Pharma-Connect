import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FALLBACK_GRADIENT, imageLayers } from '../utils/images';
import { Logo } from './Logo';


export default function AuthShell({ title, subtitle, children, footer, nav }: {
  title: string; subtitle: string; children: ReactNode; footer: ReactNode; nav: { to: string; label: string };
}) {
  
  const bg = ['linear-gradient(180deg, rgba(40,8,28,.35), rgba(40,8,28,.5))', ...imageLayers('login-bg'), FALLBACK_GRADIENT].join(', ');
  return (
    <div className="auth-screen relative flex min-h-screen flex-col" style={{ backgroundImage: bg }}>
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3 text-white">
          <Logo className="h-11 w-11" />
          <span className="text-xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>PharmaConnect</span>
        </div>
        <Link to={nav.to} className="rounded-full border border-white/40 bg-white/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20">
          {nav.label}
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-10">
        <div className="glass w-full max-w-md rounded-3xl p-8 text-white sm:p-10">
          <div className="mb-7 text-center">
            <h1 className="text-3xl font-extrabold">{title}</h1>
            <p className="mt-2 text-sm text-white/75">{subtitle}</p>
          </div>
          {children}
        </div>
      </main>

      <footer className="relative z-10 pb-7 text-center text-sm text-white/80">{footer}</footer>
    </div>
  );
}
