import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, errMsg } from '../../services/api';
import { Medicine, MedicineInput } from '../../types';

interface State { items: Medicine[]; loading: boolean; error: string | null }
const initialState: State = { items: [], loading: false, error: null };
type Cfg = { rejectValue: string };

export const fetchMedicines = createAsyncThunk<Medicine[], string | undefined, Cfg>(
  'medicines/fetch',
  async (q, { rejectWithValue }) => {
    try { return (await api.get('/medicines', { params: { q, limit: 100 } })).data.data; } catch (e) { return rejectWithValue(errMsg(e)); }
  }
);
export const saveMedicine = createAsyncThunk<Medicine, { id?: string; data: MedicineInput }, Cfg>(
  'medicines/save',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = id ? await api.put(`/medicines/${id}`, data) : await api.post('/medicines', data);
      return res.data.data;
    } catch (e) { return rejectWithValue(errMsg(e)); }
  }
);
export const deleteMedicine = createAsyncThunk<string, string, Cfg>('medicines/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/medicines/${id}`); return id; } catch (e) { return rejectWithValue(errMsg(e)); }
});

const slice = createSlice({
  name: 'medicines',
  initialState,
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: (b) => {
    b.addCase(fetchMedicines.pending, (s) => { s.loading = true; s.error = null; })
     .addCase(fetchMedicines.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
     .addCase(saveMedicine.fulfilled, (s, a) => {
       const i = s.items.findIndex((m) => m._id === a.payload._id);
       if (i >= 0) s.items[i] = a.payload; else s.items.push(a.payload);
     })
     .addCase(deleteMedicine.fulfilled, (s, a) => { s.items = s.items.filter((m) => m._id !== a.payload); })
     .addMatcher((a) => a.type.startsWith('medicines/') && a.type.endsWith('/rejected'),
       (s, a: { payload?: string }) => { s.loading = false; s.error = a.payload ?? 'Failed'; });
  },
});
export const { clearError: clearMedicineError } = slice.actions;
export default slice.reducer;
