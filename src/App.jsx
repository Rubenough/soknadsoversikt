import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ui/ErrorBoundary'
import { Analytics } from "@vercel/analytics/react"

const LandingPage   = lazy(() => import('./pages/LandingPage'))
const LoginPage     = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const PrivacyPage   = lazy(() => import('./pages/PrivacyPage'))
const NotFoundPage  = lazy(() => import('./pages/NotFoundPage'))

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center" role="status" aria-label="Laster…">
      <div className="flex flex-col items-center gap-3">
        <span className="text-3xl opacity-60 animate-pulse" aria-hidden="true">📋</span>
        <p className="text-sm text-[#64748B] font-medium">Laster…</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"          element={<LandingPage />} />
            <Route path="/login"     element={<LoginPage />} />
            <Route path="/personvern" element={<PrivacyPage />} />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <Analytics />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
