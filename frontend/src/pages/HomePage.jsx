import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import client from '../api/client'

export default function HomePage() {
  const [totals, setTotals] = useState(null)
  const [topCompanies, setTopCompanies] = useState([])

  useEffect(() => {
    client.get('/stats/totals').then((r) => setTotals(r.data)).catch(() => {})
    client.get('/stats/top-companies').then((r) => setTopCompanies(r.data)).catch(() => {})
  }, [])

  return (
    <div className="space-y-10 fade-in">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 text-white p-10 md:p-14 shadow-xl">
        <div className="absolute inset-0 opacity-20 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 max-w-3xl">
          <span className="badge bg-white/20 text-white border border-white/30 mb-4">
            🤖 AI-powered
          </span>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Trova il lavoro giusto.<br />
            <span className="text-brand-100">Falla rivedere dall'AI.</span>
          </h1>
          <p className="mt-4 text-brand-50 text-base md:text-lg max-w-2xl">
            Career Coach unisce un job board con un assistente AI che analizza
            il tuo CV rispetto alle offerte e ti scrive una cover letter su misura.
          </p>
          <div className="mt-8 flex gap-3 flex-wrap">
            <Link to="/jobs" className="bg-white text-brand-700 px-6 py-3 rounded-full font-semibold hover:bg-brand-50 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              Esplora offerte →
            </Link>
            <Link to="/register" className="bg-white/10 backdrop-blur text-white border border-white/30 px-6 py-3 rounded-full font-medium hover:bg-white/20 transition-all">
              Registrati
            </Link>
          </div>
        </div>
      </section>

      {totals && (
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="card p-6 text-center hover:shadow-md transition-shadow">
            <div className="text-4xl font-bold text-brand-600">{totals.jobs}</div>
            <div className="text-sm text-gray-600 mt-1">offerte attive</div>
          </div>
          <div className="card p-6 text-center hover:shadow-md transition-shadow">
            <div className="text-4xl font-bold text-brand-600">{totals.applications}</div>
            <div className="text-sm text-gray-600 mt-1">candidature</div>
          </div>
          <div className="card p-6 text-center hover:shadow-md transition-shadow hidden md:block">
            <div className="text-4xl font-bold text-brand-600">🤖</div>
            <div className="text-sm text-gray-600 mt-1">review AI illimitate</div>
          </div>
        </section>
      )}

      <section className="card p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Come funziona</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Step n="1" emoji="📝" title="Crea il tuo CV"
                desc="Compila il profilo con skills, esperienze e formazione. In pochi minuti." />
          <Step n="2" emoji="🔍" title="Esplora le offerte"
                desc="Filtra per ruolo, citta', salario, skills. Anche offerte importate da Adzuna e RemoteOK." />
          <Step n="3" emoji="🤖" title="Chiedi all'AI"
                desc="L'AI analizza il tuo CV vs l'offerta. Vedi gap, suggerimenti, e generi la cover letter." />
        </div>
      </section>

      {topCompanies.length > 0 && (
        <section className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">🏢 Aziende piu' attive</h2>
          <ul className="grid md:grid-cols-2 gap-2">
            {topCompanies.slice(0, 6).map((c, i) => (
              <li key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-lg flex items-center justify-center font-bold text-sm">
                  {c.company?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{c.company}</div>
                  <div className="text-xs text-gray-500">
                    {c.jobCount} offerte · {c.applicationCount} candidature
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function Step({ n, emoji, title, desc }) {
  return (
    <div className="text-center p-4 rounded-2xl hover:bg-brand-50/40 transition-colors">
      <div className="text-4xl mb-2">{emoji}</div>
      <div className="text-xs font-semibold text-brand-600 uppercase tracking-wide">
        Step {n}
      </div>
      <h3 className="font-semibold text-gray-900 mt-1">{title}</h3>
      <p className="text-sm text-gray-600 mt-2">{desc}</p>
    </div>
  )
}
