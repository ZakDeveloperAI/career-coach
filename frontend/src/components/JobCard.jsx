import { Link } from 'react-router-dom'
import { contractLabel } from '../utils/labels'

export default function JobCard({ job }) {
  const hasSalary = job.salaryMin > 0 || job.salaryMax > 0
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group block bg-white rounded-2xl border border-gray-200 hover:border-brand-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 p-5"
    >
      <div className="flex justify-between items-start gap-3">
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
            {job.title}
          </h3>
          <p className="text-sm text-gray-600 mt-0.5">{job.companyName}</p>
        </div>
        {job.remote && (
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
            🌍 Remote
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mt-4 text-xs text-gray-600">
        {job.location && (
          <span className="bg-gray-50 px-2.5 py-1 rounded-full">📍 {job.location}</span>
        )}
        <span className="bg-gray-50 px-2.5 py-1 rounded-full">
          💼 {contractLabel(job.contractType)}
        </span>
        {hasSalary && (
          <span className="bg-gray-50 px-2.5 py-1 rounded-full">
            💰 {job.salaryMin > 0 ? job.salaryMin.toLocaleString() : '?'} -{' '}
            {job.salaryMax > 0 ? job.salaryMax.toLocaleString() : '?'} {job.currency}
          </span>
        )}
        {job.externalSource && (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
            via {job.externalSource}
          </span>
        )}
      </div>
      {job.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {[...job.skills].slice(0, 5).map((s) => (
            <span
              key={s}
              className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-medium"
            >
              {s}
            </span>
          ))}
          {job.skills.length > 5 && (
            <span className="text-xs text-gray-500 px-2 py-1">
              +{job.skills.length - 5}
            </span>
          )}
        </div>
      )}
    </Link>
  )
}
