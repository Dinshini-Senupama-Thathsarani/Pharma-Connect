import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { clearError, login } from '../features/auth/authSlice';
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
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-teal-700">💊 PharmaConnect</h1>
        <p className="text-sm text-slate-600">Sign in to continue</p>
        <ErrorBox message={error} />
        <Field label="Email"><input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Password"><input className="input" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        <p className="text-center text-sm">No account? <Link className="text-teal-700 underline" to="/register">Register</Link></p>
      </form>
    </div>
  );
}
