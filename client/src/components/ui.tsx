import { ReactNode } from 'react';
import { OrderStatus } from '../types';

const colors: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export const StatusBadge = ({ status }: { status: OrderStatus }) => (
  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colors[status]}`}>{status}</span>
);

export const ErrorBox = ({ message }: { message: string | null }) =>
  message ? <div role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</div> : null;

export const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label={title}>
    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-800" aria-label="Close">✕</button>
      </div>
      {children}
    </div>
  </div>
);

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block"><span className="label">{label}</span>{children}</label>
);

export const money = (n: number) => `Rs. ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
