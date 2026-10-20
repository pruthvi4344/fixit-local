import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Dropdown } from 'react-bootstrap'
import { FiMapPin, FiChevronDown, FiMenu, FiX, FiUser } from 'react-icons/fi'
import { Logo } from './shared.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import client from '../api/client.js'

// Hash links scroll to sections on the home page; the rest are their own pages.
const links = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/#services' },
  { label: 'How It Works', to: '/#how-it-works' },
  { label: 'For Providers', to: '/#providers' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

const customerLinks = [
  { label: 'My Bookings', to: '/my-bookings' },
  { label: 'Favourites', to: '/favourites' },
  { label: 'History', to: '/history' },
]

const providerLinks = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'History', to: '/history' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()
  const { user, setUser, isProvider } = useAuth()

  const current = pathname + hash
  const active = links.find((l) => l.to === current)?.label ?? (pathname === '/' ? 'Home' : null)
  const accountLinks = isProvider ? providerLinks : customerLinks

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [current])

  const logout = () => {
    // TODO (Haris): add the /api/accounts/logout/ endpoint.
    client.post('/accounts/logout/').finally(() => {
      setUser(null)
      navigate('/')
    })
  }

  return (
    <motion.header
      className={`site-nav ${scrolled || open ? 'is-scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="container-xl d-flex align-items-center gap-3">
        <Logo />

        <nav className="nav-links d-none d-lg-flex" aria-label="Main">
          {links.map((l) => (
            <Link key={l.label} to={l.to} className={active === l.label ? 'active' : ''}>
              {l.label}
              {active === l.label && <motion.span layoutId="nav-underline" className="nav-underline" />}
            </Link>
          ))}
        </nav>

        <div className="ms-auto d-none d-lg-flex align-items-center gap-2">
          <button className="location-pill" type="button">
            <FiMapPin className="text-orange" /> Windsor, ON <FiChevronDown className="opacity-50" />
          </button>
          {user ? (
            <Dropdown align="end">
              <Dropdown.Toggle variant="" className="btn-outline-nav d-inline-flex align-items-center gap-2">
                <FiUser /> {user.username}
              </Dropdown.Toggle>
              <Dropdown.Menu className="account-menu">
                {accountLinks.map((l) => (
                  <Dropdown.Item key={l.to} as={Link} to={l.to}>{l.label}</Dropdown.Item>
                ))}
                <Dropdown.Divider />
                <Dropdown.Item as="button" onClick={logout}>Log out</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-nav">Login</Link>
              <Link to="/signup" className="btn btn-orange btn-sm-pad">Sign Up</Link>
            </>
          )}
        </div>

        <button
          className="menu-toggle d-lg-none ms-auto"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            className="mobile-menu d-lg-none"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            aria-label="Mobile"
          >
            <div className="container-xl py-3 d-flex flex-column gap-1">
              {links.map((l) => (
                <Link key={l.label} to={l.to}>{l.label}</Link>
              ))}
              {user && accountLinks.map((l) => (
                <Link key={l.to} to={l.to}>{l.label}</Link>
              ))}
              <div className="d-flex gap-2 pt-2">
                {user ? (
                  <button type="button" className="btn btn-outline-nav flex-fill" onClick={logout}>Log out</button>
                ) : (
                  <>
                    <Link to="/login" className="btn btn-outline-nav flex-fill">Login</Link>
                    <Link to="/signup" className="btn btn-orange flex-fill">Sign Up</Link>
                  </>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
