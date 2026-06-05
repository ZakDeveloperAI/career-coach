import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="text-gray-600 mt-2">Pagina non trovata.</p>
      <Link to="/" className="text-brand-600 hover:underline mt-4 inline-block">
        Torna alla home
      </Link>
    </div>
  )
}
