import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { changeOrderStatus, clearOrderError, fetchOrders } from '../features/orders/orderSlice';
import { ErrorBox, StatusBadge, money } from '../components/ui';
import { OrderStatus } from '../types';

const statuses: (OrderStatus | '')[] = ['', 'pending', 'approved', 'delivered', 'rejected'];

export default function Orders() {
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.auth.user?.role);
  const { items, loading, error } = useAppSelector((s) => s.orders);
  const [filter, setFilter] = useState<OrderStatus | ''>('');
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => { dispatch(clearOrderError()); dispatch(fetchOrders(filter || undefined)); }, [filter, dispatch]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex gap-2">
          <select className="input w-40" value={filter} onChange={(e) => setFilter(e.target.value as OrderStatus | '')} aria-label="Filter by status">
            {statuses.map((s) => <option key={s} value={s}>{s ? s[0].toUpperCase() + s.slice(1) : 'All statuses'}</option>)}
          </select>
          {role !== 'admin' && <Link to="/orders/new" className="btn-primary whitespace-nowrap">+ New order</Link>}
        </div>
      </div>
      <ErrorBox message={error} />
      <div className="space-y-3">
        {items.map((o) => (
          <div key={o._id} className="card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button className="text-left" onClick={() => setOpen(open === o._id ? null : o._id)}>
                <div className="font-semibold">{o.orderNo}</div>
                <div className="text-xs text-slate-500">{o.pharmacy?.name} · {new Date(o.createdAt).toLocaleDateString()} · by {o.placedBy?.name}</div>
              </button>
              <div className="flex items-center gap-3">
                <span className="font-medium">{money(o.totalAmount)}</span>
                <StatusBadge status={o.status} />
              </div>
            </div>
            {open === o._id && (
              <div className="mt-3 border-t pt-3 text-sm">
                <table className="w-full"><tbody>
                  {o.items.map((i) => (
                    <tr key={i.medicine}><td className="py-1">{i.name}</td><td>{i.qty} × {money(i.unitPrice)}</td><td className="text-right">{money(i.qty * i.unitPrice)}</td></tr>
                  ))}
                </tbody></table>
              </div>
            )}
            {role === 'admin' && (o.status === 'pending' || o.status === 'approved') && (
              <div className="mt-3 flex gap-2">
                {o.status === 'pending' && <>
                  <button className="btn-primary" onClick={() => dispatch(changeOrderStatus({ id: o._id, status: 'approved' }))}>Approve</button>
                  <button className="btn-danger" onClick={() => dispatch(changeOrderStatus({ id: o._id, status: 'rejected' }))}>Reject</button>
                </>}
                {o.status === 'approved' && <button className="btn-primary" onClick={() => dispatch(changeOrderStatus({ id: o._id, status: 'delivered' }))}>Mark delivered</button>}
              </div>
            )}
          </div>
        ))}
        {!items.length && !loading && <p className="text-slate-500">No orders found.</p>}
      </div>
    </div>
  );
}
