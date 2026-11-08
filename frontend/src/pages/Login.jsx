// Owner: Haris
import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Alert, Button, Form } from 'react-bootstrap'
import client from '../api/client.js'
import { homeFor, useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { user, setUser } = useAuth()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    client
      .post('/accounts/login/', { email, password })
      .then((res) => setUser(res.data.user)) // the check below then sends them to their page
      .catch((err) => {
        setError(err.response?.data?.detail ?? 'Something went wrong, please try again.')
        setSaving(false)
      })
  }

  // Customers go to their page and providers go to the dashboard.
  // Guests sent here from a protected page (or the Book button) go back there.
  const from = location.state?.from
  if (user) return <Navigate to={from ? from.pathname + (from.search ?? '') : homeFor(user)} replace />

  return (
    <div className="auth-card">
      <h1 className="h3 mb-3">Log in</h1>

      {/* "Account created, please log in" comes from the sign up page. */}
      {location.state?.message && <Alert variant="success">{location.state.message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </Form.Group>

        <Form.Group className="mb-4" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </Form.Group>

        <Button type="submit" className="btn-orange w-100 py-2" disabled={saving}>
          {saving ? 'Logging in...' : 'Log In'}
        </Button>
      </Form>

      <p className="text-center mt-3 mb-0">
        New here? <Link to="/signup" className="text-orange">Create an account</Link>
      </p>
    </div>
  )
}
