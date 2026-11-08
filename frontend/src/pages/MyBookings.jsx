// Owner: Devarsh
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Badge, Table } from 'react-bootstrap'
import client from '../api/client.js'
import { formatDate, formatTime, statusVariant } from '../components/bookingHelpers.js'

export default function MyBookings() {
  const [bookings, setBookings] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    client
      .get('/bookings/mine/')
      .then((res) => setBookings(res.data))
      .catch(() => setError('Could not load your bookings, please refresh the page.'))
  }, [])

  if (error) return <Alert variant="danger">{error}</Alert>
  if (!bookings) return <p>Loading...</p>

  return (
    <div>
      <h1 className="h3 mb-3">My bookings</h1>
      {bookings.length === 0 ? (
        <p className="text-muted">
          You haven't booked anything yet. <Link to="/services">Find a provider</Link>
        </p>
      ) : (
        <Table responsive hover className="align-middle">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td><Link to={`/providers/${b.provider_id}`}>{b.provider_name}</Link></td>
                <td>{formatDate(b.date)}</td>
                <td>{formatTime(b.start_time)} - {formatTime(b.end_time)}</td>
                <td><Badge bg={statusVariant[b.status] ?? 'secondary'}>{b.status_label}</Badge></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  )
}
