import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import { FaStar, FaQuoteRight } from 'react-icons/fa'
import { Reveal, SectionTitle } from '../shared.jsx'

// Placeholder reviews for the demo. Replace with real reviews from the Review model.
const reviews = [
  { name: 'Sarah M.', role: 'Homeowner', color: '#F26B1D', text: 'The booking process was super easy and the professional was on time and did an excellent job. Highly recommend!' },
  { name: 'James T.', role: 'Homeowner', color: '#14213D', text: 'I found a reliable plumber through FixIt Local. Great service and fair pricing.' },
  { name: 'Priya K.', role: 'Homeowner', color: '#2E8B57', text: 'FixIt Local made it simple to find trusted help for my home. Will definitely use again!' },
  { name: 'Daniel R.', role: 'Homeowner', color: '#7B4DD8', text: 'Booked an electrician for the same day. Clear price upfront and no surprises at the end.' },
  { name: 'Aisha N.', role: 'Homeowner', color: '#D7263D', text: 'Loved seeing photos of past work before booking. The cleaner was friendly and thorough.' },
]

function initials(name) {
  return name.split(' ').map((p) => p[0]).join('').replace('.', '')
}

function usePerPage() {
  const get = () => (window.innerWidth >= 992 ? 3 : window.innerWidth >= 768 ? 2 : 1)
  const [n, setN] = useState(typeof window === 'undefined' ? 3 : get())
  useEffect(() => {
    const on = () => setN(get())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return n
}

export default function Testimonials() {
  const perPage = usePerPage()
  const [start, setStart] = useState(0)
  const [dir, setDir] = useState(1)
  const [paused, setPaused] = useState(false)

  const go = (d) => {
    setDir(d)
    setStart((s) => (s + d + reviews.length) % reviews.length)
  }

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => go(1), 6000)
    return () => clearInterval(t)
  }, [paused])

  const visible = Array.from({ length: perPage }, (_, i) => reviews[(start + i) % reviews.length])

  return (
    <section className="section testimonials" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="container-xl">
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
          <SectionTitle eyebrow="What People Say" sub="Real experiences from people who used FixIt Local.">
            Trusted by <span className="text-orange">Homeowners</span>
            <br />in the Community
          </SectionTitle>
          <Reveal from="right" className="d-flex gap-2">
            <button className="round-btn round-btn-outline" onClick={() => go(-1)} aria-label="Previous review"><FiArrowLeft /></button>
            <button className="round-btn round-btn-solid" onClick={() => go(1)} aria-label="Next review"><FiArrowRight /></button>
          </Reveal>
        </div>

        <div className="review-row">
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            {visible.map((r) => (
              <motion.article
                key={r.name}
                className="review-card"
                layout
                custom={dir}
                initial={{ opacity: 0, x: dir * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -60 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                <FaQuoteRight className="quote-mark" aria-hidden="true" />
                <div className="d-flex align-items-center gap-3 mb-3">
                  <span className="avatar" style={{ background: r.color }}>{initials(r.name)}</span>
                  <div>
                    <strong className="d-block">{r.name}</strong>
                    <small className="text-muted">{r.role}</small>
                    <div className="stars" aria-label="5 out of 5 stars">
                      {Array.from({ length: 5 }).map((_, i) => <FaStar key={i} />)}
                    </div>
                  </div>
                </div>
                <p className="mb-0">“{r.text}”</p>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
        <p className="sample-note">Sample reviews shown for the demo.</p>
      </div>
    </section>
  )
}
