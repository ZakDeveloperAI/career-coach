import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="text-center py-20 fade-in">
      <div className="text-9xl font-bold bg-gradient-to-br from-brand-500 to-brand-700 bg-clip-text text-transparent">
        404
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mt-4">Pagina non trovata</h1>
      <p className="text-gray-600 mt-2 max-w-md mx-auto">
        Il link è rotto o la pagina è stata spostata.
      </p>
      <div className="flex gap-3 justify-center mt-6">
        <Link to="/" className="btn-primary">
          🏠 Home
        </Link>
        <Link to="/jobs" className="btn-secondary">
          Esplora offerte
        </Link>
      </div>
    </div>
  )
}
