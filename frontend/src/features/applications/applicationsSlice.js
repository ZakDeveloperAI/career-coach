import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import client from '../../api/client'

export const fetchMine = createAsyncThunk('applications/mine', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await client.get('/applications/mine', { params })
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Errore')
  }
})

export const fetchForCompany = createAsyncThunk('applications/forCompany', async ({ companyId, ...params }, { rejectWithValue }) => {
  try {
    const { data } = await client.get(`/applications/companies/${companyId}`, { params })
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Errore')
  }
})

export const applyToJob = createAsyncThunk('applications/apply', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await client.post('/applications', payload)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Errore')
  }
})

export const updateAppStatus = createAsyncThunk('applications/updateStatus', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await client.patch(`/applications/${id}/status`, payload)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Errore')
  }
})

export const withdraw = createAsyncThunk('applications/withdraw', async (id, { rejectWithValue }) => {
  try {
    await client.delete(`/applications/${id}`)
    return id
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Errore')
  }
})

const slice = createSlice({
  name: 'applications',
  initialState: {
    mine: { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 },
    forCompany: { content: [], totalElements: 0 },
    status: 'idle',
    error: null,
  },
  reducers: {
    clearError: (s) => { s.error = null },
  },
  extraReducers: (b) => {
    b.addCase(fetchMine.fulfilled, (s, a) => { s.mine = a.payload })
    b.addCase(fetchForCompany.fulfilled, (s, a) => { s.forCompany = a.payload })
    b.addCase(applyToJob.pending,   (s) => { s.status = 'loading'; s.error = null })
    b.addCase(applyToJob.fulfilled, (s, a) => {
      s.status = 'success'
      s.mine.content.unshift(a.payload)
    })
    b.addCase(applyToJob.rejected,  (s, a) => { s.status = 'error'; s.error = a.payload })

    b.addCase(updateAppStatus.fulfilled, (s, a) => {
      const update = (arr) => {
        const i = arr.findIndex((x) => x.id === a.payload.id)
        if (i >= 0) arr[i] = a.payload
      }
      update(s.mine.content); update(s.forCompany.content)
    })
    b.addCase(withdraw.fulfilled, (s, a) => {
      s.mine.content = s.mine.content.filter((x) => x.id !== a.payload)
    })
  },
})

export const { clearError } = slice.actions
export default slice.reducer
