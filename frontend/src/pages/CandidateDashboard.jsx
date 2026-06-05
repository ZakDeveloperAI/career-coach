import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchResumes, createResume, deleteResume, fetchCoverLetters } from '../features/resumes/resumesSlice'
import { fetchMine } from '../features/applications/applicationsSlice'
import { statusLabel, toneLabel } from '../utils/labels'

export default function CandidateDashboard() {
  const dispatch = useDispatch()
  const { items: resumes, coverLetters } = useSelector((s) => s.resumes)
  const { mine: apps } = useSelector((s) => s.applications)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '', summary: '', skillsText: '', experienceText: '', educationText: '',
  })
  const [err, setErr] = useState(null)

  useEffect(() => {
    dispatch(fetchResumes())
    dispatch(fetchCoverLetters())
    dispatch(fetchMine({}))
  }, [dispatch])

  const onCreate = async (e) => {
    e.preventDefault()
    setErr(null)
    if (form.title.trim().length < 2) { setErr('Titolo obbligatorio'); return }
    try {
      await dispatch(createResume(form)).unwrap()
      setForm({ title: '', summary: '', skillsText: '', experienceText: '', educationText: '' })
      setShowForm(false)
    } catch (e) { setErr(e) }
  }

  const onDelete = (id) => {
    if (confirm('Eliminare questo CV?')) dispatch(deleteResume(id))
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">La mia dashboard</h1>

      <section className="bg-white border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">I miei CV ({resumes.length})</h2>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="text-sm bg-brand-600 text-white px-3 py-1.5 rounded hover:bg-brand-700"
          >
            {showForm ? 'Annulla' : '+ Nuovo CV'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={onCreate} className="space-y-3 mb-4 bg-gray-50 p-4 rounded">
            <div>
              <label className="block text-xs text-gray-600">Titolo *</label>
              <input
                required
                className="mt-1 w-full border rounded px-2 py-1.5 text-sm"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="CV principale"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Sommario</label>
              <textarea
                className="mt-1 w-full border rounded px-2 py-1.5 text-sm"
                rows={2}
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Skills</label>
              <textarea
                className="mt-1 w-full border rounded px-2 py-1.5 text-sm"
                rows={2}
                value={form.skillsText}
                onChange={(e) => setForm({ ...form, skillsText: e.target.value })}
                placeholder="Java, Spring, React, ..."
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Esperienza</label>
              <textarea
                className="mt-1 w-full border rounded px-2 py-1.5 text-sm"
                rows={3}
                value={form.experienceText}
                onChange={(e) => setForm({ ...form, experienceText: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Formazione</label>
              <textarea
                className="mt-1 w-full border rounded px-2 py-1.5 text-sm"
                rows={2}
                value={form.educationText}
                onChange={(e) => setForm({ ...form, educationText: e.target.value })}
              />
            </div>
            {err && <p className="text-xs text-red-600">{err}</p>}
            <button className="bg-brand-600 text-white px-4 py-2 rounded hover:bg-brand-700 text-sm">
              Salva CV
            </button>
          </form>
        )}

        {resumes.length === 0 ? (
          <p className="text-sm text-gray-500">Nessun CV. Creane uno per candidarti.</p>
        ) : (
          <ul className="space-y-2">
            {resumes.map((r) => (
              <li key={r.id} className="flex items-center justify-between border rounded p-3">
                <div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-gray-500">
                    Aggiornato {new Date(r.updatedAt).toLocaleString()}
                  </div>
                </div>
                <button onClick={() => onDelete(r.id)} className="text-xs text-red-600 hover:text-red-700">
                  Elimina
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white border rounded-lg p-6">
        <h2 className="font-semibold mb-4">Cover letters ({coverLetters.length})</h2>
        {coverLetters.length === 0 ? (
          <p className="text-sm text-gray-500">
            Nessuna cover letter. Genera la prima dalla{' '}
            <Link to="/me/ai-review" className="text-brand-600 hover:underline">pagina AI</Link>.
          </p>
        ) : (
          <ul className="space-y-2">
            {coverLetters.map((c) => (
              <li key={c.id} className="border rounded p-3">
                <div className="font-medium">{c.title}</div>
                <div className="text-xs text-gray-500">
                  {c.generatedByAi ? '🤖 generata da AI' : '✍️ scritta a mano'} -{' '}
                  Tono: {c.tone ? toneLabel(c.tone) : '-'}
                </div>
                <p className="text-sm text-gray-700 mt-2 line-clamp-3">{c.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white border rounded-lg p-6">
        <h2 className="font-semibold mb-4">Le mie candidature ({apps.totalElements})</h2>
        {apps.content.length === 0 ? (
          <p className="text-sm text-gray-500">Nessuna candidatura inviata.</p>
        ) : (
          <ul className="space-y-2">
            {apps.content.map((a) => (
              <li key={a.id} className="border rounded p-3 flex justify-between items-center">
                <div>
                  <Link to={`/jobs/${a.jobId}`} className="font-medium text-brand-600 hover:underline">
                    {a.jobTitle}
                  </Link>
                  <div className="text-xs text-gray-500">{a.companyName}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  a.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                  a.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                  a.status === 'REVIEWED' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>{statusLabel(a.status)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
