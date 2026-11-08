import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiClock, FiSearch, FiTrash2 } from 'react-icons/fi'
import client from '../api/client.js'
import ProviderCard from '../components/ProviderCard.jsx'

// "My History": today's visits, recent searches and viewed providers. Owner: Deep
export default function UserHistory() {
  const [history, setHistory] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    client.get('/history/').then((res) => setHistory(res.data)).catch(() => setFailed(true))
  }, [])

  const clearHistory = () => {
    client.delete('/history/').then(() =>
      setHistory((h) => ({ ...h, searches: [], viewed_providers: [] })),
    )
  }

  const searchLink = (s) => {
    const params = new URLSearchParams()
    if (s.q) params.set('q', s.q)
    if (s.category) params.set('category', s.category)
    return `/services?${params.toString()}`
  }

  if (failed) {
    return (
      <div className="container-xl page-body">
        <h1>My history</h1>
        <p>We couldn't load your history. Please try again.</p>
      </div>
    )
  }

  if (history === null) {
    return <div className="container-xl page-body"><h1>My history</h1><p>Loading…</p></div>
  }

  const hasItems = history.searches.length > 0 || history.viewed_providers.length > 0

  return (
    <div className="container-xl page-body">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <h1 className="mb-0">My history</h1>
        {hasItems && (
          <button type="button" className="btn btn-outline-secondary" onClick={clearHistory}>
            <FiTrash2 className="me-1" /> Clear history
          </button>
        )}
      </div>

      <p className="fs-5">
        <FiClock className="text-orange me-2" />
        You've visited FixIt Local <strong>{history.visits_today}</strong>{' '}
        {history.visits_today === 1 ? 'time' : 'times'} today.
      </p>

      <h2 className="h4 mt-5 mb-3">Recent searches</h2>
      {history.searches.length === 0 ? (
        <p className="text-muted">No searches yet. <Link to="/services">Find a pro</Link></p>
      ) : (
        <div className="category-pills">
          {history.searches.map((s, i) => (
            <Link key={i} to={searchLink(s)} className="category-pill">
              <FiSearch />
              {s.q || 'All'}
              {s.category && ` in ${s.category}`}
            </Link>
          ))}
        </div>
      )}

      <h2 className="h4 mt-5 mb-3">Providers you viewed</h2>
      {history.viewed_providers.length === 0 ? (
        <p className="text-muted">You haven't opened any provider profiles yet.</p>
      ) : (
        <div className="provider-grid">
          {history.viewed_providers.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      )}
    </div>
  )
}