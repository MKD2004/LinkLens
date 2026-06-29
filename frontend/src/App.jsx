import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import AnimatedSphere from './components/landing/AnimatedSphere'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppContent() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (location.pathname === '/') {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F8F5] hero-grid">
      {/* Ambient sphere — fixed to bottom-right, decorative only */}
      <div
        className="pointer-events-none fixed bottom-0 right-0 z-0"
        style={{ width: 340, height: 340, opacity: 0.18 }}
        aria-hidden="true"
      >
        <AnimatedSphere />
      </div>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/analytics/:shortId" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}
