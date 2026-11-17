import { FormEvent, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { clearPharmacyError, deletePharmacy, fetchPharmacies, savePharmacy } from '../features/pharmacies/pharmacySlice';
import { ErrorBox, Field, Modal } from '../components/ui';
import { api } from '../services/api';
import { Pharmacy, PharmacyInput, UserRef } from '../types';

const empty: PharmacyInput = { name: '', licenseNo: '', address: '', city: '', phone: '', assignedMR: '' };

export default function Pharmacies() {
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.auth.user?.role);
  const { items, error } = useAppSelector((s) => s.pharmacies);
  const [editing, setEditing] = useState<Pharmacy | null>(null);
  const [form, setForm] = useState<PharmacyInput | null>(null);
  const [mrs, setMrs] = useState<UserRef[]>([]);

  useEffect(() => { dispatch(clearPharmacyError()); dispatch(fetchPharmacies()); }, [dispatch]);
  useEffect(() => {
    if (role === 'admin') api.get('/users', { params: { role: 'mr' } }).then((r) => setMrs(r.data.data.map((u: { _id: string; name: string }) => ({ _id: u._id, name: u.name }))));
  }, [role]);

  // A pharmacy user may only have one pharmacy profile
  const canAdd = role !== 'pharmacy' || items.length === 0;

  const openNew = () => { setEditing(null); setForm(empty); };
  const openEdit = (p: Pharmacy) => {
    setEditing(p);
    setForm({ name: p.name, licenseNo: p.licenseNo, address: p.address, city: p.city, phone: p.phone, assignedMR: p.assignedMR?._id ?? '' });
  };
  const set = <K extends keyof PharmacyInput>(k: K, v: PharmacyInput[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const data = { ...form };
    if (!data.assignedMR) delete data.assignedMR;
    const res = await dispatch(savePharmacy({ id: editing?._id, data }));
    if (savePharmacy.fulfilled.match(res)) setForm(null);
  };
  const remove = (p: Pharmacy) => { if (confirm(`Delete ${p.name}?`)) dispatch(deletePharmacy(p._id)); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pharmacies</h1>
        {canAdd && <button className="btn-primary" onClick={openNew}>{role === 'pharmacy' ? 'Create my pharmacy profile' : '+ Add'}</button>}
      </div>
      <ErrorBox message={error} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((p) => (
          <div key={p._id} className="card space-y-1 text-sm">
            <div className="text-lg font-semibold">{p.name}</div>
            <div className="text-slate-600">{p.address}, {p.city}</div>
            <div>📞 {p.phone}</div>
            <div className="text-xs text-slate-500">License: {p.licenseNo}</div>
            <div className="text-xs text-slate-500">MR: {p.assignedMR?.name ?? 'Unassigned'}</div>
            <div className="flex gap-2 pt-2">
              <button className="btn-secondary" onClick={() => openEdit(p)}>Edit</button>
              {role === 'admin' && <button className="btn-danger" onClick={() => remove(p)}>Delete</button>}
            </div>
          </div>
        ))}
        {!items.length && <p className="text-slate-500">No pharmacies yet.</p>}
      </div>

      {form && (
        <Modal title={editing ? 'Edit pharmacy' : 'New pharmacy'} onClose={() => setForm(null)}>
          <form onSubmit={submit} className="space-y-3">
            <Field label="Pharmacy name"><input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
            <Field label="License no."><input className="input" required value={form.licenseNo} onChange={(e) => set('licenseNo', e.target.value)} /></Field>
            <Field label="Address"><input className="input" required value={form.address} onChange={(e) => set('address', e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City"><input className="input" required value={form.city} onChange={(e) => set('city', e.target.value)} /></Field>
              <Field label="Phone"><input className="input" required minLength={7} value={form.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
            </div>
            {role === 'admin' && (
              <Field label="Assigned MR">
                <select className="input" value={form.assignedMR} onChange={(e) => set('assignedMR', e.target.value)}>
                  <option value="">Unassigned</option>
                  {mrs.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
              </Field>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setForm(null)}>Cancel</button>
              <button className="btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
