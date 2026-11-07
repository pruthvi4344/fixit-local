// Owner: Pruthviraj
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiArrowRight, FiBriefcase, FiCheck, FiMapPin } from 'react-icons/fi'
import { MdVerified } from 'react-icons/md'
import client from '../api/client.js'
import ProviderAvatar from '../components/ProviderAvatar.jsx'
import { categoryIcon, formatPrice } from '../components/providerHelpers.js'
import { Float, Reveal } from '../components/shared.jsx'
import { useAuth } from '../context/AuthContext.jsx'

function LoadingProfile() {
  return (
    <div className="container-xl page-body" aria-label="Loading provider">
      <div className="skeleton skeleton-profile" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line short" />
    </div>
  )
}

function ProfileMessage({ title, text }) {
  return (
    <div className="container-xl page-body">
      <div className="empty-state">
        <img src={categoryIcon('Handyman')} alt="" width="84" height="84" />
        <h1 className="h3">{title}</h1>
        <p>{text}</p>
        <Link to="/services" className="btn btn-orange btn-lg-pad">See all providers</Link>
      </div>
    </div>
  )
}

export default function ProviderDetail() {
  const { id } = useParams()
  const { isProvider } = useAuth()
  const [provider, setProvider] = useState(null)
  const [error, setError] = useState(null) // null, 'missing' or 'failed'

  useEffect(() => {
    let ignore = false
    setProvider(null)
    setError(null)
    client
      .get(`/services/providers/${id}/`)
      .then((res) => {
        if (!ignore) setProvider(res.data)
      })
      .catch((err) => {
        if (!ignore) setError(err.response?.status === 404 ? 'missing' : 'failed')
      })
    return () => {
      ignore = true
    }
  }, [id])

  if (error === 'missing') {
    return <ProfileMessage title="We couldn't find that provider" text="They may not be verified yet, or the link might be old." />
  }
  if (error === 'failed') {
    return <ProfileMessage title="Something went wrong" text="We couldn't load this profile. Please try again in a moment." />
  }
  if (!provider) return <LoadingProfile />

  const cheapest = provider.services[0] // Django sends these cheapest first
  const canBook = !isProvider // providers can look around, but only customers book

  return (
    <>
      <section className="page-hero profile-hero">
        <div className="container-xl position-relative">
          <Link to="/services" className="back-link"><FiArrowLeft /> All providers</Link>

          <motion.div
            className="profile-head"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProviderAvatar provider={provider} size={124} />
            <div>
              <span className="verified-pill"><MdVerified /> Verified professional</span>
              <h1 className="page-hero-title profile-name">{provider.name}</h1>
              <ul className="provider-meta profile-meta list-unstyled">
                <li><FiMapPin /> {provider.service_area}</li>
                <li><FiBriefcase /> {provider.years_experience} years of experience</li>
              </ul>
            </div>
          </motion.div>

          <div className="page-hero-icons d-none d-lg-block" aria-hidden="true">
            <Float className="page-hero-icon icon-1" distance={10} duration={4.5}>
              <img src={categoryIcon(provider.categories[0])} alt="" />
            </Float>
          </div>
        </div>

        <svg className="wave wave-bottom" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 60 C 240 10, 480 10, 720 45 S 1200 90, 1440 30 V90 H0 Z" fill="#FFFFFF" />
        </svg>
      </section>

      <div className="container-xl profile-layout">
        <div>
          <Reveal as="section" className="profile-section">
            <h2>About</h2>
            <p className="profile-bio">{provider.bio}</p>
            <div className="category-tags">
              {provider.categories.map((name) => (
                <span className="category-tag" key={name}>
                  <img src={categoryIcon(name)} alt="" width="22" height="22" /> {name}
                </span>
              ))}
            </div>
          </Reveal>

          <section className="profile-section">
            <h2>Services and prices</h2>
            {provider.services.length === 0 && <p className="text-muted">This provider hasn't listed any services yet.</p>}

            <ul className="service-list list-unstyled">
              {provider.services.map((service, i) => (
                <motion.li
                  key={service.id}
                  className="service-row"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <img src={categoryIcon(service.category)} alt="" width="42" height="42" />
                  <div className="service-row-text">
                    <strong>{service.title}</strong>
                    <small>{service.category}</small>
                  </div>
                  <span className="service-row-price">{formatPrice(service.price)}</span>
                  {canBook && (
                    <Link to={`/book/${service.id}`} className="btn btn-outline-nav service-row-book" aria-label={`Book ${service.title}`}>
                      Book
                    </Link>
                  )}
                </motion.li>
              ))}
            </ul>
          </section>
        </div>

        <aside>
          <Reveal from="right" className="book-card">
            {cheapest && (
              <>
                <small className="book-card-label">Services from</small>
                <div className="book-card-price">{formatPrice(cheapest.price)}</div>
              </>
            )}
            <ul className="trust-list list-unstyled">
              <li><span className="check"><FiCheck /></span> ID reviewed by FixIt Local</li>
              <li><span className="check"><FiCheck /></span> {provider.years_experience} years of experience</li>
              <li><span className="check"><FiCheck /></span> Prices shown upfront</li>
            </ul>
            {cheapest && canBook && (
              <Link to={`/book/${cheapest.id}`} className="btn btn-orange btn-lg-pad w-100">
                Book {provider.name.split(' ')[0]} <FiArrowRight />
              </Link>
            )}
          </Reveal>
        </aside>
      </div>
    </>
  )
}
