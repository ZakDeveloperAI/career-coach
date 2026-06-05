import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function ProtectedRoute({ roles }) {
  const { token, user, bootstrapped } = useSelector((s) => s.auth)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // token c'e' ma fetchMe non ha ancora terminato e non c'e' uno user salvato
  if (!user && !bootstrapped) {
    return <div className="text-center py-12 text-gray-500 text-sm">Caricamento...</div>
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
