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

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-6">
      <aside className="bg-white border rounded-lg p-4 h-fit sticky top-4">
        <h2 className="font-semibold mb-4">Filtri</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600">Cerca</label>
            <input
              type="text"
              className="mt-1 w-full border rounded px-2 py-1.5 text-sm"
              value={filters.q}
              onChange={(e) => onFilter({ q: e.target.value })}
              placeholder="Java, React..."
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Localita'</label>
            <input
              type="text"
              className="mt-1 w-full border rounded px-2 py-1.5 text-sm"
              value={filters.location}
              onChange={(e) => onFilter({ location: e.target.value })}
              placeholder="Roma, Milano..."
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.remote === true}
                onChange={(e) => onFilter({ remote: e.target.checked ? true : null })}
              />
              Solo remoto
            </label>
          </div>
          <div>
            <label className="block text-xs text-gray-600">Salario minimo (EUR)</label>
            <input
              type="number"
              className="mt-1 w-full border rounded px-2 py-1.5 text-sm"
              value={filters.minSalary || ''}
              onChange={(e) => onFilter({ minSalary: e.target.value ? Number(e.target.value) : null })}
              placeholder="es. 25000"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Categoria</label>
            <select
              className="mt-1 w-full border rounded px-2 py-1.5 text-sm"
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
            <div className="block text-xs text-gray-600 mb-1">Tipo contratto</div>
            <div className="space-y-1 text-sm">
              {CONTRACT_TYPES.map((t) => (
                <label key={t} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.contractTypes.includes(t)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...filters.contractTypes, t]
                        : filters.contractTypes.filter((x) => x !== t)
                      onFilter({ contractTypes: next })
                    }}
                  />
                  {contractLabel(t)}
                </label>
              ))}
            </div>
          </div>
          <button
            onClick={onClear}
            className="w-full text-sm text-gray-600 hover:text-gray-900 border rounded py-1.5"
          >
            Reset filtri
          </button>
        </div>
      </aside>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Offerte</h1>
          <div className="text-sm text-gray-600">
            {list.totalElements} risultati
          </div>
        </div>

        {status === 'loading' && <p className="text-sm text-gray-500">Caricamento...</p>}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-700 text-sm">
            ⚠️ Errore durante il caricamento delle offerte. Riprova fra qualche secondo.
          </div>
        )}

        {status === 'success' && list.content.length === 0 && (
          <div className="bg-white border rounded-lg p-10 text-center text-gray-500">
            <p className="text-3xl mb-2">🔍</p>
            <p>Nessuna offerta trovata con questi filtri.</p>
            <button
              onClick={onClear}
              className="mt-3 text-sm text-brand-600 hover:underline"
            >
              Reset filtri
            </button>
          </div>
        )}

        <div className="space-y-3">
          {list.content.map((j) => <JobCard key={j.id} job={j} />)}
        </div>

        {list.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-3 py-1.5 border rounded text-sm disabled:opacity-40"
            >
              Precedente
            </button>
            <span className="text-sm text-gray-600">
              Pagina {page + 1} di {list.totalPages}
            </span>
            <button
              disabled={page >= list.totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border rounded text-sm disabled:opacity-40"
            >
              Successiva
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
