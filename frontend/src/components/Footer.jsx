import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa'
import { Logo } from './shared.jsx'

const quick = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/#services' },
  { label: 'How It Works', to: '/#how-it-works' },
  { label: 'For Providers', to: '/#providers' },
  { label: 'About', to: '/about' },
  { label: 'Our Team', to: '/team' },
  { label: 'Contact', to: '/contact' },
]
const popular = ['Plumbing', 'Electrical', 'Cleaning', 'Painting', 'Carpentry', 'Appliance Repair', 'HVAC', 'Landscaping', 'Pest Control', 'All Services']
const socials = [
  { icon: <FaFacebookF />, label: 'Facebook' },
  { icon: <FaInstagram />, label: 'Instagram' },
  { icon: <FaLinkedinIn />, label: 'LinkedIn' },
  { icon: <FaYoutube />, label: 'YouTube' },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <footer className="site-footer">
      <div className="container-xl">
        <div className="row g-4 py-5">
          <div className="col-lg-4">
            <Logo />
            <p className="footer-about">
              Connecting homeowners with trusted local service providers. Simple, reliable, and built for your community.
            </p>
            <div className="d-flex gap-2">
              {socials.map((s) => (
                <motion.a key={s.label} href="#" className="social" aria-label={s.label} whileHover={{ y: -3 }}>
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h3 className="footer-head">Quick Links</h3>
            <ul className="list-unstyled footer-links">
              {quick.map((q) => <li key={q.label}><Link to={q.to}>{q.label}</Link></li>)}
            </ul>
          </div>

          <div className="col-6 col-md-4 col-lg-3">
            <h3 className="footer-head">Popular Services</h3>
            <ul className="list-unstyled footer-links two-col">
              {popular.map((p) => <li key={p}><Link to="/#services">{p}</Link></li>)}
            </ul>
          </div>

          <div className="col-md-5 col-lg-3">
            <h3 className="footer-head">Newsletter</h3>
            <p className="footer-small">Get the latest updates and tips.</p>
            <form
              className="newsletter"
              onSubmit={(e) => { e.preventDefault(); if (email) setSent(true) }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setSent(false) }}
                aria-label="Email address"
                required
              />
              <motion.button type="submit" className="btn btn-orange" whileTap={{ scale: 0.9 }} aria-label="Subscribe">
                <FiArrowRight />
              </motion.button>
            </form>
            {sent && <small className="text-success d-block mt-2">Thanks! You're subscribed.</small>}
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} FixIt Local · Group 9. All rights reserved.</span>
          <div className="d-flex gap-4">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
