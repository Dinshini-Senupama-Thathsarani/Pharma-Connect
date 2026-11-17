import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAppDispatch, useAppSelector } from '../app/store';
import { fetchStats } from '../features/orders/orderSlice';
import { errMsg, api } from '../services/api';
import { ErrorBox, money } from '../components/ui';

const Stat = ({ label, value, tone = 'text-slate-900' }: { label: string; value: string | number; tone?: string }) => (
  <div className="card"><div className="text-sm text-slate-500">{label}</div><div className={`mt-1 text-2xl font-bold ${tone}`}>{value}</div></div>
);

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

  if (!stats) return <p>Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        {user.role === 'admin' && (
          <div className="flex items-end gap-2">
            <label className="text-sm">Report month<input type="month" className="input mt-1" value={month} onChange={(e) => setMonth(e.target.value)} /></label>
            <button className="btn-primary" onClick={downloadReport}>Download PDF</button>
          </div>
        )}
      </div>
      <ErrorBox message={err} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total orders" value={stats.totalOrders} />
        <Stat label="Pending orders" value={stats.pendingOrders} tone="text-amber-600" />
        <Stat label="Sales (approved + delivered)" value={money(stats.revenue)} tone="text-teal-700" />
        <Stat label="Pharmacies" value={stats.pharmacies} />
        {user.role === 'admin' && <>
          <Stat label="Medicines" value={stats.medicines ?? 0} />
          <Stat label="Low stock" value={stats.lowStock ?? 0} tone="text-red-600" />
          <Stat label="Expiring in 90 days" value={stats.nearExpiry ?? 0} tone="text-orange-600" />
        </>}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="mb-3 font-semibold">Monthly sales (last 6 months)</h2>
          {stats.monthlySales.length ? (
            <div className="h-64"><ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlySales}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="sales" fill="#0d9488" radius={[4, 4, 0, 0]} /></BarChart>
            </ResponsiveContainer></div>
          ) : <p className="text-sm text-slate-500">No sales yet. Approve an order to see data here.</p>}
        </div>
        <div className="card">
          <h2 className="mb-3 font-semibold">Top medicines</h2>
          <ul className="space-y-2 text-sm">
            {stats.topMedicines.map((t) => <li key={t.name} className="flex justify-between"><span>{t.name}</span><span className="text-slate-500">{t.qty} units</span></li>)}
            {!stats.topMedicines.length && <li className="text-slate-500">No data yet</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
