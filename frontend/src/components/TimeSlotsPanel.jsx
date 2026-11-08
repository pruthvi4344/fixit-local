// Owner: Devarsh
import { useEffect, useState } from 'react'
import { Alert, Badge, Button, Card, Form, Table } from 'react-bootstrap'
import client from '../api/client.js'
import FieldError from './FieldError.jsx'
import { formatDate, formatTime } from './bookingHelpers.js'

// Dashboard section where the provider adds the dates and times they're free.
export default function TimeSlotsPanel() {
  const [slots, setSlots] = useState([])
  const [form, setForm] = useState({ date: '', start_time: '', end_time: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const load = () =>
    client
      .get('/bookings/my-slots/')
      .then((res) => setSlots(res.data))
      .catch(() => setErrors({ detail: 'Could not load your time slots.' }))

  useEffect(() => {
    load()
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    client
      .post('/bookings/my-slots/', form)
      .then(() => {
        setForm({ ...form, start_time: '', end_time: '' }) // keep the date to add several slots quickly
        load()
      })
      .catch((err) => setErrors(err.response?.data ?? { detail: 'Could not add the slot.' }))
      .finally(() => setSaving(false))
  }

  const handleDelete = (id) => {
    client
      .delete(`/bookings/my-slots/${id}/`)
      .then(load)
      .catch((err) => setErrors({ detail: err.response?.data?.detail ?? 'Could not remove the slot.' }))
  }

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="bg-white py-3">
        <h2 className="h5 mb-0">My available time slots</h2>
      </Card.Header>
      <Card.Body>
        {errors.detail && <Alert variant="danger">{errors.detail}</Alert>}
        {errors.non_field_errors && <Alert variant="danger">{errors.non_field_errors}</Alert>}

        <Form onSubmit={handleSubmit} className="row g-2 align-items-start mb-3">
          <Form.Group className="col-md-4" controlId="slot_date">
            <Form.Label>Date</Form.Label>
            <Form.Control type="date" name="date" value={form.date} onChange={handleChange} required />
            <FieldError errors={errors} name="date" />
          </Form.Group>
          <Form.Group className="col-md-3" controlId="slot_start">
            <Form.Label>From</Form.Label>
            <Form.Control type="time" name="start_time" value={form.start_time} onChange={handleChange} required />
            <FieldError errors={errors} name="start_time" />
          </Form.Group>
          <Form.Group className="col-md-3" controlId="slot_end">
            <Form.Label>To</Form.Label>
            <Form.Control type="time" name="end_time" value={form.end_time} onChange={handleChange} required />
            <FieldError errors={errors} name="end_time" />
          </Form.Group>
          <div className="col-md-2 d-flex align-items-end" style={{ minHeight: 62 }}>
            <Button type="submit" className="btn-orange w-100" disabled={saving}>
              {saving ? 'Adding...' : 'Add slot'}
            </Button>
          </div>
        </Form>

        {slots.length === 0 ? (
          <p className="text-muted mb-0">No upcoming slots yet. Add the times you're free above.</p>
        ) : (
          <Table responsive striped className="mb-0 align-middle">
            <thead>
              <tr><th>Date</th><th>Time</th><th>Status</th><th className="text-end">Actions</th></tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id}>
                  <td>{formatDate(slot.date)}</td>
                  <td>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</td>
                  <td>{slot.is_booked ? <Badge bg="secondary">Booked</Badge> : <Badge bg="success">Free</Badge>}</td>
                  <td className="text-end">
                    {!slot.is_booked && (
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(slot.id)}>Remove</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  )
}
