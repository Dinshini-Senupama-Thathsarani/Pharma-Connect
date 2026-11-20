import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { clearPharmacyError, deletePharmacy, fetchPharmacies, savePharmacy } from '../features/pharmacies/pharmacySlice';
import { Icon } from '../components/icons';
import PageBanner from '../components/PageBanner';
import { ErrorBox, Field, Modal } from '../components/ui';
import { api } from '../services/api';
import { Pharmacy, PharmacyInput, UserRef } from '../types';

const empty: PharmacyInput = { name: '', licenseNo: '', address: '', city: '', phone: '', assignedMR: '' };

export default function Pharmacies() {
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.auth.user?.role);
  const { items, error } = useAppSelector((s) => s.pharmacies);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Pharmacy | null>(null);
  const [form, setForm] = useState<PharmacyInput | null>(null);
  const [mrs, setMrs] = useState<UserRef[]>([]);

  useEffect(() => { dispatch(clearPharmacyError()); dispatch(fetchPharmacies()); }, [dispatch]);
  useEffect(() => {
    if (role === 'admin') api.get('/users', { params: { role: 'mr' } }).then((r) => setMrs(r.data.data.map((u: { _id: string; name: string }) => ({ _id: u._id, name: u.name }))));
  }, [role]);

  const visible = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? items.filter((p) => [p.name, p.city, p.licenseNo].some((x) => x.toLowerCase().includes(t))) : items;
  }, [items, q]);

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
    <div className="space-y-6">
      <PageBanner
        image="pharmacies"
        eyebrow="Partner network"
        title="Pharmacies"
        subtitle={`${items.length} registered pharmac${items.length === 1 ? 'y' : 'ies'}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="input w-60 !pl-9" placeholder="Search name, city, license..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search pharmacies" />
            </div>
            {canAdd && <button className="btn-secondary" onClick={openNew}><Icon name="plus" className="h-4 w-4" />{role === 'pharmacy' ? 'Create my profile' : 'Add pharmacy'}</button>}
          </div>
        }
      />
      <ErrorBox message={error} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((p) => (
          <div key={p._id} className="card flex flex-col gap-3 transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-linear-to-br from-brand-400 to-accent-500 text-lg font-bold text-white">{p.name[0]?.toUpperCase()}</div>
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold leading-tight">{p.name}</div>
                <span className="mt-1 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{p.city}</span>
              </div>
            </div>
            <div className="space-y-1 text-sm text-slate-600">
              <div>{p.address}</div>
              <div className="text-slate-500">📞 {p.phone}</div>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-brand-100 pt-3 text-xs text-slate-500">
              <div><div>License: {p.licenseNo}</div><div>MR: {p.assignedMR?.name ?? 'Unassigned'}</div></div>
              <div className="flex gap-2">
                <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => openEdit(p)}>Edit</button>
                {role === 'admin' && <button className="btn-danger !px-3 !py-1.5 text-xs" onClick={() => remove(p)}>Delete</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
      {!visible.length && <div className="card text-center text-slate-500">No pharmacies found.</div>}

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
