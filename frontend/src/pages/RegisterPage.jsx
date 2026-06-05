import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { register, clearError } from '../features/auth/authSlice'

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '', password: '', name: '', surname: '', role: 'CANDIDATE',
  })
  const [touched, setTouched] = useState({})

  const dispatch = useDispatch()
  const { status, error, token } = useSelector((s) => s.auth)
  const nav = useNavigate()

  useEffect(() => { dispatch(clearError()) }, [dispatch])
  useEffect(() => { if (token) nav('/', { replace: true }) }, [token, nav])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const blur = (k) => () => setTouched({ ...touched, [k]: true })

  const errs = {
    email: touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
    password: touched.password && form.password.length < 8,
    name: touched.name && form.name.trim().length < 2,
    surname: touched.surname && form.surname.trim().length < 2,
  }
  const canSubmit = form.email && form.password.length >= 8 && form.name && form.surname
    && !errs.email && !errs.password

  const onSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    dispatch(register(form))
  }

  const Field = ({ k, label, type = 'text', autoComplete, placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        className={'input' + (errs[k] ? ' input-error' : '')}
        value={form[k]}
        onChange={set(k)}
        onBlur={blur(k)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
      />
      {errs[k] && <p className="text-xs text-red-600 mt-1">Non valido</p>}
    </div>
  )

  return (
    <div className="max-w-md mx-auto fade-in">
      <div className="card p-8">
        <div className="text-center mb-6">
          <div className="inline-block bg-brand-100 text-brand-700 rounded-2xl px-3 py-1.5 text-sm font-medium">
            🚀 Inizia ora
          </div>
          <h1 className="text-2xl font-bold mt-3">Crea il tuo account</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field k="name" label="Nome" autoComplete="given-name" placeholder="Mario" />
            <Field k="surname" label="Cognome" autoComplete="family-name" placeholder="Rossi" />
          </div>
          <Field k="email" label="Email" type="email" autoComplete="email" placeholder="tu@email.com" />
          <Field k="password" label="Password" type="password" autoComplete="new-password" placeholder="almeno 8 caratteri" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sono un</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'CANDIDATE' })}
                className={'p-3 rounded-2xl border-2 text-sm transition-all ' +
                  (form.role === 'CANDIDATE'
                    ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700')}
              >
                🎯 Candidato
                <div className="text-xs text-gray-500 mt-1 font-normal">cerco lavoro</div>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'RECRUITER' })}
                className={'p-3 rounded-2xl border-2 text-sm transition-all ' +
                  (form.role === 'RECRUITER'
                    ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700')}
              >
                💼 Recruiter
                <div className="text-xs text-gray-500 mt-1 font-normal">pubblico offerte</div>
              </button>
            </div>
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
            {status === 'loading' ? 'Creazione...' : 'Crea account'}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-6 text-center">
          Hai gia' un account?{' '}
          <Link to="/login" className="text-brand-600 hover:underline font-medium">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  )
}
