import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { clearError, register } from '../features/auth/authSlice';
import AuthShell from '../components/AuthShell';
import { ErrorBox, Field } from '../components/ui';

type Form = { name: string; email: string; password: string; role: 'mr' | 'pharmacy' };

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useAppSelector((s) => s.auth);
  const [form, setForm] = useState<Form>({ name: '', email: '', password: '', role: 'pharmacy' });

  useEffect(() => { dispatch(clearError()); }, [dispatch]);
  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);

  const submit = (e: FormEvent) => { e.preventDefault(); dispatch(register(form)); };

  return (
    <AuthShell
      nav={{ to: '/login', label: 'Sign in' }}
      title="Create your account"
      subtitle="Join PharmaConnect as a pharmacy or medical representative."
      footer={<>Already have an account? <Link className="font-semibold text-white underline underline-offset-4" to="/login">Sign in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <ErrorBox message={error} />
        <Field label="Full name"><input className="input" required minLength={2} placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Email address"><input className="input" type="email" required placeholder="you@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Password (min 6 characters)"><input className="input" type="password" required minLength={6} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        <Field label="I am a">
          <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Form['role'] })}>
            <option value="pharmacy">Pharmacy</option>
            <option value="mr">Medical Representative</option>
          </select>
        </Field>
        <button className="btn-primary w-full py-3" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
      </form>
    </AuthShell>
  );
}
