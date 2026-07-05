import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchAuctions      = createAsyncThunk('auctions/fetchAll',      async (_, { rejectWithValue }) => {
  try { return (await api.get('/auctions')).data }
  catch (err) { return rejectWithValue(err.message) }
})

export const fetchAuctionById   = createAsyncThunk('auctions/fetchById',     async (id, { rejectWithValue }) => {
  try { return (await api.get(`/auctions/${id}`)).data }
  catch (err) { return rejectWithValue(err.message) }
})

export const fetchBids          = createAsyncThunk('auctions/fetchBids',     async (auctionId, { rejectWithValue }) => {
  try { return (await api.get(`/auctions/${auctionId}/bids`)).data }
  catch (err) { return rejectWithValue(err.message) }
})

export const purchaseTicket     = createAsyncThunk('auctions/purchaseTicket',async (payload, { rejectWithValue }) => {
  const auctionId = typeof payload === 'object' ? payload.auctionId : payload
  const body = typeof payload === 'object' ? payload.payment : undefined
  try { await api.post(`/auctions/${auctionId}/tickets/purchase`, body); return auctionId }
  catch (err) { return rejectWithValue(err.message || 'Failed to purchase ticket') }
})

export const purchaseTicketByCard = createAsyncThunk('auctions/purchaseTicketByCard', async (auctionId, { rejectWithValue }) => {
  try { await api.post(`/auctions/${auctionId}/tickets/purchase-card`); return auctionId }
  catch (err) { return rejectWithValue(err.message || 'Failed to purchase ticket') }
})

export const checkMyTicket = createAsyncThunk('auctions/checkMyTicket', async (auctionId, { rejectWithValue }) => {
  try { return (await api.get(`/auctions/${auctionId}/tickets/check`)).data }
  catch { return false }
})

export const placeBid           = createAsyncThunk('auctions/placeBid',      async ({ auctionId, amount }, { rejectWithValue }) => {
  try { return (await api.post(`/auctions/${auctionId}/bids`, { amount })).data }
  catch (err) { return rejectWithValue(err.message || 'Failed to place bid') }
})

export const checkoutAuctionWin = createAsyncThunk('auctions/checkout',      async ({ auctionId, creditToApply, paymentMethod, cardAmount, address }, { rejectWithValue }) => {
  try { return (await api.post(`/auctions/${auctionId}/checkout`, { creditToApply, paymentMethod, cardAmount, ...address })).data }
  catch (err) { return rejectWithValue(err.message || 'Checkout failed') }
})

export const setupAutoBid = createAsyncThunk('auctions/setupAutoBid', async ({ auctionId, increment, maxLimit, startingBid }, { rejectWithValue }) => {
  try { return (await api.post(`/auctions/${auctionId}/auto-bid`, { increment, maxLimit, ...(startingBid ? { startingBid } : {}) })).data }
  catch (err) { return rejectWithValue(err.message || 'Failed to configure auto bid') }
})

export const getAutoBid = createAsyncThunk('auctions/getAutoBid', async (auctionId, { rejectWithValue }) => {
  try { return (await api.get(`/auctions/${auctionId}/auto-bid`)).data }
  catch { return null }
})

export const disableAutoBid = createAsyncThunk('auctions/disableAutoBid', async (auctionId, { rejectWithValue }) => {
  try { await api.delete(`/auctions/${auctionId}/auto-bid`); return null }
  catch (err) { return rejectWithValue(err.message || 'Failed to disable auto bid') }
})

// ── Admin thunks ──────────────────────────────────────────
export const createAuction  = createAsyncThunk('auctions/create',   async (data, { rejectWithValue }) => {
  try { return (await api.post('/auctions', data)).data }
  catch (err) { return rejectWithValue(err.message) }
})

export const activateAuction = createAsyncThunk('auctions/activate', async (id, { rejectWithValue }) => {
  try { return (await api.post(`/auctions/${id}/activate`)).data }
  catch (err) { return rejectWithValue(err.message) }
})

export const closeAuction   = createAsyncThunk('auctions/close',    async (id, { rejectWithValue }) => {
  try { return (await api.post(`/auctions/${id}/close`)).data }
  catch (err) { return rejectWithValue(err.message) }
})

export const closeAuctionWithWinner = createAsyncThunk('auctions/closeWithWinner', async (id, { rejectWithValue }) => {
  try { return (await api.post(`/auctions/${id}/close-with-winner`)).data }
  catch (err) { return rejectWithValue(err.message) }
})

