import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchWallet = createAsyncThunk('wallet/fetch', async (_, { rejectWithValue }) => {
  try { return (await api.get('/wallet')).data }
  catch (err) { return rejectWithValue(err.message) }
})

export const buyNow = createAsyncThunk('wallet/buyNow', async ({ productId, creditToApply, paymentMethod, cardAmount, address }, { rejectWithValue }) => {
  try { return (await api.post(`/products/${productId}/buy-now`, { creditToApply, paymentMethod, cardAmount, ...address })).data }
  catch (err) { return rejectWithValue(err.message || 'Purchase failed') }
})

const walletSlice = createSlice({
  name: 'wallet',
  initialState: { wallet: null, loading: false, error: null },
  reducers: {
    clearError(state) { state.error = null },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchWallet.pending,   state => { state.loading = true;  state.error = null })
      .addCase(fetchWallet.fulfilled, (state, a) => { state.loading = false; state.wallet = a.payload })
      .addCase(fetchWallet.rejected,  (state, a) => { state.loading = false; state.error = a.payload })
      .addCase(buyNow.pending,        state => { state.loading = true;  state.error = null })
      .addCase(buyNow.fulfilled,      state => { state.loading = false })
      .addCase(buyNow.rejected,       (state, a) => { state.loading = false; state.error = a.payload })
  },
})

export const { clearError } = walletSlice.actions
export default walletSlice.reducer
