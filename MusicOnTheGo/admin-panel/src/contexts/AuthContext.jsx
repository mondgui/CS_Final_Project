import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await api.get('/api/users/me')
      if (response.data.role === 'admin') {
        setUser(response.data)
      } else {
        localStorage.removeItem('admin_token')
        setUser(null)
      }
    } catch (error) {
      localStorage.removeItem('admin_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password })
    const { token, user: userData } = response.data
    
    if (userData.role !== 'admin') {
      throw new Error('Access denied. Admin role required.')
    }
    
    localStorage.setItem('admin_token', token)
    setUser(userData)
    return { token, user: userData }
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
