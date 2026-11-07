import { createContext, useContext, useEffect, useState } from 'react'
import client from '../api/client.js'

const AuthContext = createContext(null)

// Where each kind of user lands after logging in.
export function homeFor(user) {
  if (user.role === 'provider') return '/dashboard'
  if (user.role === 'customer') return '/services'
  return '/'
}

export function AuthProvider({ children }) {
  // user: { id, name, email, role: 'customer' | 'provider' } or null for guests
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Ask Django if this browser already has a logged in session.
    client
      .get('/accounts/me/')
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const value = {
    user,
    setUser,
    loading,
    isCustomer: user?.role === 'customer',
    isProvider: user?.role === 'provider',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
