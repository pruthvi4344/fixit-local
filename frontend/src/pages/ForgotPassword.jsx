import { useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import client from '../api/client.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    client
      .post('/accounts/password_reset/', { email })
      .then(() => setSubmitted(true))
      .catch((err) => setError(err.response?.data?.detail || 'Something went wrong. Please try again.'))
      .finally(() => setLoading(false))
  }

  if (submitted) {
    return (
      <div className="container py-5" style={{ maxWidth: '500px' }}>
        <Alert variant="success">
          If an account exists with <strong>{email}</strong>, we have sent instructions to reset your password. Please check your inbox.
        </Alert>
      </div>
    )
  }

  return (
    <div className="container py-5" style={{ maxWidth: '500px' }}>
      <h2 className="mb-4">Forgot Password</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="forgotEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="orange" className="btn-orange w-100" type="submit" disabled={loading}>
          {loading ? 'Sending link...' : 'Send Reset Link'}
        </Button>
      </Form>
    </div>
  )
}