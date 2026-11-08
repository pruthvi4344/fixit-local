// Owner: Devarsh

// "2026-11-09" -> "Mon, Nov 9" (built from parts so the timezone can't shift the day)
export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

// "14:30:00" -> "2:30 PM"
export function formatTime(value) {
  const [h, m] = value.split(':').map(Number)
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export const statusVariant = { pending: 'warning', accepted: 'success' }
