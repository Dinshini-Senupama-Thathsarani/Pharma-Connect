import { ReactNode } from 'react';
import { OrderStatus } from '../types';
import { Icon } from './icons';

const colors: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  approved: 'bg-sky-50 text-sky-700 ring-sky-200',
  delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rejected: 'bg-red-50 text-red-700 ring-red-200',
};
const dots: Record<OrderStatus, string> = {
  pending: 'bg-amber-500', approved: 'bg-sky-500', delivered: 'bg-emerald-500', rejected: 'bg-red-500',
};

export const StatusBadge = ({ status }: { status: OrderStatus }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${colors[status]}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />{status}
  </span>
);

export const ErrorBox = ({ message }: { message: string | null }) =>
  message ? (
    <div role="alert" className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />{message}
    </div>
  ) : null;

export const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title}>
    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Close">
          <Icon name="close" className="h-5 w-5" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block"><span className="label">{label}</span>{children}</label>
);

export const money = (n: number) => `Rs. ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
