import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { clearError, register } from '../features/auth/authSlice';
import { ErrorBox, Field } from '../components/ui';

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useAppSelector((s) => s.auth);
  const [form, setForm] = useState<{ name: string; email: string; password: string; role: 'mr' | 'pharmacy' }>({
    name: '', email: '', password: '', role: 'pharmacy',
  });

  useEffect(() => { dispatch(clearError()); }, [dispatch]);
  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);

  const submit = (e: FormEvent) => { e.preventDefault(); dispatch(register(form)); };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-teal-700">Create account</h1>
        <ErrorBox message={error} />
        <Field label="Full name"><input className="input" required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Email"><input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Password (min 6)"><input className="input" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        <Field label="I am a">
          <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'mr' | 'pharmacy' })}>
            <option value="pharmacy">Pharmacy</option>
            <option value="mr">Medical Representative</option>
          </select>
        </Field>
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
        <p className="text-center text-sm">Have an account? <Link className="text-teal-700 underline" to="/login">Sign in</Link></p>
      </form>
    </div>
  );
}
