import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchResumes, createResume, deleteResume, fetchCoverLetters } from '../features/resumes/resumesSlice'
import { fetchMine } from '../features/applications/applicationsSlice'
import { statusLabel, toneLabel } from '../utils/labels'

const STATUS_STYLES = {
  ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  REVIEWED: 'bg-blue-50 text-blue-700 border-blue-200',
  SUBMITTED: 'bg-gray-100 text-gray-700 border-gray-200',
}

export default function CandidateDashboard() {
  const dispatch = useDispatch()
  const { items: resumes, coverLetters } = useSelector((s) => s.resumes)
  const { mine: apps } = useSelector((s) => s.applications)
  const { user } = useSelector((s) => s.auth)
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
    <div className="space-y-8 fade-in">
      <section className="bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10">
          <p className="text-brand-100 text-sm">Bentornato</p>
          <h1 className="text-3xl font-bold mt-1">{user?.name} {user?.surname}</h1>
          <p className="text-brand-100 text-sm mt-1">{user?.email}</p>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="CV" value={resumes.length} icon="📄" hint="i tuoi" />
        <StatCard label="Cover letters" value={coverLetters.length} icon="📨" hint="generate" />
        <StatCard label="Candidature" value={apps.totalElements} icon="🎯" hint="inviate" />
        <StatCard
          label="Accettate"
          value={apps.content?.filter((a) => a.status === 'ACCEPTED').length || 0}
          icon="✅" hint="positive" highlight
        />
      </section>

      <section className="card p-6">
        <SectionHeader
          icon="📄"
          title="I miei CV"
          count={resumes.length}
          action={
            <button
              onClick={() => setShowForm((s) => !s)}
              className={showForm ? 'btn-secondary btn-sm' : 'btn-primary btn-sm'}
            >
              {showForm ? 'Annulla' : '+ Nuovo CV'}
            </button>
          }
        />

        {showForm && (
          <form onSubmit={onCreate} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-5 space-y-3 mb-4 fade-in">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Titolo <span className="text-red-500">*</span></label>
              <input
                required
                className="input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="CV principale"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sommario</label>
              <textarea className="input" rows={2}
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="In due righe chi sei e cosa cerchi"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Skills</label>
              <textarea className="input" rows={2}
                value={form.skillsText}
                onChange={(e) => setForm({ ...form, skillsText: e.target.value })}
                placeholder="Java, Spring, React, ..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Esperienza</label>
              <textarea className="input" rows={3}
                value={form.experienceText}
                onChange={(e) => setForm({ ...form, experienceText: e.target.value })}
                placeholder="2024-2026: Junior dev presso XYZ"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Formazione</label>
              <textarea className="input" rows={2}
                value={form.educationText}
                onChange={(e) => setForm({ ...form, educationText: e.target.value })}
                placeholder="Laurea triennale Informatica"
              />
            </div>
            {err && <p className="text-xs text-red-600">{err}</p>}
            <button className="btn-primary">💾 Salva CV</button>
          </form>
        )}

        {resumes.length === 0 ? (
          <EmptyState
            emoji="📄"
            title="Nessun CV ancora"
            text="Crea il tuo primo CV per poter candidarti alle offerte."
          />
        ) : (
          <ul className="space-y-2">
            {resumes.map((r) => (
              <li key={r.id} className="flex items-center justify-between border border-gray-200 rounded-2xl p-4 hover:border-brand-300 hover:bg-brand-50/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-100 text-brand-700 rounded-xl flex items-center justify-center">📄</div>
                  <div>
                    <div className="font-medium text-gray-900">{r.title}</div>
                    <div className="text-xs text-gray-500">
                      Aggiornato {new Date(r.updatedAt).toLocaleString('it-IT')}
                    </div>
                  </div>
                </div>
                <button onClick={() => onDelete(r.id)} className="btn-danger">
                  Elimina
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-6">
        <SectionHeader icon="📨" title="Cover letters" count={coverLetters.length} />
        {coverLetters.length === 0 ? (
          <EmptyState
            emoji="📨"
            title="Nessuna cover letter"
            text="Genera la tua prima cover letter su misura dalla pagina AI Coach."
            action={
              <Link to="/me/ai-review" className="btn-primary btn-sm mt-3 inline-flex">
                🤖 Vai all'AI Coach
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3">
            {coverLetters.map((c) => (
              <li key={c.id} className="border border-gray-200 rounded-2xl p-4 hover:border-brand-300 transition-colors">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="font-medium text-gray-900">{c.title}</div>
                  <div className="flex gap-1 flex-wrap">
                    {c.generatedByAi && <span className="badge bg-brand-50 text-brand-700">🤖 AI</span>}
                    {c.tone && <span className="badge bg-gray-100 text-gray-700">{toneLabel(c.tone)}</span>}
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-2 line-clamp-3 leading-relaxed">{c.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-6">
        <SectionHeader icon="🎯" title="Le mie candidature" count={apps.totalElements} />
        {!apps.content?.length ? (
          <EmptyState
            emoji="🎯"
            title="Nessuna candidatura inviata"
            text="Esplora le offerte e invia la tua prima candidatura."
            action={
              <Link to="/jobs" className="btn-primary btn-sm mt-3 inline-flex">
                Esplora offerte
              </Link>
            }
          />
        ) : (
          <ul className="space-y-2">
            {apps.content.map((a) => (
              <li key={a.id} className="flex items-center justify-between border border-gray-200 rounded-2xl p-4 hover:border-brand-300 hover:bg-brand-50/30 transition-colors">
                <div>
                  <Link to={`/jobs/${a.jobId}`} className="font-medium text-brand-600 hover:underline">
                    {a.jobTitle}
                  </Link>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {a.companyName} · inviata {new Date(a.appliedAt).toLocaleDateString('it-IT')}
                  </div>
                </div>
                <span className={'badge border ' + (STATUS_STYLES[a.status] || STATUS_STYLES.SUBMITTED)}>
                  {statusLabel(a.status)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function StatCard({ label, value, icon, hint, highlight }) {
  return (
    <div className={'rounded-2xl p-5 border transition-all hover:shadow-md hover:-translate-y-0.5 ' +
      (highlight
        ? 'bg-emerald-50 border-emerald-200'
        : 'bg-white border-gray-200')}>
      <div className="text-2xl">{icon}</div>
      <div className={'text-3xl font-bold mt-2 ' + (highlight ? 'text-emerald-700' : 'text-gray-900')}>
        {value}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        <span className="font-medium">{label}</span> · {hint}
      </div>
    </div>
  )
}

function SectionHeader({ icon, title, count, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        {title}
        {count !== undefined && (
          <span className="text-sm font-normal text-gray-500">({count})</span>
        )}
      </h2>
      {action}
    </div>
  )
}

function EmptyState({ emoji, title, text, action }) {
  return (
    <div className="text-center py-8">
      <div className="text-5xl mb-3">{emoji}</div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">{text}</p>
      {action}
    </div>
  )
}
