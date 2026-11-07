// Owner: Pruthviraj
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import client from '../api/client.js'
import ProviderCard from '../components/ProviderCard.jsx'
import SearchBar from '../components/SearchBar.jsx'
import { categoryIcon } from '../components/providerHelpers.js'
import { Float } from '../components/shared.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const heroIcons = ['Plumbing', 'Electrical', 'Painting']

// Grey placeholder cards that shimmer while the first results load.
function LoadingCards() {
  return (
    <div className="provider-grid" aria-label="Loading providers">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div className="skeleton-card" key={n}>
          <div className="skeleton skeleton-top" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line short" />
          <div className="skeleton skeleton-line" />
        </div>
      ))}
    </div>
  )
}

export default function Services() {
  const { isCustomer, user } = useAuth()

  // The search lives in the URL, so a link like /services?category=Plumbing
  // works and the back button goes back to the last search.
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''

  const [keyword, setKeyword] = useState(q)
  const [categories, setCategories] = useState([])
  const [providers, setProviders] = useState(null) // null means still loading
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    client.get('/services/categories/').then((res) => setCategories(res.data)).catch(() => setCategories([]))
  }, [])

  // Keep the search box right when the URL changes, like after pressing back.
  useEffect(() => setKeyword(q), [q])

  useEffect(() => {
    let ignore = false // stops a slow old search replacing a newer one
    setLoading(true)
    setFailed(false)
    client
      .get('/services/providers/', { params: { q, category } })
      .then((res) => {
        if (!ignore) setProviders(res.data)
      })
      .catch(() => {
        if (!ignore) setFailed(true)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [q, category, attempt])

  const updateSearch = (nextKeyword, nextCategory) => {
    const params = {}
    if (nextKeyword.trim()) params.q = nextKeyword.trim()
    if (nextCategory) params.category = nextCategory
    // keepScroll tells App.jsx not to jump back to the top of the page.
    setSearchParams(params, { replace: true, state: { keepScroll: true } })
  }

  const clearSearch = () => {
    setKeyword('')
    updateSearch('', '')
  }

  const count = providers?.length ?? 0

  return (
    <>
      <section className="page-hero">
        <div className="container-xl position-relative">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <p className="eyebrow">{isCustomer ? `Welcome back, ${user.name}` : 'Our services'}</p>
            <h1 className="page-hero-title">
              Trusted pros, <span className="text-orange">close to home</span>
            </h1>
            <p className="hero-sub">Compare verified local providers and see their prices upfront.</p>

            <SearchBar
              keyword={keyword}
              category={category}
              categories={categories}
              onKeywordChange={setKeyword}
              onCategoryChange={(value) => updateSearch(keyword, value)}
              onSubmit={() => updateSearch(keyword, category)}
            />
          </motion.div>

          <div className="page-hero-icons d-none d-lg-block" aria-hidden="true">
            {heroIcons.map((name, i) => (
              <Float key={name} className={`page-hero-icon icon-${i + 1}`} delay={i * 0.7} distance={10} duration={4.5}>
                <img src={categoryIcon(name)} alt="" />
              </Float>
            ))}
          </div>
        </div>

        <svg className="wave wave-bottom" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 60 C 240 10, 480 10, 720 45 S 1200 90, 1440 30 V90 H0 Z" fill="#FFFFFF" />
        </svg>
      </section>

      <section className="container-xl services-results">
        <div className="category-pills" role="group" aria-label="Filter by category">
          <button
            type="button"
            className={`category-pill ${category === '' ? 'active' : ''}`}
            aria-pressed={category === ''}
            onClick={() => updateSearch(keyword, '')}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`category-pill ${category === c.name ? 'active' : ''}`}
              aria-pressed={category === c.name}
              onClick={() => updateSearch(keyword, c.name)}
            >
              <img src={categoryIcon(c.name)} alt="" width="26" height="26" />
              {c.name}
            </button>
          ))}
        </div>

        {failed && (
          <div className="empty-state">
            <h2>We couldn't load the providers</h2>
            <p>Check your connection and try again.</p>
            <button type="button" className="btn btn-orange btn-lg-pad" onClick={() => setAttempt(attempt + 1)}>Try again</button>
          </div>
        )}

        {!failed && providers === null && <LoadingCards />}

        {!failed && providers !== null && (
          <>
            <p className="results-count" aria-live="polite">
              {count === 1 ? '1 verified pro' : `${count} verified pros`}
              {category && ` in ${category}`}
              {q && ` for "${q}"`}
            </p>

            {count === 0 && !loading && (
              <motion.div className="empty-state" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <img src={categoryIcon('Handyman')} alt="" width="84" height="84" />
                <h2>No pros match that search</h2>
                <p>Try a different word, or look through all of our providers.</p>
                <button type="button" className="btn btn-orange btn-lg-pad" onClick={clearSearch}>See all providers</button>
              </motion.div>
            )}

            <div className={`provider-grid ${loading ? 'is-updating' : ''}`}>
              <AnimatePresence mode="popLayout">
                {providers.map((provider, i) => (
                  <motion.div
                    key={provider.id}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.45, delay: Math.min(i, 8) * 0.05, ease: [0.22, 1, 0.36, 1] } }}
                    exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                    transition={{ layout: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
                  >
                    <ProviderCard provider={provider} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </section>
    </>
  )
}
