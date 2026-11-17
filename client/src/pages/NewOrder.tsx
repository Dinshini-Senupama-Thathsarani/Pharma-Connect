import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { fetchMedicines } from '../features/medicines/medicineSlice';
import { placeOrder } from '../features/orders/orderSlice';
import { fetchPharmacies } from '../features/pharmacies/pharmacySlice';
import { ErrorBox, Field, money } from '../components/ui';

interface Line { medicine: string; qty: number }

export default function NewOrder() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const role = useAppSelector((s) => s.auth.user?.role);
  const medicines = useAppSelector((s) => s.medicines.items);
  const pharmacies = useAppSelector((s) => s.pharmacies.items);
  const [pharmacy, setPharmacy] = useState('');
  const [lines, setLines] = useState<Line[]>([{ medicine: '', qty: 1 }]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchMedicines(undefined)); dispatch(fetchPharmacies()); }, [dispatch]);

  const price = (id: string) => medicines.find((m) => m._id === id)?.price ?? 0;
  const total = lines.reduce((s, l) => s + price(l.medicine) * l.qty, 0);
  const update = (i: number, patch: Partial<Line>) => setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    const items = lines.filter((l) => l.medicine && l.qty > 0);
    if (!items.length) return setErr('Add at least one medicine');
    if (role === 'mr' && !pharmacy) return setErr('Select a pharmacy');
    const res = await dispatch(placeOrder({ pharmacy: role === 'mr' ? pharmacy : undefined, items }));
    if (placeOrder.fulfilled.match(res)) navigate('/orders');
    else setErr((res.payload as string) ?? 'Could not place order');
  };

  return (
    <form onSubmit={submit} className="card mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">New order</h1>
      <ErrorBox message={err} />
      {role === 'mr' && (
        <Field label="Pharmacy">
          <select className="input" value={pharmacy} onChange={(e) => setPharmacy(e.target.value)} required>
            <option value="">Select pharmacy...</option>
            {pharmacies.map((p) => <option key={p._id} value={p._id}>{p.name} - {p.city}</option>)}
          </select>
        </Field>
      )}
      {role === 'pharmacy' && !pharmacies.length && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Create your pharmacy profile first (Pharmacies page) before ordering.</p>
      )}
      <div className="space-y-2">
        {lines.map((l, i) => (
          <div key={i} className="flex gap-2">
            <select className="input flex-1" value={l.medicine} onChange={(e) => update(i, { medicine: e.target.value })} aria-label="Medicine">
              <option value="">Select medicine...</option>
              {medicines.map((m) => <option key={m._id} value={m._id} disabled={m.stock === 0}>{m.name} ({m.stock} in stock) - {money(m.price)}</option>)}
            </select>
            <input className="input w-24" type="number" min={1} value={l.qty} onChange={(e) => update(i, { qty: Number(e.target.value) })} aria-label="Quantity" />
            <button type="button" className="btn-secondary" onClick={() => setLines((ls) => ls.filter((_, idx) => idx !== i))} disabled={lines.length === 1} aria-label="Remove line">✕</button>
          </div>
        ))}
        <button type="button" className="btn-secondary" onClick={() => setLines([...lines, { medicine: '', qty: 1 }])}>+ Add medicine</button>
      </div>
      <div className="flex items-center justify-between border-t pt-4">
        <div className="text-lg font-semibold">Total: {money(total)}</div>
        <button className="btn-primary">Place order</button>
      </div>
    </form>
  );
}
