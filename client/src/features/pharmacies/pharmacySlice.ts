import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, errMsg } from '../../services/api';
import { Pharmacy, PharmacyInput } from '../../types';

interface State { items: Pharmacy[]; loading: boolean; error: string | null }
const initialState: State = { items: [], loading: false, error: null };
type Cfg = { rejectValue: string };

export const fetchPharmacies = createAsyncThunk<Pharmacy[], void, Cfg>('pharmacies/fetch', async (_, { rejectWithValue }) => {
  try { return (await api.get('/pharmacies')).data.data; } catch (e) { return rejectWithValue(errMsg(e)); }
});
export const savePharmacy = createAsyncThunk<Pharmacy, { id?: string; data: PharmacyInput }, Cfg>(
  'pharmacies/save',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const res = id ? await api.put(`/pharmacies/${id}`, data) : await api.post('/pharmacies', data);
      dispatch(fetchPharmacies()); // refetch so populated MR / owner names are fresh
      return res.data.data;
    } catch (e) { return rejectWithValue(errMsg(e)); }
  }
);
export const deletePharmacy = createAsyncThunk<string, string, Cfg>('pharmacies/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/pharmacies/${id}`); return id; } catch (e) { return rejectWithValue(errMsg(e)); }
});

const slice = createSlice({
  name: 'pharmacies',
  initialState,
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: (b) => {
    b.addCase(fetchPharmacies.pending, (s) => { s.loading = true; s.error = null; })
     .addCase(fetchPharmacies.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
     .addCase(deletePharmacy.fulfilled, (s, a) => { s.items = s.items.filter((p) => p._id !== a.payload); })
     .addMatcher((a) => a.type.startsWith('pharmacies/') && a.type.endsWith('/rejected'),
       (s, a: { payload?: string }) => { s.loading = false; s.error = a.payload ?? 'Failed'; });
  },
});
export const { clearError: clearPharmacyError } = slice.actions;
export default slice.reducer;
