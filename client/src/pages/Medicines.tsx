import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { clearMedicineError, deleteMedicine, fetchMedicines, saveMedicine } from '../features/medicines/medicineSlice';
import { Icon } from '../components/icons';
import PageBanner from '../components/PageBanner';
import { ErrorBox, Field, Modal, money } from '../components/ui';
import { Medicine, MedicineInput } from '../types';

const empty: MedicineInput = { name: '', genericName: '', category: '', price: 0, stock: 0, batchNo: '', expiryDate: '', reorderLevel: 10 };

type Filter = 'all' | 'low' | 'expiring' | 'expired';
type Sort = 'name' | 'price' | 'stock' | 'expiry';
type View = 'grid' | 'list';

const daysLeft = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
const isLow = (m: Medicine) => m.stock <= m.reorderLevel;
const isExpiring = (m: Medicine) => { const n = daysLeft(m.expiryDate); return n >= 0 && n <= 90; };
const isExpired = (m: Medicine) => daysLeft(m.expiryDate) < 0;

function expiryBadge(d: string) {
  const n = daysLeft(d);
  if (n < 0) return { label: 'Expired', cls: 'bg-red-50 text-red-700 ring-red-200' };
  if (n <= 90) return { label: `Expires in ${n}d`, cls: 'bg-orange-50 text-orange-700 ring-orange-200' };
  return { label: `Exp ${d.slice(0, 10)}`, cls: 'bg-slate-50 text-slate-600 ring-slate-200' };
}

const sorters: Record<Sort, (a: Medicine, b: Medicine) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  price: (a, b) => a.price - b.price,
  stock: (a, b) => a.stock - b.stock,
  expiry: (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime(),
};

