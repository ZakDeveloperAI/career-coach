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
    try {
      await client.post(`/saved-jobs/${id}`)
      setSaved(true)
    } catch { /* gia' salvato o errore */ }
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
    return <p className="text-gray-500">Caricamento...</p>
  }

  return (
    <div className="grid md:grid-cols-[1fr_320px] gap-6">
      <article className="bg-white border rounded-lg p-6">
        <Link to="/jobs" className="text-sm text-brand-600 hover:underline">&larr; Tutte le offerte</Link>
        <h1 className="text-2xl font-bold mt-2">{job.title}</h1>
        <p className="text-gray-600">{job.companyName}</p>
        <div className="flex flex-wrap gap-2 mt-4 text-sm text-gray-600">
          {job.location && (
            <span className="bg-gray-50 px-3 py-1.5 rounded-full">📍 {job.location}</span>
          )}
          <span className="bg-gray-50 px-3 py-1.5 rounded-full">
            💼 {contractLabel(job.contractType)}
          </span>
          {job.remote && (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full font-medium">
              🌍 Remote
            </span>
          )}
          {(job.salaryMin > 0 || job.salaryMax > 0) && (
            <span className="bg-gray-50 px-3 py-1.5 rounded-full">
              💰 {job.salaryMin > 0 ? job.salaryMin.toLocaleString() : '?'} -{' '}
              {job.salaryMax > 0 ? job.salaryMax.toLocaleString() : '?'} {job.currency}
            </span>
          )}
        </div>
        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {job.skills.map((s) => (
              <span
                key={s}
                className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        )}
        <div className="mt-6 prose prose-sm max-w-none whitespace-pre-line text-gray-800">
          {job.description}
        </div>
      </article>

      <aside className="space-y-4">
        {!user && (
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <Link to="/login" className="text-brand-600 hover:underline">Accedi</Link>{' '}
              come candidato per candidarti.
            </p>
          </div>
        )}

        {user?.role === 'CANDIDATE' && !applySuccess && (
          <div className="bg-white border rounded-lg p-4 space-y-3">
            <h2 className="font-semibold">Candidati</h2>
            <form onSubmit={onApply} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600">CV</label>
                <select
                  required
                  value={resumeId}
                  onChange={(e) => setResumeId(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1.5 text-sm"
                >
                  <option value="">Scegli un CV</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
                {resumes.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    <Link to="/me" className="underline">Crea prima un CV</Link>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-600">Cover letter (opzionale)</label>
                <select
                  value={coverLetterId}
                  onChange={(e) => setCoverLetterId(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1.5 text-sm"
                >
                  <option value="">Nessuna</option>
                  {coverLetters.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              {applyError && <p className="text-xs text-red-600">{applyError}</p>}
              <button
                type="submit"
                disabled={!resumeId}
                className="w-full bg-brand-600 text-white py-2 rounded hover:bg-brand-700 disabled:opacity-50 text-sm"
              >
                Invia candidatura
              </button>
            </form>
            <button
              type="button"
              onClick={onSaveJob}
              disabled={saved}
              className="w-full border py-2 rounded hover:bg-gray-50 text-sm disabled:opacity-50"
            >
              {saved ? '★ Salvata' : '☆ Salva offerta'}
            </button>
          </div>
        )}

        {applySuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
            Candidatura inviata! La trovi nella tua{' '}
            <Link to="/me" className="underline">dashboard</Link>.
          </div>
        )}

        {user?.role === 'CANDIDATE' && resumes.length > 0 && (
          <button
            onClick={() => nav('/me/ai-review', { state: { jobId: job.id, resumeId: resumes[0]?.id } })}
            className="w-full bg-white border border-brand-500 text-brand-600 py-2.5 rounded hover:bg-brand-50 text-sm"
          >
            🤖 Chiedi una review AI di questa offerta
          </button>
        )}
      </aside>
    </div>
  )
}
