import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { changeOrderStatus, clearOrderError, fetchOrders } from '../features/orders/orderSlice';
import { Icon } from '../components/icons';
import PageBanner from '../components/PageBanner';
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
    <div className="space-y-6">
      <PageBanner
        image="orders"
        eyebrow="Order tracking"
        title="Orders"
        subtitle={role === 'admin' ? 'Review, approve and deliver incoming orders.' : 'Place new orders and follow their status.'}
        actions={role !== 'admin' ? <Link to="/orders/new" className="btn-secondary"><Icon name="plus" className="h-4 w-4" />New order</Link> : undefined}
      />
      <ErrorBox message={error} />

      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button key={s || 'all'} onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${filter === s ? 'bg-linear-to-r from-brand-600 to-accent-600 text-white shadow-md shadow-brand-600/25' : 'bg-white text-slate-600 ring-1 ring-brand-200 hover:bg-brand-50'}`}>
            {s || 'All orders'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {items.map((o) => (
          <div key={o._id} className="card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button className="text-left" onClick={() => setOpen(open === o._id ? null : o._id)}>
                <div className="font-semibold">{o.orderNo}</div>
                <div className="text-xs text-slate-500">{o.pharmacy?.name} · {new Date(o.createdAt).toLocaleDateString()} · by {o.placedBy?.name}</div>
              </button>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{money(o.totalAmount)}</span>
                <StatusBadge status={o.status} />
              </div>
            </div>
            {open === o._id && (
              <div className="mt-3 border-t border-brand-100 pt-3 text-sm">
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
        {!items.length && !loading && <div className="card text-center text-slate-500">No orders found.</div>}
      </div>
    </div>
  );
}
