import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login, clearError } from '../features/auth/authSlice'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({})

  const dispatch = useDispatch()
  const { status, error, token } = useSelector((s) => s.auth)
  const nav = useNavigate()
  const loc = useLocation()

  useEffect(() => { dispatch(clearError()) }, [dispatch])

  useEffect(() => {
    if (token) nav(loc.state?.from?.pathname || '/', { replace: true })
  }, [token, nav, loc.state])

  const emailErr = touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const passErr = touched.password && password.length < 8
  const canSubmit = email && password && !emailErr && !passErr

  const onSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    dispatch(login({ email, password }))
  }

  return (
    <div className="max-w-md mx-auto fade-in">
      <div className="card p-8">
        <div className="text-center mb-6">
          <div className="inline-block bg-brand-100 text-brand-700 rounded-2xl px-3 py-1.5 text-sm font-medium">
            👋 Bentornato
          </div>
          <h1 className="text-2xl font-bold mt-3">Accedi al tuo account</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className={'input' + (emailErr ? ' input-error' : '')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              autoComplete="email"
              placeholder="tu@email.com"
              required
            />
            {emailErr && <p className="text-xs text-red-600 mt-1">Email non valida</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className={'input' + (passErr ? ' input-error' : '')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              autoComplete="current-password"
              placeholder="almeno 8 caratteri"
              required
            />
            {passErr && <p className="text-xs text-red-600 mt-1">Minimo 8 caratteri</p>}
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 fade-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit || status === 'loading'}
            className="btn-primary w-full"
          >
            {status === 'loading' && <span className="spinner" />}
            {status === 'loading' ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-6 text-center">
          Non hai un account?{' '}
          <Link to="/register" className="text-brand-600 hover:underline font-medium">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  )
}
