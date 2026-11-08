// Owner: Devarsh
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button } from 'react-bootstrap'
import { FiClock } from 'react-icons/fi'
import client from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatDate, formatTime } from './bookingHelpers.js'

// Free time slots on a provider profile. Customers pick one and click Book.
export default function SlotPicker({ providerId }) {
  const { user, isProvider } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [slots, setSlots] = useState(null)
  const [selected, setSelected] = useState(null)
  const [booking, setBooking] = useState(false)
  const [message, setMessage] = useState(null) // { variant, text }

  const loadSlots = () =>
    client
      .get(`/bookings/providers/${providerId}/slots/`)
      .then((res) => setSlots(res.data))
      .catch(() => setSlots([]))

  useEffect(() => {
    loadSlots()
  }, [providerId])

  const handleBook = () => {
    if (!selected) return
    // Guests log in first, then come straight back to this profile.
    if (!user) {
      navigate('/login', { state: { from: location } })
      return
    }
    setBooking(true)
    setMessage(null)
    client
      .post('/bookings/', { slot: selected })
      .then(() => {
        setSelected(null)
        setMessage({ variant: 'success', text: 'Booked! The provider will confirm soon.' })
      })
      .catch((err) =>
        setMessage({ variant: 'danger', text: err.response?.data?.detail ?? 'Could not book this slot, please try again.' })
      )
      .finally(() => {
        setBooking(false)
        loadSlots()
      })
  }

  // Group the slots by date.
  const byDate = (slots ?? []).reduce((groups, slot) => {
    ;(groups[slot.date] ??= []).push(slot)
    return groups
  }, {})

  return (
    <section className="profile-section" id="book">
      <h2>Book a time</h2>
      {message && (
        <Alert variant={message.variant}>
          {message.text}{' '}
          {message.variant === 'success' && <Link to="/my-bookings">See my bookings</Link>}
        </Alert>
      )}
      {slots === null && <p className="text-muted">Loading available times...</p>}
      {slots !== null && slots.length === 0 && (
        <p className="text-muted">No free times right now. Please check back soon.</p>
      )}

      {Object.entries(byDate).map(([date, daySlots]) => (
        <div key={date} className="mb-3">
          <strong>{formatDate(date)}</strong>
          <div className="d-flex flex-wrap gap-2 mt-2">
            {daySlots.map((slot) => (
              <Button
                key={slot.id}
                size="sm"
                variant={selected === slot.id ? 'dark' : 'outline-secondary'}
                disabled={isProvider}
                onClick={() => setSelected(slot.id)}
                aria-pressed={selected === slot.id}
              >
                <FiClock /> {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
              </Button>
            ))}
          </div>
        </div>
      ))}

      {slots?.length > 0 && !isProvider && (
        <Button className="btn-orange mt-2" disabled={!selected || booking} onClick={handleBook}>
          {booking ? 'Booking...' : user ? 'Book' : 'Log in to book'}
        </Button>
      )}
    </section>
  )
}