export const fetchParticipants = createAsyncThunk('auctions/participants', async (auctionId, { rejectWithValue }) => {
  try { return (await api.get(`/admin/auctions/${auctionId}/participants`)).data }
  catch (err) { return rejectWithValue(err.message) }
})

export const fetchAutoBidConfigs = createAsyncThunk('auctions/autoBidConfigs', async (auctionId, { rejectWithValue }) => {
  try { return (await api.get(`/admin/auctions/${auctionId}/auto-bids`)).data }
  catch { return [] }
})

const auctionsSlice = createSlice({
  name: 'auctions',
  initialState: {
    items:        [],
    selected:     null,
    bids:         [],
    participants: [],
    autoBidConfigs: [],
    userHasTicket: false,
    autoBidConfig: null,
    loading:      false,
    error:        null,
  },
  reducers: {
    clearError(state)          { state.error = null },
    clearSelected(state)       { state.selected = null; state.bids = []; state.userHasTicket = false; state.autoBidConfig = null },
    // Called by the WebSocket hook to push live bids
    addLiveBid(state, action)  {
      state.bids.unshift(action.payload)
      if (state.selected) {
        state.selected.currentHighestBid = action.payload.amount
        state.selected.highestBidderName = action.payload.bidderName
      }
    },
    // Called by the WebSocket hook on auction status change
    updateLiveStatus(state, action) {
      state.selected = { ...state.selected, ...action.payload }
    },
  },
  extraReducers: builder => {
    const pending  = state => { state.loading = true;  state.error = null }
    const rejected = (state, action) => { state.loading = false; state.error = action.payload }

    builder
      .addCase(fetchAuctions.pending,          pending)
      .addCase(fetchAuctions.fulfilled,        (state, a) => { state.loading = false; state.items = a.payload })
      .addCase(fetchAuctions.rejected,         rejected)
      .addCase(fetchAuctionById.pending,       pending)
      .addCase(fetchAuctionById.fulfilled,     (state, a) => { state.loading = false; state.selected = a.payload })
      .addCase(fetchAuctionById.rejected,      rejected)
      .addCase(fetchBids.fulfilled,            (state, a) => { state.bids = a.payload })
      .addCase(placeBid.pending,               pending)
      .addCase(placeBid.fulfilled,             (state) => { state.loading = false })
      .addCase(placeBid.rejected,              rejected)
      .addCase(createAuction.fulfilled,        (state, a) => { state.items.unshift(a.payload) })
      .addCase(activateAuction.fulfilled,      (state, a) => {
        const idx = state.items.findIndex(x => x.id === a.payload.id)
        if (idx !== -1) state.items[idx] = a.payload
        if (state.selected?.id === a.payload.id) state.selected = a.payload
      })
      .addCase(closeAuction.fulfilled,         (state, a) => {
        const idx = state.items.findIndex(x => x.id === a.payload.id)
        if (idx !== -1) state.items[idx] = a.payload
        if (state.selected?.id === a.payload.id) state.selected = a.payload
      })
      .addCase(closeAuctionWithWinner.fulfilled, (state, a) => {
        const idx = state.items.findIndex(x => x.id === a.payload.id)
        if (idx !== -1) state.items[idx] = a.payload
        if (state.selected?.id === a.payload.id) state.selected = a.payload
      })
      .addCase(purchaseTicket.fulfilled,         (state) => { state.loading = false; state.userHasTicket = true })
      .addCase(purchaseTicketByCard.fulfilled,   (state) => { state.loading = false; state.userHasTicket = true })
      .addCase(checkMyTicket.fulfilled,        (state, a) => { state.userHasTicket = a.payload })
      .addCase(fetchParticipants.fulfilled,    (state, a) => { state.participants = a.payload })
      .addCase(fetchAutoBidConfigs.fulfilled,  (state, a) => { state.autoBidConfigs = a.payload || [] })
      .addCase(getAutoBid.fulfilled,           (state, a) => { state.autoBidConfig = a.payload })
      .addCase(setupAutoBid.fulfilled,         (state, a) => { state.autoBidConfig = a.payload })
      .addCase(disableAutoBid.fulfilled,       (state)    => { state.autoBidConfig = null })
  },
})

export const { clearError, clearSelected, addLiveBid, updateLiveStatus } = auctionsSlice.actions
export default auctionsSlice.reducer
