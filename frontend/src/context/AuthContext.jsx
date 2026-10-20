import { createContext, useContext, useEffect, useState } from 'react'
import client from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // user: { id, username, role: 'customer' | 'provider' } or null for guests
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO (Haris): add the /api/accounts/me/ endpoint.
    client
      .get('/accounts/me/')
      .then((res) => setUser(res.data))
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
