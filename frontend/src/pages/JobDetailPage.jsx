import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchJobById, clearCurrent } from '../features/jobs/jobsSlice'
import { applyToJob } from '../features/applications/applicationsSlice'
import { fetchResumes, fetchCoverLetters } from '../features/resumes/resumesSlice'
import client from '../api/client'
import { contractLabel } from '../utils/labels'

export default function JobDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const nav = useNavigate()
  const { current: job, status } = useSelector((s) => s.jobs)
  const { user } = useSelector((s) => s.auth)
  const { items: resumes, coverLetters } = useSelector((s) => s.resumes)

  const [resumeId, setResumeId] = useState('')
  const [coverLetterId, setCoverLetterId] = useState('')
  const [saved, setSaved] = useState(false)
  const [applyError, setApplyError] = useState(null)
  const [applySuccess, setApplySuccess] = useState(false)

  useEffect(() => {
    dispatch(fetchJobById(id))
    return () => dispatch(clearCurrent())
  }, [id, dispatch])

  useEffect(() => {
    if (user?.role === 'CANDIDATE') {
      dispatch(fetchResumes())
      dispatch(fetchCoverLetters())
    }
  }, [user, dispatch])

  const onSaveJob = async () => {
    try { await client.post(`/saved-jobs/${id}`); setSaved(true) } catch {}
  }

  const onApply = async (e) => {
    e.preventDefault()
    setApplyError(null)
    try {
      await dispatch(applyToJob({
        jobId: Number(id),
        resumeId: Number(resumeId),
        coverLetterId: coverLetterId ? Number(coverLetterId) : null,
      })).unwrap()
      setApplySuccess(true)
    } catch (err) {
      setApplyError(err)
    }
  }

  if (status === 'loading' || !job) {
    return (
      <div className="space-y-4">
        <div className="card p-8 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-[1fr_340px] gap-6 fade-in">
      <article className="card overflow-hidden">
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 text-white p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none"
               style={{ backgroundImage: 'radial-gradient(circle at 90% 30%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="relative z-10">
            <Link to="/jobs" className="text-brand-100 hover:text-white text-sm inline-flex items-center gap-1 transition-colors">
              ← Tutte le offerte
            </Link>
            <div className="flex items-center gap-4 mt-3">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0">
                {job.companyName?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold leading-tight">{job.title}</h1>
                <p className="text-brand-100 text-sm md:text-base mt-1">{job.companyName}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-5 text-xs">
              {job.location && (
                <span className="bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">📍 {job.location}</span>
              )}
              <span className="bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                💼 {contractLabel(job.contractType)}
              </span>
              {job.remote && (
                <span className="bg-emerald-400/30 backdrop-blur border border-emerald-300/50 px-3 py-1.5 rounded-full">
                  🌍 Remote
                </span>
              )}
              {(job.salaryMin > 0 || job.salaryMax > 0) && (
                <span className="bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                  💰 {job.salaryMin > 0 ? job.salaryMin.toLocaleString() : '?'} - {job.salaryMax > 0 ? job.salaryMax.toLocaleString() : '?'} {job.currency}
                </span>
              )}
              {job.externalSource && (
                <span className="bg-amber-400/30 backdrop-blur border border-amber-300/50 px-3 py-1.5 rounded-full">
                  📥 via {job.externalSource}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
          {job.skills?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Skills richieste
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((s) => (
                  <span key={s} className="badge bg-brand-50 text-brand-700">{s}</span>
                ))}
              </div>
            </div>
          )}

          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Descrizione
          </h3>
          <div className="prose prose-sm max-w-none whitespace-pre-line text-gray-800 leading-relaxed">
            {job.description}
          </div>
        </div>
      </article>

      <aside className="space-y-4">
        {!user && (
          <div className="card p-5 text-center bg-gradient-to-br from-brand-50 to-white">
            <p className="text-3xl mb-2">🔐</p>
            <h3 className="font-semibold text-gray-900">Vuoi candidarti?</h3>
            <p className="text-sm text-gray-600 mt-1 mb-3">
              Accedi come candidato per inviare la tua candidatura.
            </p>
            <Link to="/login" className="btn-primary w-full">Accedi</Link>
          </div>
        )}

        {user?.role === 'CANDIDATE' && !applySuccess && (
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="text-xl">📨</span> Invia candidatura
            </h3>
            <form onSubmit={onApply} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CV <span className="text-red-500">*</span></label>
                <select
                  required
                  value={resumeId}
                  onChange={(e) => setResumeId(e.target.value)}
                  className="input"
                >
                  <option value="">Scegli un CV</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
                {resumes.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
                    ⚠️ <Link to="/me" className="underline font-medium">Crea prima un CV</Link>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cover letter (opzionale)</label>
                <select
                  value={coverLetterId}
                  onChange={(e) => setCoverLetterId(e.target.value)}
                  className="input"
                >
                  <option value="">Nessuna</option>
                  {coverLetters.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              {applyError && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5">
                  {applyError}
                </p>
              )}
              <button type="submit" disabled={!resumeId} className="btn-primary w-full">
                Invia candidatura
              </button>
              <button
                type="button"
                onClick={onSaveJob}
                disabled={saved}
                className={'w-full rounded-full px-4 py-2.5 text-sm font-medium border transition-all ' +
                  (saved
                    ? 'border-amber-300 bg-amber-50 text-amber-700'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700')}
              >
                {saved ? '★ Salvata' : '☆ Salva offerta'}
              </button>
            </form>
          </div>
        )}

        {applySuccess && (
          <div className="card p-5 bg-gradient-to-br from-emerald-50 to-white border-emerald-200 fade-in">
            <p className="text-3xl mb-2">🎉</p>
            <h3 className="font-semibold text-emerald-800">Candidatura inviata!</h3>
            <p className="text-sm text-emerald-700 mt-1">
              La trovi nella tua{' '}
              <Link to="/me" className="underline font-medium">dashboard</Link>.
            </p>
          </div>
        )}

        {user?.role === 'CANDIDATE' && resumes.length > 0 && (
          <button
            onClick={() => nav('/me/ai-review', { state: { jobId: job.id, resumeId: resumes[0]?.id } })}
            className="w-full bg-gradient-to-r from-brand-500 to-brand-600 text-white px-5 py-3 rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm font-medium"
          >
            🤖 Analizza con AI Coach
          </button>
        )}
      </aside>
    </div>
  )
}
