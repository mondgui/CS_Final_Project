import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Bookings from './pages/Bookings'
import Messages from './pages/Messages'
import Inquiries from './pages/Inquiries'
import SupportTickets from './pages/SupportTickets'
import BulkMessaging from './pages/BulkMessaging'
import CommunityPosts from './pages/CommunityPosts'
import Resources from './pages/Resources'
import PracticeSessions from './pages/PracticeSessions'
import Analytics from './pages/Analytics'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="messages" element={<Messages />} />
        <Route path="inquiries" element={<Inquiries />} />
        <Route path="support-tickets" element={<SupportTickets />} />
        <Route path="bulk-messaging" element={<BulkMessaging />} />
        <Route path="community-posts" element={<CommunityPosts />} />
        <Route path="resources" element={<Resources />} />
        <Route path="practice-sessions" element={<PracticeSessions />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
