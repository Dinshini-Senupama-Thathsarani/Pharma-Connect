import { FormEvent, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { clearMedicineError, deleteMedicine, fetchMedicines, saveMedicine } from '../features/medicines/medicineSlice';
import { ErrorBox, Field, Modal, money } from '../components/ui';
import { Medicine, MedicineInput } from '../types';

const empty: MedicineInput = { name: '', genericName: '', category: '', price: 0, stock: 0, batchNo: '', expiryDate: '', reorderLevel: 10 };

export default function Medicines() {
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector((s) => s.auth.user?.role) === 'admin';
  const { items, loading, error } = useAppSelector((s) => s.medicines);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [form, setForm] = useState<MedicineInput | null>(null);

  useEffect(() => {
    dispatch(clearMedicineError());
    const t = setTimeout(() => dispatch(fetchMedicines(q || undefined)), 300); // debounce search
    return () => clearTimeout(t);
  }, [q, dispatch]);

  const openNew = () => { setEditing(null); setForm(empty); };
  const openEdit = (m: Medicine) => { setEditing(m); setForm({ ...m, expiryDate: m.expiryDate.slice(0, 10) }); };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const res = await dispatch(saveMedicine({ id: editing?._id, data: form }));
    if (saveMedicine.fulfilled.match(res)) setForm(null);
  };
  const remove = (m: Medicine) => { if (confirm(`Delete ${m.name}?`)) dispatch(deleteMedicine(m._id)); };
  const set = <K extends keyof MedicineInput>(k: K, v: MedicineInput[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const soon = Date.now() + 90 * 86400000;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Medicine catalog</h1>
        <div className="flex gap-2">
          <input className="input w-56" placeholder="Search name or generic..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search medicines" />
          {isAdmin && <button className="btn-primary" onClick={openNew}>+ Add</button>}
        </div>
      </div>
      <ErrorBox message={error} />
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600"><tr>
            {['Name', 'Category', 'Price', 'Stock', 'Batch', 'Expiry', ''].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}
          </tr></thead>
          <tbody>
            {items.map((m) => {
              const low = m.stock <= m.reorderLevel;
              const expiring = new Date(m.expiryDate).getTime() < soon;
              return (
                <tr key={m._id} className="border-t">
                  <td className="px-4 py-3"><div className="font-medium">{m.name}</div><div className="text-xs text-slate-500">{m.genericName}</div></td>
                  <td className="px-4 py-3">{m.category}</td>
                  <td className="px-4 py-3">{money(m.price)}</td>
                  <td className={`px-4 py-3 ${low ? 'font-semibold text-red-600' : ''}`}>{m.stock}{low && ' (low)'}</td>
                  <td className="px-4 py-3">{m.batchNo}</td>
                  <td className={`px-4 py-3 ${expiring ? 'font-semibold text-orange-600' : ''}`}>{m.expiryDate.slice(0, 10)}</td>
                  <td className="space-x-2 px-4 py-3 text-right whitespace-nowrap">
                    {isAdmin && <><button className="btn-secondary" onClick={() => openEdit(m)}>Edit</button><button className="btn-danger" onClick={() => remove(m)}>Delete</button></>}
                  </td>
                </tr>
              );
            })}
            {!items.length && !loading && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">No medicines found</td></tr>}
          </tbody>
        </table>
      </div>

      {form && (
        <Modal title={editing ? 'Edit medicine' : 'Add medicine'} onClose={() => setForm(null)}>
          <form onSubmit={submit} className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Field label="Name"><input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} /></Field></div>
            <Field label="Generic name"><input className="input" value={form.genericName ?? ''} onChange={(e) => set('genericName', e.target.value)} /></Field>
            <Field label="Category"><input className="input" required value={form.category} onChange={(e) => set('category', e.target.value)} /></Field>
            <Field label="Price (Rs.)"><input className="input" type="number" min={0} step="0.01" required value={form.price} onChange={(e) => set('price', Number(e.target.value))} /></Field>
            <Field label="Stock"><input className="input" type="number" min={0} required value={form.stock} onChange={(e) => set('stock', Number(e.target.value))} /></Field>
            <Field label="Batch no."><input className="input" required value={form.batchNo} onChange={(e) => set('batchNo', e.target.value)} /></Field>
            <Field label="Expiry date"><input className="input" type="date" required value={form.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} /></Field>
            <Field label="Reorder level"><input className="input" type="number" min={0} value={form.reorderLevel} onChange={(e) => set('reorderLevel', Number(e.target.value))} /></Field>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setForm(null)}>Cancel</button>
              <button className="btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
