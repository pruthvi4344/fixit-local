// Owner: Devarsh
import { useEffect, useState } from 'react'
import { Alert, Badge, Button, Card, Table } from 'react-bootstrap'
import client from '../api/client.js'
import { formatDate, formatTime, statusVariant } from './bookingHelpers.js'

// Dashboard section: new bookings from customers, with an Accept button.
export default function ProviderBookingsPanel() {
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')

  const load = () =>
    client
      .get('/bookings/incoming/')
      .then((res) => setBookings(res.data))
      .catch(() => setError('Could not load your bookings.'))

  useEffect(() => {
    load()
  }, [])

  const handleAccept = (id) => {
    setError('')
    client
      .post(`/bookings/${id}/accept/`)
      .then(load)
      .catch(() => setError('Could not accept this booking, please try again.'))
  }

  const pending = bookings.filter((b) => b.status === 'pending').length

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="bg-white py-3">
        <h2 className="h5 mb-0">
          Bookings {pending > 0 && <Badge bg="warning" text="dark" className="ms-2">{pending} new</Badge>}
        </h2>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {bookings.length === 0 ? (
          <p className="text-muted mb-0">No bookings yet. Customers can book once you add time slots.</p>
        ) : (
          <Table responsive striped className="mb-0 align-middle">
            <thead>
              <tr><th>Customer</th><th>Date</th><th>Time</th><th>Status</th><th className="text-end">Actions</th></tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.customer_name}</td>
                  <td>{formatDate(b.date)}</td>
                  <td>{formatTime(b.start_time)} - {formatTime(b.end_time)}</td>
                  <td><Badge bg={statusVariant[b.status] ?? 'secondary'}>{b.status_label}</Badge></td>
                  <td className="text-end">
                    {b.status === 'pending' && (
                      <Button size="sm" variant="success" onClick={() => handleAccept(b.id)}>Accept</Button>
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
