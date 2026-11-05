// The page customers land on after logging in.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client.js'
import ProviderCard from '../components/ProviderCard.jsx'
import SearchBar from '../components/SearchBar.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const shortcuts = [
  { label: 'My Bookings', to: '/my-bookings' },
  { label: 'Favourites', to: '/favourites' },
  { label: 'History', to: '/history' },
]

export default function CustomerHome() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [providers, setProviders] = useState([])
  const [error, setError] = useState('')

  // The API only ever returns verified providers.
  const search = ({ keyword = '', category = '' } = {}) => {
    setError('')
    client
      .get('/accounts/providers/', { params: { q: keyword, category } })
      .then((res) => setProviders(res.data))
      .catch(() => setError('Could not load providers, please try again.'))
  }

  useEffect(() => {
    client.get('/services/categories/').then((res) => setCategories(res.data))
    search()
  }, [])

  return (
    <div>
      <h1>Hi {user.name}</h1>
      <p className="text-muted">What do you need help with today?</p>

      <div className="d-flex flex-wrap gap-2 mb-4">
        {shortcuts.map((s) => (
          <Link key={s.to} to={s.to} className="btn btn-outline-nav">{s.label}</Link>
        ))}
      </div>

      <SearchBar categories={categories} onSearch={search} />

      {error && <p className="text-danger mt-3">{error}</p>}
      {!error && providers.length === 0 && <p className="text-muted mt-4">No verified providers found yet.</p>}

      <div className="row g-3 mt-2">
        {providers.map((provider) => (
          <div className="col-md-6 col-lg-4" key={provider.id}>
            <ProviderCard provider={provider} />
          </div>
        ))}
      </div>
    </div>
  )
}
