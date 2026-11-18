import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAppDispatch, useAppSelector } from '../app/store';
import { fetchStats } from '../features/orders/orderSlice';
import { api, errMsg } from '../services/api';
import { Icon, IconName } from '../components/icons';
import { ErrorBox, money } from '../components/ui';

const tones = {
  teal: 'bg-teal-50 text-teal-600', amber: 'bg-amber-50 text-amber-600', sky: 'bg-sky-50 text-sky-600',
  red: 'bg-red-50 text-red-600', orange: 'bg-orange-50 text-orange-600', violet: 'bg-violet-50 text-violet-600',
};

const Stat = ({ label, value, icon, tone }: { label: string; value: string | number; icon: IconName; tone: keyof typeof tones }) => (
  <div className="card flex items-center gap-4 transition hover:-translate-y-0.5 hover:shadow-lg">
    <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${tones[tone]}`}><Icon name={icon} className="h-6 w-6" /></div>
    <div className="min-w-0">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="truncate text-2xl font-bold tracking-tight text-slate-900">{value}</div>
    </div>
  </div>
);

const monthLabel = (m: string) => new Date(`${m}-01`).toLocaleDateString(undefined, { month: 'short', year: '2-digit' });

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user)!;
  const stats = useAppSelector((s) => s.orders.stats);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchStats()); }, [dispatch]);

  // Authenticated download: fetch the PDF as a blob (so the JWT header is sent) then save it
  const downloadReport = async () => {
    try {
      setErr(null);
      const res = await api.get('/reports/monthly-sales', { params: { month }, responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = `sales-report-${month}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { setErr(errMsg(e)); }
  };

  if (!stats) return <div className="card text-slate-500">Loading dashboard...</div>;

  const isAdmin = user.role === 'admin';
  const maxQty = Math.max(1, ...stats.topMedicines.map((t) => t.qty));
  const chart = stats.monthlySales.map((m) => ({ ...m, label: monthLabel(m.month) }));
  const subtitle = isAdmin
    ? stats.pendingOrders > 0 ? `${stats.pendingOrders} order${stats.pendingOrders > 1 ? 's' : ''} waiting for your approval.` : 'Everything is up to date. No orders waiting for approval.'
    : 'Here is how your orders are doing.';

  return (
    <div className="space-y-6">
      <div className="banner relative overflow-hidden rounded-3xl p-6 text-white shadow-xl shadow-teal-900/10 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-medium text-teal-100/90">Welcome back</p>
            <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">{user.name}</h1>
            <p className="mt-2 text-teal-50/85">
              {subtitle}{' '}
              {isAdmin && stats.pendingOrders > 0 && <Link to="/orders" className="font-semibold underline underline-offset-4">Review orders</Link>}
            </p>
          </div>
          {isAdmin && (
            <div className="flex items-end gap-2 rounded-2xl bg-white/12 p-3 ring-1 ring-white/20 backdrop-blur">
              <label className="text-xs font-medium text-teal-50">Report month
                <input type="month" className="input mt-1 !py-2 text-slate-800" value={month} onChange={(e) => setMonth(e.target.value)} />
              </label>
              <button className="btn-secondary !py-2.5" onClick={downloadReport}><Icon name="download" className="h-4 w-4" />PDF</button>
            </div>
          )}
        </div>
      </div>
      <ErrorBox message={err} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total orders" value={stats.totalOrders} icon="orders" tone="sky" />
        <Stat label="Pending orders" value={stats.pendingOrders} icon="clock" tone="amber" />
        <Stat label="Sales (approved + delivered)" value={money(stats.revenue)} icon="wallet" tone="teal" />
        <Stat label="Pharmacies" value={stats.pharmacies} icon="store" tone="violet" />
      </div>
      {isAdmin && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Medicines in catalog" value={stats.medicines ?? 0} icon="pill" tone="teal" />
          <Stat label="Low stock" value={stats.lowStock ?? 0} icon="alert" tone="red" />
          <Stat label="Expiring in 90 days" value={stats.nearExpiry ?? 0} icon="clock" tone="orange" />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Monthly sales</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">Last 6 months</span>
          </div>
          {chart.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" /><stop offset="100%" stopColor="#0891b2" stopOpacity={0.75} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'rgba(20,184,166,.08)' }} formatter={(v) => money(Number(v))} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(15,23,42,.08)' }} />
                  <Bar dataKey="sales" name="Sales" fill="url(#salesGrad)" radius={[10, 10, 0, 0]} maxBarSize={64} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="grid h-72 place-items-center rounded-xl border border-dashed border-slate-200 text-center text-sm text-slate-500">
              <div><Icon name="chart" className="mx-auto mb-2 h-8 w-8 text-slate-300" />No sales yet. Approve an order to see data here.</div>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-bold">Top medicines</h2>
          <ul className="space-y-4">
            {stats.topMedicines.map((t, i) => (
              <li key={t.name}>
                <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-teal-50 text-xs font-bold text-teal-700">{i + 1}</span>
                    <span className="truncate font-medium">{t.name}</span>
                  </span>
                  <span className="shrink-0 text-slate-500">{t.qty} units</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full" style={{ width: `${(t.qty / maxQty) * 100}%`, backgroundImage: 'linear-gradient(90deg,#14b8a6,#0891b2)' }} />
                </div>
              </li>
            ))}
            {!stats.topMedicines.length && <li className="text-sm text-slate-500">No data yet</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
