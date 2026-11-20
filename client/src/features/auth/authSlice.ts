import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, errMsg, storage } from '../../services/api';
import { Role, User } from '../../types';

interface AuthState { user: User | null; loading: boolean; error: string | null }

const stored = sessionStorage.getItem('user');
const initialState: AuthState = { user: stored ? (JSON.parse(stored) as User) : null, loading: false, error: null };

interface AuthResponse { user: User; accessToken: string; refreshToken: string }

export const login = createAsyncThunk<AuthResponse, { email: string; password: string }, { rejectValue: string }>(
  'auth/login',
  async (body, { rejectWithValue }) => {
    try { return (await api.post('/auth/login', body)).data.data; } catch (e) { return rejectWithValue(errMsg(e)); }
  }
);

export const register = createAsyncThunk<
  AuthResponse, { name: string; email: string; password: string; role: Exclude<Role, 'admin'> }, { rejectValue: string }
>('auth/register', async (body, { rejectWithValue }) => {
  try { return (await api.post('/auth/register', body)).data.data; } catch (e) { return rejectWithValue(errMsg(e)); }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try { await api.post('/auth/logout'); } catch { /* token may already be expired, still log out locally */ }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: (b) => {
    const onSuccess = (s: AuthState, a: { payload: AuthResponse }) => {
      s.loading = false; s.user = a.payload.user;
      storage.save(a.payload.accessToken, a.payload.refreshToken);
      sessionStorage.setItem('user', JSON.stringify(a.payload.user));
    };
    const onPending = (s: AuthState) => { s.loading = true; s.error = null; };
    const onFail = (s: AuthState, a: { payload?: string }) => { s.loading = false; s.error = a.payload ?? 'Failed'; };
    b.addCase(login.pending, onPending).addCase(login.fulfilled, onSuccess).addCase(login.rejected, onFail)
     .addCase(register.pending, onPending).addCase(register.fulfilled, onSuccess).addCase(register.rejected, onFail)
     .addCase(logout.fulfilled, (s) => { s.user = null; storage.clear(); });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
