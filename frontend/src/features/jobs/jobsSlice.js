import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import client from '../../api/client'

export const fetchJobs = createAsyncThunk('jobs/list', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await client.get('/jobs', { params })
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Errore')
  }
})

export const fetchJobById = createAsyncThunk('jobs/byId', async (id, { rejectWithValue }) => {
  try {
    const { data } = await client.get(`/jobs/${id}`)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Errore')
  }
})

export const createJob = createAsyncThunk('jobs/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await client.post('/jobs', payload)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Errore')
  }
})

export const updateJob = createAsyncThunk('jobs/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await client.patch(`/jobs/${id}`, payload)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Errore')
  }
})

export const deleteJob = createAsyncThunk('jobs/delete', async (id, { rejectWithValue }) => {
  try {
    await client.delete(`/jobs/${id}`)
    return id
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Errore')
  }
})

const initial = {
  list: { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 },
  current: null,
  filters: { q: '', location: '', remote: null, minSalary: null, contractTypes: [], categoryId: null, skills: [] },
  status: 'idle',
  error: null,
}

const slice = createSlice({
  name: 'jobs',
  initialState: initial,
  reducers: {
    setFilters: (s, a) => { s.filters = { ...s.filters, ...a.payload } },
    resetFilters: (s) => { s.filters = initial.filters },
    clearCurrent: (s) => { s.current = null },
  },
  extraReducers: (b) => {
    b.addCase(fetchJobs.pending,   (s) => { s.status = 'loading'; s.error = null })
    b.addCase(fetchJobs.fulfilled, (s, a) => { s.status = 'success'; s.list = a.payload })
    b.addCase(fetchJobs.rejected,  (s, a) => { s.status = 'error'; s.error = a.payload })

    b.addCase(fetchJobById.pending,   (s) => { s.status = 'loading'; s.current = null })
    b.addCase(fetchJobById.fulfilled, (s, a) => { s.status = 'success'; s.current = a.payload })
    b.addCase(fetchJobById.rejected,  (s, a) => { s.status = 'error'; s.error = a.payload })

    b.addCase(createJob.fulfilled, (s, a) => { s.list.content.unshift(a.payload) })
    b.addCase(updateJob.fulfilled, (s, a) => {
      const i = s.list.content.findIndex((j) => j.id === a.payload.id)
      if (i >= 0) s.list.content[i] = a.payload
      if (s.current?.id === a.payload.id) s.current = a.payload
    })
    b.addCase(deleteJob.fulfilled, (s, a) => {
      s.list.content = s.list.content.filter((j) => j.id !== a.payload)
    })
  },
})

export const { setFilters, resetFilters, clearCurrent } = slice.actions
export default slice.reducer
