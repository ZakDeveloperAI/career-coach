import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchJobs, setFilters, resetFilters } from '../features/jobs/jobsSlice'
import JobCard from '../components/JobCard'
import client from '../api/client'
import { contractLabel } from '../utils/labels'

const CONTRACT_TYPES = ['FULL_TIME','PART_TIME','CONTRACT','INTERNSHIP','FREELANCE']

export default function JobsListPage() {
  const dispatch = useDispatch()
  const { list, filters, status } = useSelector((s) => s.jobs)
  const [categories, setCategories] = useState([])
  const [page, setPage] = useState(0)
  const size = 10

  useEffect(() => {
    client.get('/categories').then((r) => setCategories(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const params = {
      page, size, sort: 'postedAt,desc',
      q: filters.q || undefined,
      location: filters.location || undefined,
      remote: filters.remote ?? undefined,
      minSalary: filters.minSalary || undefined,
      categoryId: filters.categoryId || undefined,
      contractTypes: filters.contractTypes.length ? filters.contractTypes.join(',') : undefined,
      skills: filters.skills.length ? filters.skills.join(',') : undefined,
    }
    dispatch(fetchJobs(params))
  }, [dispatch, filters, page])

  const onFilter = (patch) => { setPage(0); dispatch(setFilters(patch)) }
  const onClear = () => { setPage(0); dispatch(resetFilters()) }

  const activeFilters = [
    filters.q && { label: `"${filters.q}"`, key: 'q', clear: () => onFilter({ q: '' }) },
    filters.location && { label: `📍 ${filters.location}`, key: 'loc', clear: () => onFilter({ location: '' }) },
    filters.remote === true && { label: '🌍 Remote', key: 'rem', clear: () => onFilter({ remote: null }) },
    filters.minSalary && { label: `💰 ≥ ${filters.minSalary.toLocaleString()}`, key: 'sal', clear: () => onFilter({ minSalary: null }) },
    filters.categoryId && { label: `📁 ${categories.find((c) => c.id == filters.categoryId)?.name ?? '?'}`, key: 'cat', clear: () => onFilter({ categoryId: null }) },
    ...filters.contractTypes.map((t) => ({ label: contractLabel(t), key: `ct-${t}`, clear: () => onFilter({ contractTypes: filters.contractTypes.filter((x) => x !== t) }) })),
  ].filter(Boolean)

  return (
    <div className="grid md:grid-cols-[300px_1fr] gap-6 fade-in">
      <aside>
        <div className="card p-5 sticky top-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <span className="text-lg">🔧</span> Filtri
            </h2>
            {activeFilters.length > 0 && (
              <button onClick={onClear} className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                Reset
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cerca per titolo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                <input
                  type="text"
                  className="input pl-9"
                  value={filters.q}
                  onChange={(e) => onFilter({ q: e.target.value })}
                  placeholder="Java, React..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Citta'</label>
              <input
                type="text"
                className="input"
                value={filters.location}
                onChange={(e) => onFilter({ location: e.target.value })}
                placeholder="Roma, Milano..."
              />
            </div>

            <label className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-xl px-3 py-2.5 cursor-pointer transition-colors">
              <span className="text-sm flex items-center gap-2">🌍 Solo remoto</span>
              <input
                type="checkbox"
                className="w-4 h-4 accent-brand-600"
                checked={filters.remote === true}
                onChange={(e) => onFilter({ remote: e.target.checked ? true : null })}
              />
            </label>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Salario minimo (EUR)</label>
              <input
                type="number"
                className="input"
                value={filters.minSalary || ''}
                onChange={(e) => onFilter({ minSalary: e.target.value ? Number(e.target.value) : null })}
                placeholder="es. 25000"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Categoria</label>
              <select
                className="input"
                value={filters.categoryId || ''}
                onChange={(e) => onFilter({ categoryId: e.target.value || null })}
              >
                <option value="">Tutte</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="block text-xs font-medium text-gray-600 mb-2">Tipo contratto</div>
              <div className="space-y-1">
                {CONTRACT_TYPES.map((t) => {
                  const checked = filters.contractTypes.includes(t)
                  return (
                    <label
                      key={t}
                      className={'flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm cursor-pointer transition-colors ' +
                        (checked ? 'bg-brand-50 text-brand-700' : 'hover:bg-gray-50 text-gray-700')}
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-brand-600"
                        checked={checked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...filters.contractTypes, t]
                            : filters.contractTypes.filter((x) => x !== t)
                          onFilter({ contractTypes: next })
                        }}
                      />
                      {contractLabel(t)}
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Offerte di lavoro</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {list.totalElements > 0
                ? `${list.totalElements} offert${list.totalElements === 1 ? 'a' : 'e'} ${activeFilters.length ? 'trovate' : 'attive'}`
                : 'Nessuna offerta'}
            </p>
          </div>
          {list.totalPages > 1 && (
            <div className="text-xs text-gray-500 bg-white border rounded-full px-3 py-1.5">
              Pagina {page + 1} / {list.totalPages}
            </div>
          )}
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 fade-in">
            {activeFilters.map((f) => (
              <button
                key={f.key}
                onClick={f.clear}
                className="badge bg-brand-50 text-brand-700 hover:bg-brand-100 group transition-colors"
              >
                {f.label}
                <span className="ml-1 group-hover:scale-110 transition-transform">×</span>
              </button>
            ))}
          </div>
        )}

        {status === 'loading' && (
          <div className="space-y-3">
            {[0,1,2].map((i) => (
              <div key={i} className="card p-5">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
                <div className="flex gap-2 mt-4">
                  <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {status === 'error' && (
          <div className="card p-8 text-center fade-in">
            <p className="text-5xl mb-3">😕</p>
            <p className="text-red-700 font-medium">Errore durante il caricamento.</p>
            <p className="text-sm text-gray-500 mt-1">Riprova fra qualche secondo.</p>
          </div>
        )}

        {status === 'success' && list.content.length === 0 && (
          <div className="card p-12 text-center fade-in">
            <p className="text-6xl mb-3">🔍</p>
            <h3 className="font-semibold text-gray-900">Nessuna offerta con questi filtri</h3>
            <p className="text-sm text-gray-500 mt-1">Prova ad allargare i criteri.</p>
            <button onClick={onClear} className="btn-primary mt-4 btn-sm">
              Reset filtri
            </button>
          </div>
        )}

        <div className="space-y-3">
          {list.content.map((j, idx) => (
            <div key={j.id} className="fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
              <JobCard job={j} />
            </div>
          ))}
        </div>

        {list.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="btn-secondary btn-sm"
            >
              ← Precedente
            </button>
            <div className="flex gap-1">
              {Array.from({ length: list.totalPages }, (_, i) => i).slice(
                Math.max(0, page - 2),
                Math.min(list.totalPages, page + 3)
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={'w-9 h-9 rounded-full text-sm font-medium transition-colors ' +
                    (p === page ? 'bg-brand-600 text-white' : 'hover:bg-gray-100 text-gray-700')}
                >
                  {p + 1}
                </button>
              ))}
            </div>
            <button
              disabled={page >= list.totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary btn-sm"
            >
              Successiva →
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
