import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import AppSelector from './pages/AppSelector'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-mana-gradient flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full spinner" />
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function PublicRoute({ children }) {
  const { user, loading, getAccessibleSystems } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-mana-gradient flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full spinner" />
      </div>
    )
  }
  
  // If logged in, redirect to app selector or single app
  if (user) {
    const systems = getAccessibleSystems()
    
    if (systems.length === 1) {
      // Auto-redirect to single system
      window.location.href = systems[0].url
      return (
        <div className="min-h-screen bg-mana-gradient flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full spinner mx-auto mb-4" />
            <p>Redirecting to {systems[0].name}...</p>
          </div>
        </div>
      )
    }
    
    return <Navigate to="/" replace />
  }
  
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <AppSelector />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
