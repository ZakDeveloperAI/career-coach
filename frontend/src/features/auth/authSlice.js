import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import client from '../../api/client'

const USER_KEY = 'user'

const readUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const saveUser = (u) => {
  if (u) localStorage.setItem(USER_KEY, JSON.stringify(u))
}

const clearUser = () => localStorage.removeItem(USER_KEY)

const extractErrorMessage = (err) => {
  return err.response?.data?.message
    || err.response?.data?.details?.[0]
    || err.message
    || 'Errore'
}

export const login = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await client.post('/auth/login', creds)
    localStorage.setItem('token', data.token)
    return data
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err))
  }
})

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await client.post('/auth/register', payload)
    localStorage.setItem('token', data.token)
    return data
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err))
  }
})

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await client.get('/users/me')
    return data
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err))
  }
})

export const updateMe = createAsyncThunk('auth/updateMe', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await client.patch('/users/me', payload)
    return data
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err))
  }
})

const slice = createSlice({
  name: 'auth',
  initialState: {
    user: readUser(),
    token: localStorage.getItem('token') || null,
    status: 'idle',
    error: null,
    bootstrapped: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
      clearUser()
    },
    clearError: (state) => { state.error = null },
    markBootstrapped: (state) => { state.bootstrapped = true },
  },
  extraReducers: (b) => {
    const setUser = (state, { payload }) => {
      state.token = payload.token
      state.user = {
        id: payload.userId,
        email: payload.email,
        name: payload.name,
        surname: payload.surname,
        role: payload.role,
      }
      saveUser(state.user)
      state.status = 'success'
      state.error = null
      state.bootstrapped = true
    }
    b.addCase(login.pending,    (s) => { s.status = 'loading'; s.error = null })
    b.addCase(login.fulfilled,  setUser)
    b.addCase(login.rejected,   (s, a) => { s.status = 'error'; s.error = a.payload })
    b.addCase(register.pending, (s) => { s.status = 'loading'; s.error = null })
    b.addCase(register.fulfilled, setUser)
    b.addCase(register.rejected,  (s, a) => { s.status = 'error'; s.error = a.payload })
    b.addCase(fetchMe.fulfilled, (s, a) => {
      s.user = a.payload
      saveUser(s.user)
      s.bootstrapped = true
    })
    b.addCase(fetchMe.rejected, (s) => { s.bootstrapped = true })
    b.addCase(updateMe.fulfilled, (s, a) => { s.user = a.payload; saveUser(s.user) })
  },
})

export const { logout, clearError, markBootstrapped } = slice.actions
export default slice.reducer
