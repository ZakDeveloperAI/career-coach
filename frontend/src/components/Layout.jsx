import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/auth/authSlice'

export default function Layout() {
  const user = useSelector((s) => s.auth.user)
  const dispatch = useDispatch()
  const nav = useNavigate()

  const onLogout = () => {
    dispatch(logout())
    nav('/login')
  }

  const linkClass = ({ isActive }) =>
    'px-3 py-1.5 rounded-full text-sm transition-colors ' +
    (isActive
      ? 'bg-brand-50 text-brand-700 font-semibold'
      : 'text-gray-700 hover:bg-gray-100')

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-brand-50/30">
      <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-brand-600">
            <span className="bg-brand-600 text-white w-8 h-8 rounded-xl flex items-center justify-center text-sm">
              CC
            </span>
            <span>Career Coach</span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <NavLink to="/jobs" className={linkClass}>Offerte</NavLink>
            {user?.role === 'CANDIDATE' && (
              <>
                <NavLink to="/me" className={linkClass}>Dashboard</NavLink>
                <NavLink to="/me/ai-review" className={linkClass}>🤖 AI Coach</NavLink>
              </>
            )}
            {(user?.role === 'RECRUITER' || user?.role === 'ADMIN') && (
              <NavLink to="/recruiter" className={linkClass}>Recruiter</NavLink>
            )}
            {!user && (
              <>
                <NavLink to="/login" className={linkClass}>Login</NavLink>
                <NavLink
                  to="/register"
                  className="bg-brand-600 text-white px-4 py-2 rounded-full hover:bg-brand-700 hover:shadow-md transition-all text-sm font-medium"
                >
                  Registrati
                </NavLink>
              </>
            )}
            {user && (
              <div className="flex items-center gap-2 pl-3 ml-2 border-l border-gray-200">
                <div className="text-right">
                  <div className="text-xs text-gray-500 leading-none">{user.email}</div>
                  <div className="text-xs text-brand-600 leading-tight font-medium mt-0.5">
                    {user.role}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="text-gray-600 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-full text-sm transition-colors"
                  title="Esci"
                >
                  Esci
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>

      <footer className="bg-white/60 border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-xs text-gray-500">
          Career Coach — progetto Epicode 2026
        </div>
      </footer>
    </div>
  )
}
