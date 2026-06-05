import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import client from '../../api/client'

export const requestReview = createAsyncThunk('ai/review', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await client.post('/ai-reviews', payload)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Errore')
  }
})

export const fetchMyReviews = createAsyncThunk('ai/myReviews', async (_, { rejectWithValue }) => {
  try {
    const { data } = await client.get('/ai-reviews/mine')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Errore')
  }
})

export const generateCoverLetter = createAsyncThunk('ai/coverLetter', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await client.post('/cover-letters/generate', payload)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Errore')
  }
})

const slice = createSlice({
  name: 'ai',
  initialState: {
    reviews: [],
    lastReview: null,
    lastCoverLetter: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    clear: (s) => { s.lastReview = null; s.lastCoverLetter = null; s.error = null },
  },
  extraReducers: (b) => {
    b.addCase(requestReview.pending,   (s) => { s.status = 'loading'; s.error = null })
    b.addCase(requestReview.fulfilled, (s, a) => { s.status = 'success'; s.lastReview = a.payload; s.reviews.unshift(a.payload) })
    b.addCase(requestReview.rejected,  (s, a) => { s.status = 'error'; s.error = a.payload })

    b.addCase(fetchMyReviews.fulfilled, (s, a) => { s.reviews = a.payload })

    b.addCase(generateCoverLetter.pending,   (s) => { s.status = 'loading'; s.error = null })
    b.addCase(generateCoverLetter.fulfilled, (s, a) => { s.status = 'success'; s.lastCoverLetter = a.payload })
    b.addCase(generateCoverLetter.rejected,  (s, a) => { s.status = 'error'; s.error = a.payload })
  },
})

export const { clear } = slice.actions
export default slice.reducer
