import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import client from '../../api/client'

export const fetchCompanies = createAsyncThunk('companies/list', async (_, { rejectWithValue }) => {
  try {
    const { data } = await client.get('/companies')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Errore')
  }
})

export const fetchMyCompanies = createAsyncThunk('companies/mine', async (_, { rejectWithValue }) => {
  try {
    const { data } = await client.get('/companies/mine')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Errore')
  }
})

export const createCompany = createAsyncThunk('companies/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await client.post('/companies', payload)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Errore')
  }
})

const slice = createSlice({
  name: 'companies',
  initialState: { all: [], mine: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchCompanies.fulfilled,   (s, a) => { s.all = a.payload })
    b.addCase(fetchMyCompanies.fulfilled, (s, a) => { s.mine = a.payload })
    b.addCase(createCompany.fulfilled,    (s, a) => {
      s.mine.unshift(a.payload); s.all.unshift(a.payload)
    })
  },
})

export default slice.reducer
