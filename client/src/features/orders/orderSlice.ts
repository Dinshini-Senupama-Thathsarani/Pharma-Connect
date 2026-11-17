import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, errMsg } from '../../services/api';
import { DashboardStats, Order, OrderStatus } from '../../types';

interface State { items: Order[]; stats: DashboardStats | null; loading: boolean; error: string | null }
const initialState: State = { items: [], stats: null, loading: false, error: null };
type Cfg = { rejectValue: string };

export const fetchOrders = createAsyncThunk<Order[], string | undefined, Cfg>('orders/fetch', async (status, { rejectWithValue }) => {
  try { return (await api.get('/orders', { params: { status } })).data.data; } catch (e) { return rejectWithValue(errMsg(e)); }
});
export const placeOrder = createAsyncThunk<Order, { pharmacy?: string; items: { medicine: string; qty: number }[] }, Cfg>(
  'orders/place',
  async (body, { rejectWithValue }) => {
    try { return (await api.post('/orders', body)).data.data; } catch (e) { return rejectWithValue(errMsg(e)); }
  }
);
export const changeOrderStatus = createAsyncThunk<Order, { id: string; status: Exclude<OrderStatus, 'pending'> }, Cfg>(
  'orders/status',
  async ({ id, status }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.patch(`/orders/${id}/status`, { status });
      dispatch(fetchOrders());
      return res.data.data;
    } catch (e) { return rejectWithValue(errMsg(e)); }
  }
);
export const fetchStats = createAsyncThunk<DashboardStats, void, Cfg>('orders/stats', async (_, { rejectWithValue }) => {
  try { return (await api.get('/dashboard/stats')).data.data; } catch (e) { return rejectWithValue(errMsg(e)); }
});

const slice = createSlice({
  name: 'orders',
  initialState,
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: (b) => {
    b.addCase(fetchOrders.pending, (s) => { s.loading = true; s.error = null; })
     .addCase(fetchOrders.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
     .addCase(fetchStats.fulfilled, (s, a) => { s.stats = a.payload; })
     .addMatcher((a) => a.type.startsWith('orders/') && a.type.endsWith('/rejected'),
       (s, a: { payload?: string }) => { s.loading = false; s.error = a.payload ?? 'Failed'; });
  },
});
export const { clearError: clearOrderError } = slice.actions;
export default slice.reducer;
