// Owner: Haris
import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, Button, Form } from 'react-bootstrap'
import client from '../api/client.js'
import FieldError from '../components/FieldError.jsx'
import { homeFor, useAuth } from '../context/AuthContext.jsx'

const roles = [
  { value: 'customer', label: 'Customer', hint: 'I need help at home' },
  { value: 'provider', label: 'Service Provider', hint: 'I offer a service' },
]

export default function Signup() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: searchParams.get('role') === 'provider' ? 'provider' : 'customer',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // One handler for every text box, it uses the input's name.
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    client
      .post('/accounts/register/', form)
      .then((res) => navigate('/login', { state: { message: res.data.message } }))
      .catch((err) => {
        setErrors(err.response?.data ?? { detail: 'Something went wrong, please try again.' })
        setSaving(false)
      })
  }

  // Already logged in, no need to register.
  if (user) return <Navigate to={homeFor(user)} replace />

  return (
    <div className="auth-card">
      <h1 className="h3 mb-3">Create your account</h1>
      {errors.detail && <Alert variant="danger">{errors.detail}</Alert>}

      <Form onSubmit={handleSubmit}>
        <div className="role-picker" role="group" aria-label="Account type">
          {roles.map((r) => (
            <button
              key={r.value}
              type="button"
              className={`role-option ${form.role === r.value ? 'selected' : ''}`}
              aria-pressed={form.role === r.value}
              onClick={() => setForm({ ...form, role: r.value })}
            >
              {r.label}
              <small>{r.hint}</small>
            </button>
          ))}
        </div>

        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control name="name" value={form.name} onChange={handleChange} autoComplete="name" required />
          <FieldError errors={errors} name="name" />
        </Form.Group>

        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" required />
          <FieldError errors={errors} name="email" />
        </Form.Group>

        <Form.Group className="mb-3" controlId="phone">
          <Form.Label>Phone</Form.Label>
          <Form.Control type="tel" name="phone" value={form.phone} onChange={handleChange} autoComplete="tel" required />
          <FieldError errors={errors} name="phone" />
        </Form.Group>

        <Form.Group className="mb-4" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" name="password" value={form.password} onChange={handleChange} autoComplete="new-password" required />
          <Form.Text>At least 8 characters.</Form.Text>
          <FieldError errors={errors} name="password" />
        </Form.Group>

        <Button type="submit" className="btn-orange w-100 py-2" disabled={saving}>
          {saving ? 'Creating account...' : 'Sign Up'}
        </Button>
      </Form>

      <p className="text-center mt-3 mb-0">
        Already have an account? <Link to="/login" className="text-orange">Log in</Link>
      </p>
    </div>
  )
}
