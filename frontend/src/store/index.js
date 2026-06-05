import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import jobsReducer from '../features/jobs/jobsSlice'
import applicationsReducer from '../features/applications/applicationsSlice'
import resumesReducer from '../features/resumes/resumesSlice'
import aiReducer from '../features/ai/aiSlice'
import companiesReducer from '../features/companies/companiesSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobsReducer,
    applications: applicationsReducer,
    resumes: resumesReducer,
    ai: aiReducer,
    companies: companiesReducer,
  },
})