export default function Medicines() {
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector((s) => s.auth.user?.role) === 'admin';
  const { items, loading, error } = useAppSelector((s) => s.medicines);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('name');
  const [view, setView] = useState<View>('grid');
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [form, setForm] = useState<MedicineInput | null>(null);

  useEffect(() => {
    dispatch(clearMedicineError());
    const t = setTimeout(() => dispatch(fetchMedicines(q || undefined)), 300); // debounce search
    return () => clearTimeout(t);
  }, [q, dispatch]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map((m) => m.category))).sort()], [items]);
  const counts = useMemo(() => ({
    all: items.length, low: items.filter(isLow).length, expiring: items.filter(isExpiring).length, expired: items.filter(isExpired).length,
  }), [items]);

  const visible = useMemo(() => {
    let list = items.filter((m) => category === 'All' || m.category === category);
    if (filter === 'low') list = list.filter(isLow);
    if (filter === 'expiring') list = list.filter(isExpiring);
    if (filter === 'expired') list = list.filter(isExpired);
    return [...list].sort(sorters[sort]);
  }, [items, category, filter, sort]);

  const openNew = () => { setEditing(null); setForm(empty); };
  const openEdit = (m: Medicine) => { setEditing(m); setForm({ ...m, expiryDate: m.expiryDate.slice(0, 10) }); };
  const set = <K extends keyof MedicineInput>(k: K, v: MedicineInput[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const remove = (m: Medicine) => { if (confirm(`Delete ${m.name}?`)) dispatch(deleteMedicine(m._id)); };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const res = await dispatch(saveMedicine({ id: editing?._id, data: form }));
    if (saveMedicine.fulfilled.match(res)) setForm(null);
  };

  const tabs: { key: Filter; label: string; tone: string }[] = [
    { key: 'all', label: 'All medicines', tone: 'text-brand-700' },
    { key: 'low', label: 'Low stock', tone: 'text-red-600' },
    { key: 'expiring', label: 'Expiring soon', tone: 'text-orange-600' },
    { key: 'expired', label: 'Expired', tone: 'text-red-700' },
  ];

  const AdminActions = ({ m }: { m: Medicine }) => isAdmin ? (
    <div className="flex gap-2">
      <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => openEdit(m)}>Edit</button>
      <button className="btn-danger !px-3 !py-1.5 text-xs" onClick={() => remove(m)}>Delete</button>
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      <PageBanner
        image="medicines"
        eyebrow="Product catalog"
        title="Medicine catalog"
        subtitle={`${counts.all} medicines across ${categories.length - 1} categories`}
        actions={
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="input w-64 !pl-9" placeholder="Search name or generic..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search medicines" />
            </div>
            {isAdmin && <button className="btn-secondary" onClick={openNew}><Icon name="plus" className="h-4 w-4" />Add medicine</button>}
          </div>
        }
      />
      <ErrorBox message={error} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`card text-left transition hover:-translate-y-0.5 ${filter === t.key ? 'ring-2 ring-brand-400' : ''}`}>
            <div className="text-sm text-slate-500">{t.label}</div>
            <div className={`text-2xl font-bold ${t.tone}`}>{counts[t.key]}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${category === c ? 'bg-linear-to-r from-brand-600 to-accent-600 text-white shadow-md shadow-brand-600/25' : 'bg-white text-slate-600 ring-1 ring-brand-200 hover:bg-brand-50'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <select className="input !w-auto" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort medicines">
            <option value="name">Sort: Name</option><option value="price">Sort: Price</option>
            <option value="stock">Sort: Stock</option><option value="expiry">Sort: Expiry</option>
          </select>
          <div className="flex rounded-xl bg-white p-1 ring-1 ring-brand-200">
            {(['grid', 'list'] as View[]).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${view === v ? 'bg-brand-100 text-brand-800' : 'text-slate-500'}`}>{v}</button>
            ))}
          </div>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((m) => {
            const low = isLow(m); const exp = expiryBadge(m.expiryDate);
            const pct = Math.min(100, (m.stock / Math.max(1, m.reorderLevel * 5)) * 100);
            return (
              <div key={m._id} className="card flex flex-col gap-4 transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><Icon name="pill" /></div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{m.name}</div>
                      <div className="truncate text-xs text-slate-500">{m.genericName || '—'}</div>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{m.category}</span>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div className="text-xl font-bold">{money(m.price)}</div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${exp.cls}`}>{exp.label}</span>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className={low ? 'font-semibold text-red-600' : 'text-slate-500'}>{low ? 'Low stock' : 'In stock'}</span>
                    <span className="font-medium">{m.stock} units</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundImage: low ? 'linear-gradient(90deg,#f87171,#ef4444)' : 'linear-gradient(90deg,#F06DB5,#B25ADB)' }} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Batch {m.batchNo}</span><AdminActions m={m} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead><tr>{['Name', 'Category', 'Price', 'Stock', 'Batch', 'Expiry', ''].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
            <tbody>
              {visible.map((m) => {
                const exp = expiryBadge(m.expiryDate);
                return (
                  <tr key={m._id} className="border-t border-brand-100">
                    <td className="px-4 py-3"><div className="font-medium">{m.name}</div><div className="text-xs text-slate-500">{m.genericName}</div></td>
                    <td className="px-4 py-3">{m.category}</td>
                    <td className="px-4 py-3">{money(m.price)}</td>
                    <td className={`px-4 py-3 ${isLow(m) ? 'font-semibold text-red-600' : ''}`}>{m.stock}{isLow(m) && ' (low)'}</td>
                    <td className="px-4 py-3">{m.batchNo}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${exp.cls}`}>{exp.label}</span></td>
                    <td className="px-4 py-3 text-right"><AdminActions m={m} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {!visible.length && !loading && <div className="card text-center text-slate-500">No medicines match your filters.</div>}

      {form && (
        <Modal title={editing ? 'Edit medicine' : 'Add medicine'} onClose={() => setForm(null)}>
          <form onSubmit={submit} className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Field label="Name"><input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} /></Field></div>
            <Field label="Generic name"><input className="input" value={form.genericName ?? ''} onChange={(e) => set('genericName', e.target.value)} /></Field>
            <Field label="Category"><input className="input" required list="med-cats" value={form.category} onChange={(e) => set('category', e.target.value)} /></Field>
            <datalist id="med-cats">{categories.filter((c) => c !== 'All').map((c) => <option key={c} value={c} />)}</datalist>
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
