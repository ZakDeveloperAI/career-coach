import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { requestReview, generateCoverLetter, clear } from '../features/ai/aiSlice'
import { fetchResumes } from '../features/resumes/resumesSlice'
import client from '../api/client'

const TONES = [
  { value: 'FORMAL',       label: 'Formale',   emoji: '🎩' },
  { value: 'FRIENDLY',     label: 'Amichevole', emoji: '👋' },
  { value: 'ENTHUSIASTIC', label: 'Entusiasta', emoji: '🚀' },
  { value: 'CONCISE',      label: 'Conciso',   emoji: '✂️' },
]

export default function AiReviewPage() {
  const dispatch = useDispatch()
  const loc = useLocation()
  const { lastReview, lastCoverLetter, status, error } = useSelector((s) => s.ai)
  const { items: resumes } = useSelector((s) => s.resumes)
  const [jobs, setJobs] = useState([])
  const [jobId, setJobId] = useState(loc.state?.jobId || '')
  const [resumeId, setResumeId] = useState(loc.state?.resumeId || '')
  const [tone, setTone] = useState('FRIENDLY')

  useEffect(() => {
    dispatch(fetchResumes())
    client.get('/jobs?size=50&sort=postedAt,desc').then((r) => setJobs(r.data.content)).catch(() => {})
    return () => dispatch(clear())
  }, [dispatch])

  const canSubmit = jobId && resumeId
  const isLoading = status === 'loading'

  const onReview = (e) => {
    e.preventDefault()
    if (canSubmit) dispatch(requestReview({ jobId: Number(jobId), resumeId: Number(resumeId) }))
  }
  const onGenerateLetter = () => {
    if (canSubmit) dispatch(generateCoverLetter({ jobId: Number(jobId), resumeId: Number(resumeId), tone }))
  }

  const scoreColor = (s) =>
    s >= 75 ? 'text-emerald-600' :
    s >= 50 ? 'text-amber-600' :
    'text-red-600'

  const scoreLabel = (s) =>
    s >= 75 ? 'Ottimo match' :
    s >= 50 ? 'Match parziale' :
    'Gap significativi'

  return (
    <div className="space-y-6 fade-in">
      <div>
        <div className="inline-block bg-brand-100 text-brand-700 rounded-2xl px-3 py-1.5 text-sm font-medium">
          🤖 AI Coach
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mt-3">Analisi CV vs offerta</h1>
        <p className="text-gray-600 text-sm mt-1">
          Scegli un'offerta e un CV. L'AI fa la review e (opzionale) genera una cover letter.
        </p>
      </div>

      <form onSubmit={onReview} className="card p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Offerta</label>
            <select required value={jobId} onChange={(e) => setJobId(e.target.value)} className="input">
              <option value="">Scegli un'offerta</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title} - {j.companyName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Il tuo CV</label>
            <select required value={resumeId} onChange={(e) => setResumeId(e.target.value)} className="input">
              <option value="">Scegli un CV</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 fade-in">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <button type="submit" disabled={!canSubmit || isLoading} className="btn-primary">
            {isLoading && <span className="spinner" />}
            {isLoading ? 'L\'AI sta pensando...' : '🔍 Analizza CV vs offerta'}
          </button>

          <div className="flex items-center gap-2 md:ml-auto">
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="input !w-auto"
            >
              {TONES.map((t) => (
                <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={onGenerateLetter}
              disabled={!canSubmit || isLoading}
              className="btn-outline"
            >
              ✍️ Genera cover letter
            </button>
          </div>
        </div>
      </form>

      {lastReview && (
        <div className="card p-6 fade-in">
          <div className="flex items-center gap-6 mb-6 flex-wrap">
            <div className="text-center">
              <div className={`text-6xl font-bold ${scoreColor(lastReview.score)}`}>
                {lastReview.score}
                <span className="text-2xl text-gray-400">/100</span>
              </div>
              <div className={`text-sm font-medium mt-1 ${scoreColor(lastReview.score)}`}>
                {scoreLabel(lastReview.score)}
              </div>
            </div>
            <div className="flex-1 text-sm text-gray-500">
              <span className="badge bg-gray-100 text-gray-700">modello: {lastReview.modelUsed}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <ReviewSection icon="💪" title="Punti di forza" text={lastReview.strengths} tone="emerald" />
            <ReviewSection icon="⚠️" title="Gap da colmare" text={lastReview.gaps} tone="amber" />
            <ReviewSection icon="🎯" title="Suggerimenti" text={lastReview.suggestions} tone="blue" />
          </div>
        </div>
      )}

      {lastCoverLetter && (
        <div className="card p-6 fade-in">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">📨 Cover letter generata</h2>
            <span className="badge bg-brand-50 text-brand-700">
              Tono: {TONES.find((t) => t.value === lastCoverLetter.tone)?.label || lastCoverLetter.tone}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Salvata nella tua dashboard, pronta per essere usata in una candidatura.
          </p>
          <div className="bg-gray-50 rounded-2xl p-5 whitespace-pre-line text-sm text-gray-800 leading-relaxed">
            {lastCoverLetter.body}
          </div>
        </div>
      )}
    </div>
  )
}

function ReviewSection({ icon, title, text, tone }) {
  const toneClasses = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    amber:   'bg-amber-50 border-amber-200 text-amber-900',
    blue:    'bg-blue-50 border-blue-200 text-blue-900',
  }
  return (
    <div className={`rounded-2xl border p-4 ${toneClasses[tone]}`}>
      <h3 className="font-semibold text-sm flex items-center gap-2">
        <span className="text-xl">{icon}</span> {title}
      </h3>
      <p className="text-sm mt-2 whitespace-pre-line leading-relaxed">
        {text || <span className="opacity-60 italic">(nessuna informazione)</span>}
      </p>
    </div>
  )
}
