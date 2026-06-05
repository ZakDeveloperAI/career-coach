import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchMyCompanies, createCompany } from '../features/companies/companiesSlice'
import { createJob, deleteJob } from '../features/jobs/jobsSlice'
import { fetchForCompany, updateAppStatus } from '../features/applications/applicationsSlice'
import client from '../api/client'

export default function RecruiterDashboard() {
  const dispatch = useDispatch()
  const { mine: companies } = useSelector((s) => s.companies)
  const { forCompany: applications } = useSelector((s) => s.applications)
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
      setJobForm({ title: '', description: '', salaryMin: '', salaryMax: '', contractType: 'FULL_TIME', remote: true, location: '', skills: '' })
      setShowJobForm(false)
    } catch (e) { setErr(e) }
  }

  const onDeleteJob = async (id) => {
    if (!confirm('Eliminare?')) return
    await dispatch(deleteJob(id))
    setMyJobs((j) => j.filter((x) => x.id !== id))
  }

  const onSetStatus = (appId, status) => {
    dispatch(updateAppStatus({ id: appId, payload: { status } }))
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>

      <section className="bg-white border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Aziende ({companies.length})</h2>
          <button
            onClick={() => setShowCompanyForm((s) => !s)}
            className="text-sm bg-brand-600 text-white px-3 py-1.5 rounded hover:bg-brand-700"
          >
            {showCompanyForm ? 'Annulla' : '+ Nuova azienda'}
          </button>
        </div>
        {showCompanyForm && (
          <form onSubmit={onCreateCompany} className="space-y-3 mb-4 bg-gray-50 p-4 rounded">
            <input required placeholder="Nome azienda" className="w-full border rounded px-2 py-1.5 text-sm"
              value={companyForm.name} onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})}/>
            <input placeholder="Localita'" className="w-full border rounded px-2 py-1.5 text-sm"
              value={companyForm.location} onChange={(e) => setCompanyForm({...companyForm, location: e.target.value})}/>
            <textarea placeholder="Descrizione" rows={2} className="w-full border rounded px-2 py-1.5 text-sm"
              value={companyForm.description} onChange={(e) => setCompanyForm({...companyForm, description: e.target.value})}/>
            {err && <p className="text-xs text-red-600">{err}</p>}
            <button className="bg-brand-600 text-white px-4 py-2 rounded text-sm">Salva</button>
          </form>
        )}
        <div className="flex flex-wrap gap-2">
          {companies.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCompanyId(c.id)}
              className={`px-3 py-1.5 rounded border text-sm ${
                selectedCompanyId === c.id ? 'bg-brand-600 text-white border-brand-600' : 'bg-white hover:bg-gray-50'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>

      {selectedCompanyId && (
        <>
          <section className="bg-white border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Offerte ({myJobs.length})</h2>
              <button
                onClick={() => setShowJobForm((s) => !s)}
                className="text-sm bg-brand-600 text-white px-3 py-1.5 rounded hover:bg-brand-700"
              >
                {showJobForm ? 'Annulla' : '+ Nuova offerta'}
              </button>
            </div>
            {showJobForm && (
              <form onSubmit={onCreateJob} className="space-y-3 mb-4 bg-gray-50 p-4 rounded">
                <input required placeholder="Titolo" className="w-full border rounded px-2 py-1.5 text-sm"
                  value={jobForm.title} onChange={(e) => setJobForm({...jobForm, title: e.target.value})}/>
                <textarea required placeholder="Descrizione" rows={3} className="w-full border rounded px-2 py-1.5 text-sm"
                  value={jobForm.description} onChange={(e) => setJobForm({...jobForm, description: e.target.value})}/>
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" placeholder="Salario min" className="border rounded px-2 py-1.5 text-sm"
                    value={jobForm.salaryMin} onChange={(e) => setJobForm({...jobForm, salaryMin: e.target.value})}/>
                  <input type="number" placeholder="Salario max" className="border rounded px-2 py-1.5 text-sm"
                    value={jobForm.salaryMax} onChange={(e) => setJobForm({...jobForm, salaryMax: e.target.value})}/>
                  <select className="border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                    value={jobForm.contractType} onChange={(e) => setJobForm({...jobForm, contractType: e.target.value})}>
                    <option value="FULL_TIME">Tempo pieno</option>
                    <option value="PART_TIME">Part-time</option>
                    <option value="CONTRACT">Contratto</option>
                    <option value="INTERNSHIP">Stage</option>
                    <option value="FREELANCE">Freelance</option>
                  </select>
                </div>
                <input placeholder="Localita'" className="w-full border rounded px-2 py-1.5 text-sm"
                  value={jobForm.location} onChange={(e) => setJobForm({...jobForm, location: e.target.value})}/>
                <input placeholder="Skills (comma separated)" className="w-full border rounded px-2 py-1.5 text-sm"
                  value={jobForm.skills} onChange={(e) => setJobForm({...jobForm, skills: e.target.value})}/>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={jobForm.remote} onChange={(e) => setJobForm({...jobForm, remote: e.target.checked})}/>
                  Remote
                </label>
                {err && <p className="text-xs text-red-600">{err}</p>}
                <button className="bg-brand-600 text-white px-4 py-2 rounded text-sm">Pubblica</button>
              </form>
            )}
            <ul className="space-y-2">
              {myJobs.map((j) => (
                <li key={j.id} className="border rounded p-3 flex justify-between items-center">
                  <div>
                    <Link to={`/jobs/${j.id}`} className="font-medium text-brand-600 hover:underline">{j.title}</Link>
                    <div className="text-xs text-gray-500">{j.status} - {j.location || '—'}</div>
                  </div>
                  <button onClick={() => onDeleteJob(j.id)} className="text-xs text-red-600 hover:text-red-700">
                    Elimina
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white border rounded-lg p-6">
            <h2 className="font-semibold mb-4">Candidature ricevute ({applications.totalElements || 0})</h2>
            <ul className="space-y-2">
              {applications.content?.map((a) => (
                <li key={a.id} className="border rounded p-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{a.candidateName}</div>
                    <Link to={`/jobs/${a.jobId}`} className="text-xs text-brand-600 hover:underline">
                      {a.jobTitle}
                    </Link>
                  </div>
                  <select
                    value={a.status}
                    onChange={(e) => onSetStatus(a.id, e.target.value)}
                    className="text-xs border rounded px-2 py-1"
                  >
                    <option value="SUBMITTED">Inviata</option>
                    <option value="REVIEWED">In revisione</option>
                    <option value="ACCEPTED">Accettata</option>
                    <option value="REJECTED">Rifiutata</option>
                  </select>
                </li>
              ))}
              {(!applications.content || applications.content.length === 0) && (
                <p className="text-sm text-gray-500">Nessuna candidatura ancora.</p>
              )}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
