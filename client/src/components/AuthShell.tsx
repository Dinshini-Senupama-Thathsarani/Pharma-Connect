import { ReactNode } from 'react';
import { Icon, IconName } from './icons';

const features: { icon: IconName; title: string; text: string }[] = [
  { icon: 'package', title: 'Order management', text: 'Place, approve and track orders end to end' },
  { icon: 'alert', title: 'Stock & expiry control', text: 'Batch tracking with low-stock and expiry alerts' },
  { icon: 'trending', title: 'Sales analytics', text: 'Live dashboards and monthly PDF reports' },
  { icon: 'shield', title: 'Secure by design', text: 'JWT authentication with role-based access' },
];

export default function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.1fr_1fr]">
      <section className="auth-hero relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur"><Icon name="pill" className="h-6 w-6" /></div>
          <span className="text-xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>PharmaConnect</span>
        </div>

        <div className="max-w-xl">
          <h2 className="text-4xl font-extrabold leading-tight xl:text-5xl">Connecting companies, representatives and pharmacies.</h2>
          <p className="mt-4 text-lg text-teal-50/85">One platform for medicine distribution, from the first order to the final delivery.</p>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur-md">
                <div className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-white/15"><Icon name={f.icon} className="h-5 w-5" /></div>
                <div className="font-semibold">{f.title}</div>
                <div className="mt-1 text-sm text-teal-50/75">{f.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-sm text-teal-50/60">© {new Date().getFullYear()} PharmaConnect · Pharmaceutical Distribution Platform</div>
      </section>

      <section className="app-bg flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br from-teal-400 to-cyan-600 text-white shadow-lg shadow-teal-500/30"><Icon name="pill" /></div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>PharmaConnect</span>
          </div>
          <div className="card p-7 sm:p-9">
            <h1 className="text-3xl font-extrabold text-slate-900">{title}</h1>
            <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </div>
          <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>
        </div>
      </section>
    </div>
  );
}
