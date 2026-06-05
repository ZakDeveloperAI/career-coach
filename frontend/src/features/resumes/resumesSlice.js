import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import client from '../../api/client'

export const fetchResumes = createAsyncThunk('resumes/list', async (_, { rejectWithValue }) => {
  try {
    const { data } = await client.get('/resumes')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Errore')
  }
})

export const createResume = createAsyncThunk('resumes/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await client.post('/resumes', payload)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Errore')
  }
})

export const updateResume = createAsyncThunk('resumes/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await client.patch(`/resumes/${id}`, payload)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Errore')
  }
})

export const deleteResume = createAsyncThunk('resumes/delete', async (id, { rejectWithValue }) => {
  try {
    await client.delete(`/resumes/${id}`)
    return id
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Errore')
  }
})

export const fetchCoverLetters = createAsyncThunk('resumes/coverLetters', async (_, { rejectWithValue }) => {
  try {
    const { data } = await client.get('/cover-letters')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Errore')
  }
})

const slice = createSlice({
  name: 'resumes',
  initialState: { items: [], coverLetters: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchResumes.pending,   (s) => { s.status = 'loading' })
    b.addCase(fetchResumes.fulfilled, (s, a) => { s.status = 'success'; s.items = a.payload })
    b.addCase(fetchResumes.rejected,  (s, a) => { s.status = 'error'; s.error = a.payload })

    b.addCase(createResume.fulfilled, (s, a) => { s.items.unshift(a.payload) })
    b.addCase(updateResume.fulfilled, (s, a) => {
      const i = s.items.findIndex((x) => x.id === a.payload.id)
      if (i >= 0) s.items[i] = a.payload
    })
    b.addCase(deleteResume.fulfilled, (s, a) => {
      s.items = s.items.filter((x) => x.id !== a.payload)
    })
    b.addCase(fetchCoverLetters.fulfilled, (s, a) => { s.coverLetters = a.payload })
  },
})

export default slice.reducer
