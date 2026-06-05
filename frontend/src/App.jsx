import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMe, markBootstrapped } from './features/auth/authSlice'

import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import JobsListPage from './pages/JobsListPage'
import JobDetailPage from './pages/JobDetailPage'
import CandidateDashboard from './pages/CandidateDashboard'
import RecruiterDashboard from './pages/RecruiterDashboard'
import AiReviewPage from './pages/AiReviewPage'
import NotFoundPage from './pages/NotFoundPage'

const PAGE_TITLES = {
  '/': 'Career Coach',
  '/login': 'Accedi - Career Coach',
  '/register': 'Registrati - Career Coach',
  '/jobs': 'Offerte - Career Coach',
  '/me': 'Dashboard - Career Coach',
  '/me/ai-review': 'AI Coach - Career Coach',
  '/recruiter': 'Recruiter - Career Coach',
}

export default function App() {
  const dispatch = useDispatch()
  const token = useSelector((s) => s.auth.token)
  const location = useLocation()

  useEffect(() => {
    if (token) dispatch(fetchMe())
    else dispatch(markBootstrapped())
  }, [token, dispatch])

  useEffect(() => {
    const path = location.pathname
    const title = PAGE_TITLES[path]
      || (path.startsWith('/jobs/') ? 'Offerta - Career Coach' : 'Career Coach')
    document.title = title
  }, [location.pathname])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/jobs" element={<JobsListPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />

        <Route element={<ProtectedRoute roles={['CANDIDATE','ADMIN']} />}>
          <Route path="/me" element={<CandidateDashboard />} />
          <Route path="/me/ai-review" element={<AiReviewPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={['RECRUITER','ADMIN']} />}>
          <Route path="/recruiter" element={<RecruiterDashboard />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
