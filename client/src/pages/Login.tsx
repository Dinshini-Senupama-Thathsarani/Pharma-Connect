import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { clearError, login } from '../features/auth/authSlice';
import AuthShell from '../components/AuthShell';
import { ErrorBox, Field } from '../components/ui';

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useAppSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => { dispatch(clearError()); }, [dispatch]);
  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);

  const submit = (e: FormEvent) => { e.preventDefault(); dispatch(login(form)); };

  return (
    <AuthShell
      nav={{ to: '/register', label: 'Create account' }}
      title="Welcome back"
      subtitle="Sign in to manage orders, stock and pharmacies."
      footer={<>New here? <Link className="font-semibold text-white underline underline-offset-4" to="/register">Create an account</Link></>}
    >
      <form onSubmit={submit} className="space-y-5">
        <ErrorBox message={error} />
        <Field label="Email address"><input className="input" type="email" required autoComplete="email" placeholder="you@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Password"><input className="input" type="password" required autoComplete="current-password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        <button className="btn-primary w-full py-3" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </AuthShell>
  );
}
