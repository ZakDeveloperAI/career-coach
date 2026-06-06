import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchMyCompanies, createCompany } from '../features/companies/companiesSlice'
import { createJob, deleteJob } from '../features/jobs/jobsSlice'
import { fetchForCompany, updateAppStatus } from '../features/applications/applicationsSlice'
import client from '../api/client'
import { statusLabel } from '../utils/labels'

const STATUS_STYLES = {
  ACCEPTED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50 text-red-700',
  REVIEWED: 'bg-blue-50 text-blue-700',
  SUBMITTED: 'bg-gray-100 text-gray-700',
}

export default function RecruiterDashboard() {
  const dispatch = useDispatch()
  const { mine: companies } = useSelector((s) => s.companies)
  const { forCompany: applications } = useSelector((s) => s.applications)
  const { user } = useSelector((s) => s.auth)
  const [myJobs, setMyJobs] = useState([])
  const [selectedCompanyId, setSelectedCompanyId] = useState(null)

  const [showCompanyForm, setShowCompanyForm] = useState(false)
  const [companyForm, setCompanyForm] = useState({ name: '', description: '', location: '' })

  const [showJobForm, setShowJobForm] = useState(false)
  const [jobForm, setJobForm] = useState({
    title: '', description: '', salaryMin: '', salaryMax: '',
    contractType: 'FULL_TIME', remote: false, location: '',
    skills: '',
  })
  const [err, setErr] = useState(null)

  useEffect(() => { dispatch(fetchMyCompanies()) }, [dispatch])

  useEffect(() => {
    if (companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].id)
    }
  }, [companies, selectedCompanyId])

  useEffect(() => {
    if (selectedCompanyId) {
      client.get(`/jobs?companyId=${selectedCompanyId}&size=50`)
        .then((r) => setMyJobs(r.data.content)).catch(() => {})
      dispatch(fetchForCompany({ companyId: selectedCompanyId, size: 50 }))
    }
  }, [selectedCompanyId, dispatch])

  const onCreateCompany = async (e) => {
    e.preventDefault()
    setErr(null)
    if (companyForm.name.trim().length < 2) { setErr('Nome obbligatorio'); return }
    try {
      const res = await dispatch(createCompany(companyForm)).unwrap()
      setCompanyForm({ name: '', description: '', location: '' })
      setShowCompanyForm(false)
      setSelectedCompanyId(res.id)
    } catch (e) { setErr(e) }
  }

  const onCreateJob = async (e) => {
    e.preventDefault()
    setErr(null)
    try {
      const payload = {
        title: jobForm.title,
        description: jobForm.description,
        salaryMin: jobForm.salaryMin ? Number(jobForm.salaryMin) : null,
        salaryMax: jobForm.salaryMax ? Number(jobForm.salaryMax) : null,
        currency: 'EUR',
        contractType: jobForm.contractType,
        remote: jobForm.remote,
        location: jobForm.location,
        companyId: selectedCompanyId,
        skills: jobForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
      }
      const res = await dispatch(createJob(payload)).unwrap()
      setMyJobs((j) => [res, ...j])
      setJobForm({ title: '', description: '', salaryMin: '', salaryMax: '', contractType: 'FULL_TIME', remote: false, location: '', skills: '' })
      setShowJobForm(false)
    } catch (e) { setErr(e) }
  }

  const onDeleteJob = async (id) => {
    if (!confirm('Eliminare questa offerta?')) return
    await dispatch(deleteJob(id))
    setMyJobs((j) => j.filter((x) => x.id !== id))
  }

  const onSetStatus = (appId, status) => {
    dispatch(updateAppStatus({ id: appId, payload: { status } }))
  }

  const totalApps = applications.totalElements || 0
  const newApps = applications.content?.filter((a) => a.status === 'SUBMITTED').length || 0
  const acceptedApps = applications.content?.filter((a) => a.status === 'ACCEPTED').length || 0

  return (
    <div className="space-y-8 fade-in">
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle at 80% 30%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10">
          <p className="text-slate-300 text-sm">Recruiter Dashboard</p>
          <h1 className="text-3xl font-bold mt-1">Ciao {user?.name}</h1>
          <p className="text-slate-300 text-sm mt-1">Gestisci aziende, offerte e candidature</p>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Aziende" value={companies.length} icon="🏢" />
        <StatCard label="Offerte attive" value={myJobs.length} icon="💼" />
        <StatCard label="Candidature" value={totalApps} icon="🎯" hint={`${newApps} nuove`} />
        <StatCard label="Accettate" value={acceptedApps} icon="✅" highlight />
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <span className="text-xl">🏢</span> Le mie aziende
            <span className="text-sm font-normal text-gray-500">({companies.length})</span>
          </h2>
          <button
            onClick={() => setShowCompanyForm((s) => !s)}
            className={showCompanyForm ? 'btn-secondary btn-sm' : 'btn-primary btn-sm'}
          >
            {showCompanyForm ? 'Annulla' : '+ Nuova azienda'}
          </button>
        </div>

        {showCompanyForm && (
          <form onSubmit={onCreateCompany} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-5 space-y-3 mb-4 fade-in">
            <input required placeholder="Nome azienda" className="input"
              value={companyForm.name} onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})}/>
            <input placeholder="Localita' (es. Roma)" className="input"
              value={companyForm.location} onChange={(e) => setCompanyForm({...companyForm, location: e.target.value})}/>
            <textarea placeholder="Descrizione" rows={2} className="input"
              value={companyForm.description} onChange={(e) => setCompanyForm({...companyForm, description: e.target.value})}/>
            {err && <p className="text-xs text-red-600">{err}</p>}
            <button className="btn-primary">💾 Crea azienda</button>
          </form>
        )}

        {companies.length === 0 && !showCompanyForm ? (
          <div className="text-center py-8">
            <p className="text-5xl mb-3">🏢</p>
            <p className="text-sm text-gray-500">Crea la tua prima azienda per pubblicare offerte.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {companies.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCompanyId(c.id)}
                className={'px-4 py-2 rounded-full border text-sm transition-all flex items-center gap-2 ' +
                  (selectedCompanyId === c.id
                    ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                    : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700')}
              >
                <span>{c.name?.[0]?.toUpperCase() ?? '?'}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedCompanyId && (
        <>
          <section className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <span className="text-xl">💼</span> Offerte
                <span className="text-sm font-normal text-gray-500">({myJobs.length})</span>
              </h2>
              <button
                onClick={() => setShowJobForm((s) => !s)}
                className={showJobForm ? 'btn-secondary btn-sm' : 'btn-primary btn-sm'}
              >
                {showJobForm ? 'Annulla' : '+ Nuova offerta'}
              </button>
            </div>

            {showJobForm && (
              <form onSubmit={onCreateJob} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-5 space-y-3 mb-4 fade-in">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Titolo <span className="text-red-500">*</span></label>
                  <input required placeholder="Backend Java Developer" className="input"
                    value={jobForm.title} onChange={(e) => setJobForm({...jobForm, title: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Descrizione <span className="text-red-500">*</span></label>
                  <textarea required placeholder="Cosa cerchi, requisiti, benefit..." rows={3} className="input"
                    value={jobForm.description} onChange={(e) => setJobForm({...jobForm, description: e.target.value})}/>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Salario min (EUR)</label>
                    <input type="number" placeholder="25000" className="input"
                      value={jobForm.salaryMin} onChange={(e) => setJobForm({...jobForm, salaryMin: e.target.value})}/>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Salario max (EUR)</label>
                    <input type="number" placeholder="40000" className="input"
                      value={jobForm.salaryMax} onChange={(e) => setJobForm({...jobForm, salaryMax: e.target.value})}/>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Contratto</label>
                    <select className="input"
                      value={jobForm.contractType} onChange={(e) => setJobForm({...jobForm, contractType: e.target.value})}>
                      <option value="FULL_TIME">Tempo pieno</option>
                      <option value="PART_TIME">Part-time</option>
                      <option value="CONTRACT">Contratto</option>
                      <option value="INTERNSHIP">Stage</option>
                      <option value="FREELANCE">Freelance</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="Localita' (Roma)" className="input"
                    value={jobForm.location} onChange={(e) => setJobForm({...jobForm, location: e.target.value})}/>
                  <input placeholder="Skills (Java, Spring, SQL)" className="input"
                    value={jobForm.skills} onChange={(e) => setJobForm({...jobForm, skills: e.target.value})}/>
                </div>
                <label className="flex items-center gap-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-xl px-3 py-2.5 cursor-pointer transition-colors w-fit">
                  <input type="checkbox" className="w-4 h-4 accent-brand-600"
                    checked={jobForm.remote}
                    onChange={(e) => setJobForm({...jobForm, remote: e.target.checked})}/>
                  🌍 Remote
                </label>
                {err && <p className="text-xs text-red-600">{err}</p>}
                <button className="btn-primary">📢 Pubblica</button>
              </form>
            )}

            {myJobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-5xl mb-3">💼</p>
                <p className="text-sm text-gray-500">Nessuna offerta pubblicata per questa azienda.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {myJobs.map((j) => (
                  <li key={j.id} className="flex items-center justify-between border border-gray-200 rounded-2xl p-4 hover:border-brand-300 hover:bg-brand-50/30 transition-colors">
                    <div>
                      <Link to={`/jobs/${j.id}`} className="font-medium text-gray-900 hover:text-brand-600">
                        {j.title}
                      </Link>
                      <div className="flex gap-2 mt-1 text-xs text-gray-500">
                        <span className="badge bg-gray-100 text-gray-700">{j.status}</span>
                        {j.location && <span>· {j.location}</span>}
                        {j.remote && <span className="text-emerald-700">· 🌍 Remote</span>}
                      </div>
                    </div>
                    <button onClick={() => onDeleteJob(j.id)} className="btn-danger">
                      Elimina
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="text-xl">🎯</span> Candidature ricevute
              <span className="text-sm font-normal text-gray-500">({totalApps})</span>
            </h2>
            {!applications.content?.length ? (
              <div className="text-center py-8">
                <p className="text-5xl mb-3">📭</p>
                <p className="text-sm text-gray-500">Nessuna candidatura ricevuta. Pubblica offerte per attirare i candidati.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {applications.content.map((a) => (
                  <li key={a.id} className="flex items-center justify-between border border-gray-200 rounded-2xl p-4 hover:border-brand-300 transition-colors flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-100 text-brand-700 rounded-xl flex items-center justify-center font-bold">
                        {a.candidateName?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{a.candidateName}</div>
                        <Link to={`/jobs/${a.jobId}`} className="text-xs text-brand-600 hover:underline">
                          → {a.jobTitle}
                        </Link>
                      </div>
                    </div>
                    <select
                      value={a.status}
                      onChange={(e) => onSetStatus(a.id, e.target.value)}
                      className={'text-xs border-0 rounded-full px-3 py-1.5 font-medium cursor-pointer ' +
                        (STATUS_STYLES[a.status] || STATUS_STYLES.SUBMITTED)}
                    >
                      <option value="SUBMITTED">Inviata</option>
                      <option value="REVIEWED">In revisione</option>
                      <option value="ACCEPTED">Accettata</option>
                      <option value="REJECTED">Rifiutata</option>
                    </select>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
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
        <span className="font-medium">{label}</span>{hint && ` · ${hint}`}
      </div>
    </div>
  )
}
